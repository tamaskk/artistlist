import { useEffect, useState } from 'react';
import { getAllEvents } from '@/service/artist.service';
import { MUSIC_GENRES } from '@/lib/genres';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, MusicalNoteIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface EventWithArtist {
  name: string;
  date: Date;
  location: string;
  artistId: string;
  artistName: string;
  artistConcept: string;
  artistLocation: string;
  artistImage?: string;
}

type SortField = 'date' | 'artistName' | 'location';
type SortDirection = 'asc' | 'desc';

export default function Events() {
  const [events, setEvents] = useState<EventWithArtist[] | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<EventWithArtist[] | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [genreSearchTerm, setGenreSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getAllEvents();
        if (response.ok) {
          setEvents(response.events);
          setFilteredEvents(response.events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const removeGenre = (genre: string) => {
    setSelectedGenres(prev => prev.filter(g => g !== genre));
  };

  // Filter genres based on search term
  const filteredGenres = MUSIC_GENRES.filter(genre => {
    if (!genreSearchTerm.trim()) return true;
    
    const searchWords = genreSearchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
    const genreLower = genre.toLowerCase();
    
    if (searchWords.length === 1) {
      return genreLower.includes(searchWords[0]);
    }
    
    return searchWords.every(word => genreLower.includes(word));
  });

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.genre-dropdown')) {
        setIsGenreDropdownOpen(false);
      }
    };

    if (isGenreDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGenreDropdownOpen]);

  // Sort and filter events
  useEffect(() => {
    if (!events) return;

    let filtered = [...events];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.artistLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(event => {
        const artistGenres = event.artistConcept.split(',').map(g => g.trim().toLowerCase());
        return selectedGenres.some(selectedGenre => 
          artistGenres.includes(selectedGenre.toLowerCase())
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'artistName':
          aValue = a.artistName.toLowerCase();
          bValue = b.artistName.toLowerCase();
          break;
        case 'location':
          aValue = a.location.toLowerCase();
          bValue = b.location.toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEvents(filtered);
  }, [events, sortField, sortDirection, searchTerm, selectedGenres]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const formatDate = (date: Date) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 pt-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover live music events and performances from talented artists
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Events
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by event name, artist, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Genre Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Music Genres
              </label>
              
              {/* Selected Genres Display */}
              {selectedGenres.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedGenres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors"
                      onClick={() => removeGenre(genre)}
                    >
                      {genre}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Genre Dropdown */}
              <div className="relative genre-dropdown">
                <button
                  type="button"
                  onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                  className="block w-full p-3 text-left text-gray-700 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                >
                  {selectedGenres.length === 0 
                    ? 'Select music genres...' 
                    : `${selectedGenres.length} genre${selectedGenres.length !== 1 ? 's' : ''} selected`
                  }
                  <svg 
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isGenreDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-3">
                      <input
                        type="text"
                        placeholder="Search genres..."
                        value={genreSearchTerm}
                        onChange={(e) => setGenreSearchTerm(e.target.value)}
                        className="w-full p-2 border text-black border-gray-300 rounded-md text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {filteredGenres.map((genre) => (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => handleGenreToggle(genre)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                              selectedGenres.includes(genre) 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{genre}</span>
                              {selectedGenres.includes(genre) && (
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredEvents?.length || 0} of {events?.length || 0} events
              </div>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleSort('date')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                sortField === 'date' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Date {getSortIcon('date')}
            </button>
            
            <button
              onClick={() => handleSort('artistName')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                sortField === 'artistName' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Artist {getSortIcon('artistName')}
            </button>
            
            <button
              onClick={() => handleSort('location')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                sortField === 'location' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Location {getSortIcon('location')}
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredEvents && filteredEvents.map((event, index) => (
            <div
              key={`${event.artistId}-${index}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Event Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                      <UserGroupIcon className="h-5 w-5" />
                      <Link 
                        href={`/artist/${event.artistId}`}
                        className="hover:text-blue-800 transition-colors"
                      >
                        {event.artistName}
                      </Link>
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {formatDate(event.date)}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    <span className="font-medium">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                </div>
              </div>
              
              {/* Artist Info */}
              <div className="p-6">
                <div className="flex items-center gap-4">
                  {event.artistImage ? (
                    <img 
                      src={event.artistImage}
                      alt={event.artistName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                      <MusicalNoteIcon className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{event.artistLocation}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {event.artistConcept.split(',').map((genre, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {genre.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredEvents && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
} 