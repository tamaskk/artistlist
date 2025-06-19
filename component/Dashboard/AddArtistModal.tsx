import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Artist } from '@/types/artist.type'
import { registerArtist } from '@/service/artist.service'
import { toast } from 'sonner'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { useRouter } from 'next/router'
import { useArtists } from '@/context/mainContext'
import { MUSIC_GENRES } from '@/lib/genres'

interface AddArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddArtist: (artistData: { name: string; concept: string; location: string; bio: string }) => void;
}

interface ArtistFormValues {
  name: string;
  concept: string[];
  location: string;
  bio: string;
}

const artistSchema = yup.object().shape({
  name: yup
    .string()
    .required('Artist name is required')
    .min(2, 'Artist name must be at least 2 characters')
    .max(50, 'Artist name must not exceed 50 characters'),
  concept: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one music genre is required')
    .max(10, 'Maximum 10 genres allowed'),
}) as yup.ObjectSchema<ArtistFormValues>;

export default function AddArtistModal({ isOpen, onClose, onAddArtist }: AddArtistModalProps) {
  const router = useRouter();
  const { addArtist, setSelectedArtist, artists } = useArtists();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [genreSearchTerm, setGenreSearchTerm] = useState('');
  
  const formik = useFormik<ArtistFormValues>({
    initialValues: {
      name: '',
      concept: [],
      location: '',
      bio: '',
    },
    validationSchema: artistSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const artist: Partial<Artist> = {
          name: values.name,
          concept: selectedGenres.join(', '),
          location: values.location,
          bio: values.bio,
        }

        const result = await registerArtist(artist)

        if (result.ok) {
          toast.success('Artist added successfully')
          onAddArtist({
            name: values.name,
            concept: selectedGenres.join(', '),
            location: values.location,
            bio: values.bio,
          })
          setSelectedArtist(result.artistId)
          addArtist({
            name: values.name,
            _id: result.artistId,
          })
          setSelectedArtist(result.artistId)
          resetForm()
          setSelectedGenres([])
          setGenreSearchTerm('')
          onClose()
          router.push(`/dashboard/${result.artistId}/profile`)
        } else {
          toast.error(result.message)
        }
      } catch (error: any) {
        toast.error('Error adding artist', {
          description: error.message || 'Failed to add artist. Please try again.',
        })
      } finally {
        setSubmitting(false)
      }
    },
  })

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        if (prev.length >= 10) {
          toast.error('Maximum 10 genres allowed');
          return prev;
        }
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

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={artists && artists.length > 0 ? onClose : () => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  {
                    artists && artists.length > 0 && (
                    <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                    >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  )
                  }
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Add New Artist
                    </Dialog.Title>
                    <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Artist Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`mt-1 block p-2 text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                            formik.touched.name && formik.errors.name ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter artist name"
                        />
                        {formik.touched.name && formik.errors.name && (
                          <div className="text-red-600 text-sm mt-1">{formik.errors.name}</div>
                        )}
                      </div>
                      
                      {/* Music Genres Multi-Select */}
                      <div>
                        <label htmlFor="concept" className="block text-sm font-medium text-gray-700">
                          Music Genres
                        </label>
                        
                        {/* Selected Genres Display */}
                        {selectedGenres.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedGenres.map((genre) => (
                              <span
                                key={genre}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-200 cursor-pointer transition-colors"
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
                        <div className="mt-2 relative genre-dropdown">
                          <button
                            type="button"
                            onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                            className="block w-full p-2 text-left text-black rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                          >
                            {selectedGenres.length === 0 
                              ? 'Select music genres...' 
                              : `${selectedGenres.length} genre${selectedGenres.length !== 1 ? 's' : ''} selected`
                            }
                            <svg 
                              className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {isGenreDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              <div className="p-2">
                                <input
                                  type="text"
                                  placeholder="Search genres..."
                                  className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                                  onChange={(e) => {
                                    setGenreSearchTerm(e.target.value);
                                  }}
                                />
                                <div className="space-y-1">
                                  {filteredGenres.map((genre) => (
                                    <button
                                      key={genre}
                                      type="button"
                                      onClick={() => handleGenreToggle(genre)}
                                      className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                                        selectedGenres.includes(genre) 
                                          ? 'bg-indigo-50 text-indigo-700' 
                                          : 'text-gray-700'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>{genre}</span>
                                        {selectedGenres.includes(genre) && (
                                          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
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
                        
                        {selectedGenres.length === 0 && formik.touched.concept && formik.errors.concept && (
                          <div className="text-red-600 text-sm mt-1">At least one music genre is required</div>
                        )}
                        {selectedGenres.length > 10 && (
                          <div className="text-red-600 text-sm mt-1">Maximum 10 genres allowed</div>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                          Location (optional)
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formik.values.location}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`mt-1 block w-full p-2 text-black rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                            formik.touched.location && formik.errors.location ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter location"
                        />
                        {formik.touched.location && formik.errors.location && (
                          <div className="text-red-600 text-sm mt-1">{formik.errors.location}</div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                          Bio (optional)
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formik.values.bio}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`mt-1 block w-full p-2 text-black rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                            formik.touched.bio && formik.errors.bio ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter bio"
                        />
                        {formik.touched.bio && formik.errors.bio && (
                          <div className="text-red-600 text-sm mt-1">{formik.errors.bio}</div>
                        )}
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={formik.isSubmitting || selectedGenres.length === 0}
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                        >
                          {formik.isSubmitting ? 'Adding...' : 'Add Artist'}
                        </button>
                        {
                          artists && artists.length > 0 && (
                          <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                          >
                          Cancel
                        </button>
                        )
                        }
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 