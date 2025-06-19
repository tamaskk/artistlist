import { Artist } from '@/types/artist.type';
import { useEffect, useState } from 'react'
import { getAllArtists, profileClick } from '@/service/artist.service';
import Link from 'next/link';
import { MUSIC_GENRES } from '@/lib/genres';

type SortField = 'name' | 'members' | 'concept';
type SortDirection = 'asc' | 'desc';

export default function SortArtists() {
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [filteredArtists, setFilteredArtists] = useState<Artist[] | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [genreSearchTerm, setGenreSearchTerm] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      const artists = await getAllArtists();
      setArtists(artists.artists);
      setFilteredArtists(artists.artists);
    }
    fetchArtists();
  }, []);

  const fetchProfileClick = async (artistId: string) => {
    try {
      const response = await profileClick(artistId as string)
      console.log('Profile click:', response)
    } catch (error) {
      console.error('Error fetching profile click:', error)
    }
  }

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
    
    // If it's a single word search, check if it's contained in the genre
    if (searchWords.length === 1) {
      return genreLower.includes(searchWords[0]);
    }
    
    // For multi-word searches, check if ALL words are present in the genre
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

  // Sort and filter artists
  useEffect(() => {
    if (!artists) return;

    let filtered = [...artists];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(artist => {
        const artistGenres = artist.concept.split(',').map(g => g.trim().toLowerCase());
        return selectedGenres.some(selectedGenre => 
          artistGenres.includes(selectedGenre.toLowerCase())
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'members':
          aValue = a.members?.length || 0;
          bValue = b.members?.length || 0;
          break;
        case 'concept':
          aValue = a.concept.toLowerCase();
          bValue = b.concept.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredArtists(filtered);
  }, [artists, sortField, sortDirection, searchTerm, selectedGenres]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 pt-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sort & Filter Artists</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find artists by name, sort by members, or filter by music concepts
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Artists
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, concept, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Music Category
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
                Showing {filteredArtists?.length || 0} of {artists?.length || 0} artists
              </div>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleSort('name')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                sortField === 'name' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Name {getSortIcon('name')}
            </button>
            
            <button
              onClick={() => handleSort('members')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                sortField === 'members' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Members {getSortIcon('members')}
            </button>
            
            <button
              onClick={() => handleSort('concept')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                sortField === 'concept' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Concept {getSortIcon('concept')}
            </button>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredArtists && filteredArtists.map((artist) => (
            <Link
              key={artist._id}
              href={`/artist/${artist._id}`}
              onClick={() => fetchProfileClick(artist._id)}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300"
            >
              {/* Ad Badge */}
              {artist.isAdActive && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    SPONSORED
                  </div>
                </div>
              )}
              
              {/* Artist Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
                <img 
                  alt={artist.name}
                  src={artist.images && artist.images[0] 
                    ? artist.images[0] 
                    : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8fDA%3D'
                  } 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
              </div>
              
              {/* Artist Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {artist.name}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {artist.concept}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">{artist.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-blue-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span className="text-xs font-medium">{artist.members?.length || 0} members</span>
                  </div>
                </div>
              </div>
              
              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
            </Link>
          ))}
        </div>
        
        {filteredArtists && filteredArtists.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
} 