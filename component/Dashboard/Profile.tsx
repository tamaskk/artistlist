import React, { useState, useRef, useEffect } from "react";
import { 
  ArtistMember, 
  ArtistSocialWithId, 
  ArtistEventWithId, 
  ArtistImage,
  Artist,
  ArtistSet
} from "@/types/artist.type";
import { updateArtist, deleteArtist } from "@/service/artist.service";
import { toast } from "sonner";
import { useArtists } from "@/context/mainContext";
import { uploadImage, generateImagePath, deleteImage } from "@/utils/imageUpload";
import router from "next/router";
import { MUSIC_GENRES } from "@/lib/genres";

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'soundcloud', name: 'SoundCloud' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'website', name: 'Website' },
];

const Profile = () => {
  const [images, setImages] = useState<ArtistImage[]>([]);
  const [ownEquipment, setOwnEquipment] = useState<string[]>([]);
  const [needsEquipment, setNeedsEquipment] = useState<string[]>([]);
  const [events, setEvents] = useState<ArtistEventWithId[]>([]);
  const [sets, setSets] = useState<ArtistSet[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [genreSearchTerm, setGenreSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setArtists, artists } = useArtists();

  const { currentArtist, setCurrentArtist, setSelectedArtist } = useArtists();

  // Initialize images when currentArtist changes
  useEffect(() => {
    if (currentArtist?.images) {
      const existingImages: ArtistImage[] = currentArtist.images.map((url, index) => ({
        id: `existing-${index}`,
        file: null as unknown as File, // We don't have the original file
        preview: url,
        url: url,
        isMain: index === 0 // First image is main by default
      }));
      setImages(existingImages);
    }
  }, [currentArtist]);

  // Initialize other state when currentArtist changes
  useEffect(() => {
    if (currentArtist) {
      setOwnEquipment(currentArtist.ownEquipment || []);
      setNeedsEquipment(currentArtist.needsEquipment || []);
      setEvents((currentArtist.events || []).map((event, index) => ({
        ...event,
        id: `existing-event-${index}`
      })));
      setSets(currentArtist.sets || []);
      setIsPublic(currentArtist.isPublic || false);
      
      // Parse existing concept into genres array
      if (currentArtist.concept) {
        const genres = currentArtist.concept.split(',').map(g => g.trim()).filter(g => g);
        setSelectedGenres(genres);
      } else {
        setSelectedGenres([]);
      }
    }
  }, [currentArtist]);

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

  const addMember = () => {
    const newMember: ArtistMember = {
      id: Date.now().toString(),
      name: '',
      role: '',
      bio: '',
      image: null
    };
    if (currentArtist) {
      setCurrentArtist({ ...currentArtist, members: [...currentArtist?.members ?? [], newMember] });
    }
  };

  const removeMember = (id: string) => {
    if (currentArtist) {
      setCurrentArtist({ ...currentArtist, members: currentArtist?.members?.filter(member => member.id !== id) ?? [] });
    }
  };

  const handleMemberPhotoChange = async (id: string, file: File) => {
    if (!currentArtist?._id) return;

    try {
      const path = generateImagePath(currentArtist._id, 'member', file.name);
      const url = await uploadImage(file, path);
      
      if (currentArtist) {
        setCurrentArtist({
          ...currentArtist,
          members: currentArtist.members?.map(member =>
            member.id === id
              ? { ...member, image: file, imageUrl: url }
              : member
          ) ?? []
        });
      }
    } catch (error) {
      toast.error("Failed to upload member photo");
      console.error(error);
    }
  };

  const removeMemberPhoto = (id: string) => {
    if (currentArtist) {
      setCurrentArtist({ ...currentArtist, members: currentArtist?.members?.map(member => 
        member.id === id 
          ? { ...member, image: null, imagePreview: undefined }
        : member
      ) ?? [] });
    }
  };

  const handleBandPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      file, // Store the actual file
      preview: URL.createObjectURL(file),
      url: null, // URL will be set after upload
      isMain: images.length === 0 // First photo becomes main by default
    }));

    setImages([...images, ...newPhotos]);
  };

  const removeBandPhoto = (photoId: string) => {
    setImages(photos => {
      const newPhotos = photos.filter(photo => photo.id !== photoId);
      // If we removed the main photo and there are other photos, make the first one main
      if (photos.find(p => p.id === photoId)?.isMain && newPhotos.length > 0) {
        newPhotos[0].isMain = true;
      }
      return newPhotos;
    });
  };

  const setMainPhoto = (photoId: string) => {
    setImages(photos => 
      photos.map(photo => ({
        ...photo,
        isMain: photo.id === photoId
      }))
    );
  };

  const addSocialLink = () => {
    const newSocial: ArtistSocialWithId = {
      id: Date.now().toString(),
      name: '',
      url: ''
    };
    if (currentArtist) {
      setCurrentArtist({ ...currentArtist, socials: [...currentArtist?.socials ?? [], newSocial] });
    }
  };

  const removeSocialLink = (name: string) => {
    if (currentArtist) {
      setCurrentArtist({ ...currentArtist, socials: currentArtist?.socials?.filter(link => link.name !== name) ?? [] });
    }
  };

  const addEquipment = (type: 'owned' | 'needed') => {
    if (type === 'owned') {
      setOwnEquipment([...ownEquipment, '']);
    } else {
      setNeedsEquipment([...needsEquipment, '']);
    }
  };

  const removeEquipment = (index: number, type: 'owned' | 'needed') => {
    if (type === 'owned') {
      setOwnEquipment(ownEquipment.filter((_, i) => i !== index));
    } else {
      setNeedsEquipment(needsEquipment.filter((_, i) => i !== index));
    }
  };

  const addSet = () => {
    if (sets.length >= 3) {
      toast.error("Maximum 3 sets allowed");
      return;
    }
    const newSet: ArtistSet = {
      id: Date.now().toString(),
      title: '',
      platform: 'youtube',
      url: '',
      description: ''
    };
    setSets([...sets, newSet]);
  };

  const removeSet = (id: string) => {
    setSets(sets.filter(set => set.id !== id));
  };

  const updateSet = (id: string, field: keyof ArtistSet, value: string) => {
    setSets(sets.map(set => 
      set.id === id ? { ...set, [field]: value } : set
    ));
  };

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]+/;
    return youtubeRegex.test(url);
  };

  const validateSoundCloudUrl = (url: string): boolean => {
    const soundcloudRegex = /^(https?:\/\/)?(www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/;
    return soundcloudRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentArtist?._id) {
      toast.error("No artist selected");
      return;
    }

    try {
      // First upload all pending images
      const uploadPromises = images
        .filter(img => img.file && !img.url) // Only upload images that haven't been uploaded yet
        .map(async (img) => {
          if (!img.file || !currentArtist._id) return null;
          const path = generateImagePath(currentArtist._id, 'band', img.file.name);
          const url = await uploadImage(img.file, path);
          return { ...img, url };
        });

      const uploadedImages = await Promise.all(uploadPromises);
      
      // Update images state with the uploaded URLs
      const updatedImages = images.map(img => {
        const uploaded = uploadedImages.find(u => u?.id === img.id);
        return uploaded || img;
      });

      // Get the new image URLs that will be saved
      const newImageUrls = updatedImages.map(img => img.url).filter(Boolean) as string[];
      
      // Get the old image URLs from the current artist
      const oldImageUrls = currentArtist.images || [];

      // Find URLs that were deleted (in old but not in new)
      const deletedUrls = oldImageUrls.filter(url => !newImageUrls.includes(url));

      // Delete the removed images from Firebase storage
      const deletePromises = deletedUrls.map(async (url) => {
        try {
          await deleteImage(url);
        } catch (error) {
          console.error('Failed to delete image from storage:', error);
          // Continue with other deletions even if one fails
        }
      });

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      const artist: Partial<Artist> = {
        _id: currentArtist._id,
        name: currentArtist.name ?? '',
        location: currentArtist.location ?? '',
        concept: selectedGenres.join(', '),
        bio: currentArtist.bio ?? '',
        socials: currentArtist.socials ?? [],
        ownEquipment: ownEquipment,
        needsEquipment: needsEquipment,
        events: events,
        sets: sets,
        createdAt: new Date(),
        isPublic: isPublic,
        members: currentArtist.members?.map(member => ({
          ...member,
          imageUrl: member.imageUrl
        })) ?? [],
        images: newImageUrls,
      };

      const response = await updateArtist(artist);

      if (response.ok) {
        toast.success("Artist updated successfully");
        // Update the artist in the artists array
        const updatedArtists = artists && artists.map((existingArtist: Artist) => 
          existingArtist._id === currentArtist._id 
            ? { ...existingArtist, ...artist }
            : existingArtist
        );
        setArtists(updatedArtists);
        // Also update the current artist
        if (currentArtist) {
          setCurrentArtist({ ...currentArtist, ...artist });
        }
        // Update images state to only keep the uploaded URLs
        setImages(updatedImages);
      } else {
        toast.error("Failed to update artist");
      }
    } catch (error) {
      toast.error("Failed to update artist");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!currentArtist?._id || !currentArtist?.name) {
      toast.error("No artist selected");
      return;
    }

    if (deleteConfirmation !== currentArtist.name) {
      toast.error("Please type the artist name exactly to confirm deletion");
      return;
    }

    try {
      const response = await deleteArtist(currentArtist._id);
      if (response.ok) {
        toast.success("Artist deleted successfully");
        // Remove the artist from the artists array
        const updatedArtists = artists && artists.filter((artist: Artist) => artist._id !== currentArtist._id);
        setArtists(updatedArtists);
        setCurrentArtist(null);
        setShowDeleteModal(false);
        setSelectedArtist(updatedArtists && updatedArtists.length > 0 ? updatedArtists[updatedArtists.length - 1]._id : null);
        router.push(`/dashboard/${updatedArtists && updatedArtists.length > 0 ? updatedArtists[updatedArtists.length - 1]._id : ''}`);
      } else {
        toast.error("Failed to delete artist");
      }
    } catch (error) {
      toast.error("Failed to delete artist");
      console.error(error);
    }
  };

  return (
    <div className="bg-white max-h-screen overflow-y-auto p-4 w-full">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Artist</h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. To confirm deletion, please type the artist name exactly as it appears:
              <span className="font-semibold block mt-2">{currentArtist?.name}</span>
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type artist name to confirm"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="space-y-12">
          {/* Artist Information Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900">Artist Profile</h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              This information will be displayed publicly so be careful what you share.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Artist Name */}
              <div>
                <label htmlFor="artist-name" className="block text-sm/6 font-medium text-gray-900">
                  Artist Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="artist-name"
                    id="artist-name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    placeholder="Enter your artist name"
                    value={currentArtist?.name ?? ''}
                    onChange={(e) => {
                      if (currentArtist) {
                        setCurrentArtist({ ...currentArtist, name: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm/6 font-medium text-gray-900">
                  Location
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    placeholder="Where are you based?"
                    value={currentArtist?.location ?? ''}
                    onChange={(e) => {
                      if (currentArtist) {
                        setCurrentArtist({ ...currentArtist, location: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Music Concept */}
              <div>
                <label htmlFor="concept" className="block text-sm/6 font-medium text-gray-900">
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
                          className="w-full p-2 border placeholder:text-gray-600 border-gray-300 rounded-md text-sm mb-2"
                          onChange={(e) => setGenreSearchTerm(e.target.value)}
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
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm/6 font-medium text-gray-900">
                  Bio
                </label>
                <div className="mt-2">
                  <textarea
                    name="bio"
                    id="bio"
                    rows={4}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    placeholder="Tell us about yourself and your music..."
                    value={currentArtist?.bio ?? ''}
                    onChange={(e) => {
                      if (currentArtist) {
                        setCurrentArtist({ ...currentArtist, bio: e.target.value });
                      }
                    }}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Band Photos Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900">Band Photos</h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              Upload photos of your band. Select one as the main photo that will be displayed prominently.
            </p>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                >
                  Upload Photos
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleBandPhotoUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={photo.preview}
                        alt="Band photo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeBandPhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="radio"
                        id={`main-photo-${photo.id}`}
                        name="main-photo"
                        checked={photo.isMain}
                        onChange={() => setMainPhoto(photo.id)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor={`main-photo-${photo.id}`}
                        className="text-sm font-medium text-gray-900"
                      >
                        Main Photo
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Band Members Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="flex justify-between items-center">
              <h2 className="text-base/7 font-semibold text-gray-900">Band Members</h2>
              <button
                type="button"
                onClick={addMember}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
              >
                Add Member
              </button>
            </div>
            <div className="mt-4 space-y-6">
              {currentArtist?.members?.map((member) => (
                <div key={member.id} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">Name</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        placeholder="Member name"
                        value={member.name ?? ''}
                        onChange={(e) => {
                          if (currentArtist) {
                            setCurrentArtist({ ...currentArtist, members: currentArtist?.members?.map(m => m.id === member.id ? { ...m, name: e.target.value } : m) ?? [] });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">Role/Job</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        placeholder="e.g., Lead Vocalist, Guitarist"
                        value={member.role ?? ''}
                        onChange={(e) => {
                          if (currentArtist) {
                            setCurrentArtist({ ...currentArtist, members: currentArtist?.members?.map(m => m.id === member.id ? { ...m, role: e.target.value } : m) ?? [] });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">Bio/Description</label>
                      <textarea
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        rows={3}
                        placeholder="Tell us about yourself, your musical background, influences..."
                        value={member.bio ?? ''}
                        onChange={(e) => {
                          if (currentArtist) {
                            setCurrentArtist({ ...currentArtist, members: currentArtist?.members?.map(m => m.id === member.id ? { ...m, bio: e.target.value } : m) ?? [] });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">Photo</label>
                      {member.image ? (
                        <div className="mt-2 relative group">
                          <img
                            src={member.imageUrl ?? ''}
                            alt="Member preview"
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeMemberPhoto(member.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleMemberPhotoChange(member.id, e.target.files[0])}
                          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Links Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="flex justify-between items-center">
              <h2 className="text-base/7 font-semibold text-gray-900">Social Media Links</h2>
              <button
                type="button"
                onClick={addSocialLink}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
              >
                Add Social Link
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {currentArtist?.socials ? currentArtist?.socials.map((link) => (
                <div key={link.name} className="flex gap-4 items-center">
                  <select
                    className="block w-48 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                    value={link.name ?? ''}
                    onChange={(e) => {
                      if (currentArtist) {
                        setCurrentArtist({ ...currentArtist, socials: currentArtist?.socials?.map(l => 
                          l.name === link.name ? { ...l, name: e.target.value } : l
                        ) ?? [] });
                      }
                    }}
                  >
                    <option value="">Select Platform</option>
                    {SOCIAL_PLATFORMS.map(platform => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    placeholder="Enter URL"
                    className="block flex-1 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                    value={link.url ?? ''}
                    onChange={(e) => {
                      if (currentArtist) {
                        setCurrentArtist({ ...currentArtist, socials: currentArtist?.socials?.map(l => 
                          l.name === link.name ? { ...l, url: e.target.value } : l
                        ) ?? [] });
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(link.name)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )) : null}
            </div>
          </div>

          {/* Equipment Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="space-y-6">
              {/* Owned Equipment */}
              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-base/7 font-semibold text-gray-900">Owned Equipment</h2>
                  <button
                    type="button"
                    onClick={() => addEquipment('owned')}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                  >
                    Add Equipment
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {ownEquipment.map((item, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <input
                        type="text"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        placeholder="Equipment name"
                        value={item}
                        onChange={(e) => {
                          const newOwnEquipment = [...ownEquipment];
                          newOwnEquipment[index] = e.target.value;
                          setOwnEquipment(newOwnEquipment);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeEquipment(index, 'owned')}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Needed Equipment */}
              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-base/7 font-semibold text-gray-900">Needed Equipment</h2>
                  <button
                    type="button"
                    onClick={() => addEquipment('needed')}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                  >
                    Add Equipment
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {needsEquipment.map((item, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <input
                        type="text"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        placeholder="Equipment name"
                        value={item}
                        onChange={(e) => {
                          const newNeedsEquipment = [...needsEquipment];
                          newNeedsEquipment[index] = e.target.value;
                          setNeedsEquipment(newNeedsEquipment);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeEquipment(index, 'needed')}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="flex justify-between items-center">
              <h2 className="text-base/7 font-semibold text-gray-900">Events</h2>
              <button
                type="button"
                onClick={() => {
                  const newEvent: ArtistEventWithId = {
                    id: Date.now().toString(),
                    name: '',
                    date: new Date(),
                    location: ''
                  };
                  setEvents([...events, newEvent]);
                }}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
              >
                Add Event
              </button>
            </div>
            <div className="mt-4 space-y-6">
              {events.map((event) => (
                <div key={event.id} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">Event Name</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        placeholder="e.g., Summer Music Festival, Album Release Party"
                        value={event.name}
                        onChange={(e) => {
                          setEvents(events.map(ev => 
                            ev.id === event.id ? { ...ev, name: e.target.value } : ev
                          ));
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">Date</label>
                      <input
                        type="datetime-local"
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        value={new Date(event.date).toISOString().slice(0, 16)}
                        onChange={(e) => {
                          setEvents(events.map(ev => 
                            ev.id === event.id ? { ...ev, date: new Date(e.target.value) } : ev
                          ));
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">Location</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        placeholder="e.g., Central Park, New York"
                        value={event.location}
                        onChange={(e) => {
                          setEvents(events.map(ev => 
                            ev.id === event.id ? { ...ev, location: e.target.value } : ev
                          ));
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEvents(events.filter(ev => ev.id !== event.id))}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sets Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="flex justify-between items-center">
              <h2 className="text-base/7 font-semibold text-gray-900">Music Sets</h2>
              <button
                type="button"
                onClick={addSet}
                disabled={sets.length >= 3}
                className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs ${
                  sets.length >= 3 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                Add Set ({sets.length}/3)
              </button>
            </div>
            <p className="mt-1 text-sm/6 text-gray-600">
              Share up to 3 of your best sets from YouTube or SoundCloud.
            </p>
            <div className="mt-4 space-y-6">
              {sets.map((set) => (
                <div key={set.id} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">Set Title</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        placeholder="e.g., Summer Festival Set 2024, Live at Club XYZ"
                        value={set.title}
                        onChange={(e) => updateSet(set.id, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">Platform</label>
                      <select
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        value={set.platform}
                        onChange={(e) => updateSet(set.id, 'platform', e.target.value as 'youtube' | 'soundcloud')}
                      >
                        <option value="youtube">YouTube</option>
                        <option value="soundcloud">SoundCloud</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">URL</label>
                      <input
                        type="url"
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        placeholder={set.platform === 'youtube' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ' : 'https://soundcloud.com/artist/track-name'}
                        value={set.url}
                        onChange={(e) => updateSet(set.id, 'url', e.target.value)}
                      />
                      {set.url && (
                        <p className="mt-1 text-xs text-gray-500">
                          {set.platform === 'youtube' 
                            ? (validateYouTubeUrl(set.url) ? '✅ Valid YouTube URL' : '❌ Invalid YouTube URL')
                            : (validateSoundCloudUrl(set.url) ? '✅ Valid SoundCloud URL' : '❌ Invalid SoundCloud URL')
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-gray-900">Description (Optional)</label>
                      <textarea
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                        rows={3}
                        placeholder="Tell us about this set, the venue, the crowd, special moments..."
                        value={set.description || ''}
                        onChange={(e) => updateSet(set.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSet(set.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="text-sm/6 font-semibold text-red-600 hover:text-red-800"
          >
            Delete Artist
          </button>
          <button
            type="button"
            className="text-sm/6 font-semibold text-gray-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`text-sm/6 font-semibold p-1 rounded-md text-gray-900 ${isPublic ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
          >
            {isPublic ? "Make Private" : "Make Public"}
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
