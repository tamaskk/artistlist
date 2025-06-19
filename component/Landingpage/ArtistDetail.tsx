'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Artist, ArtistMember } from '@/types/artist.type'
import { getPublicArtist, profileClick, getActiveAdsArtists } from '@/service/artist.service'
import { EnvelopeIcon, PhoneIcon, MapPinIcon, UsersIcon, MusicalNoteIcon, WrenchScrewdriverIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/20/solid'
import { sendMessage } from '@/service/message.service'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ArtistDetail() {
  const router = useRouter()
  const { artistId } = router.query
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedMember, setSelectedMember] = useState<ArtistMember | null>(null)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [messageSending, setMessageSending] = useState(false)
  const [activeAdsArtists, setActiveAdsArtists] = useState<Artist[]>([])

  useEffect(() => {
    if (artistId) {
      const fetchArtist = async () => {
        try {
          const artistData = await getPublicArtist(artistId as string)
          setArtist(artistData.artist)
        } catch (error) {
          console.error('Error fetching artist:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchArtist()
    }
  }, [artistId])

  useEffect(() => {
    const fetchActiveAdsArtists = async () => {
      try {
        const response = await getActiveAdsArtists()
        if (response.ok && response.artists) {
          // Filter out the current artist from the list
          const filteredArtists = response.artists.filter((adArtist: Artist) => adArtist._id !== artistId)
          setActiveAdsArtists(filteredArtists)
        }
      } catch (error) {
        console.error('Error fetching active ads artists:', error)
      }
    }
    fetchActiveAdsArtists()
  }, [artistId])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setMessageSending(true)
      const response = await sendMessage({
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        artistId: artistId as string
      })
      toast.success('Üzenet küldve', {
        description: 'Köszönjük, hogy üzenetet küldtél. Hamarosan válaszolunk.'
      })
      setContactForm({
        name: '',
        email: '',
        message: ''
      })
      console.log('Contact form submitted:', response)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setMessageSending(false)
    }
  }

  const handleStartChat = () => {
    // Handle start chat functionality
    console.log('Start chat clicked')
  }

  const openMemberModal = (member: ArtistMember) => {
    setSelectedMember(member)
  }

  const closeMemberModal = () => {
    setSelectedMember(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Artist not found</h1>
          <p className="mt-2 text-gray-600">The artist you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#00ff48] to-[#009c2f] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>

        <div className="mx-auto max-w-7xl py-24 sm:py-12">
          {/* Artist Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl mb-5 font-bold tracking-tight text-gray-900 sm:text-6xl">
              {artist.name}
            </h1>
            <div className="flex justify-center mb-8">
              <img
                alt={artist.name}
                src={artist.images && artist.images.length > 0 ? artist.images[0] : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8fDA%3D'}
                className="w-auto h-full max-h-[400px] rounded-2xl object-cover shadow-xl"
              />
            </div>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              {artist.concept}
            </p>
            <div className="mt-6 flex items-center justify-center gap-x-6">
              <div className="flex items-center text-gray-500">
                <MapPinIcon className="h-5 w-5 mr-2" />
                {artist.location}
              </div>
              <div className="flex items-center text-gray-500">
                <UsersIcon className="h-5 w-5 mr-2" />
                {artist.members?.length || 0} members
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          {artist.images && artist.images.length > 1 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {artist.images.map((image, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <img
                      src={image}
                      alt={`${artist.name} - Image ${index + 1}`}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-white font-semibold text-sm">View Image {index + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bio Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">About</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed text-center">
                {artist.bio}
              </p>
            </div>
          </div>

          {/* Social Links Section */}
          {artist.socials && artist.socials.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Follow Us</h2>
              <div className="max-w-4xl mx-auto">
                <div className={`${
                  artist.socials.length === 2 
                    ? 'flex justify-center gap-4' 
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                }`}>
                  {artist.socials.map((social, index) => {
                    const getSocialIcon = (name: string) => {
                      const socialName = name.toLowerCase();
                      if (socialName.includes('facebook')) return '📘';
                      if (socialName.includes('instagram')) return '📷';
                      if (socialName.includes('twitter') || socialName.includes('x')) return '🐦';
                      if (socialName.includes('youtube')) return '📺';
                      if (socialName.includes('tiktok')) return '🎵';
                      if (socialName.includes('spotify')) return '🎵';
                      if (socialName.includes('soundcloud')) return '🎧';
                      if (socialName.includes('linkedin')) return '💼';
                      if (socialName.includes('website') || socialName.includes('web')) return '🌐';
                      return '🔗';
                    };

                    const getSocialColor = (name: string) => {
                      const socialName = name.toLowerCase();
                      if (socialName.includes('facebook')) return 'bg-blue-600 hover:bg-blue-700';
                      if (socialName.includes('instagram')) return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
                      if (socialName.includes('twitter') || socialName.includes('x')) return 'bg-black hover:bg-gray-800';
                      if (socialName.includes('youtube')) return 'bg-red-600 hover:bg-red-700';
                      if (socialName.includes('tiktok')) return 'bg-black hover:bg-gray-800';
                      if (socialName.includes('spotify')) return 'bg-green-600 hover:bg-green-700';
                      if (socialName.includes('soundcloud')) return 'bg-orange-500 hover:bg-orange-600';
                      if (socialName.includes('linkedin')) return 'bg-blue-700 hover:bg-blue-800';
                      if (socialName.includes('website') || socialName.includes('web')) return 'bg-indigo-600 hover:bg-indigo-700';
                      return 'bg-gray-600 hover:bg-gray-700';
                    };

                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${getSocialColor(social.name)} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center group ${
                          artist.socials.length === 2 ? 'w-48' : ''
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                            {getSocialIcon(social.name)}
                          </div>
                          <div className="font-semibold text-sm">{social.name.charAt(0).toUpperCase() + social.name.slice(1)}</div>
                          <div className="text-xs opacity-80 mt-1">Click to visit</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Band Members */}
          {artist.members && artist.members.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Band Members</h2>
              <div className="max-w-6xl mx-auto">
                <div className={`grid gap-6 ${
                  artist.members.length === 1 
                    ? 'grid-cols-1 max-w-md mx-auto' 
                    : artist.members.length === 2 
                    ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                    : artist.members.length === 3
                    ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto [&>*:last-child]:md:col-span-2 [&>*:last-child]:md:max-w-md [&>*:last-child]:md:mx-auto'
                    : artist.members.length === 4
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto'
                    : artist.members.length === 5
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto [&>*:nth-child(4)]:lg:col-span-2 [&>*:nth-child(4)]:lg:max-w-md [&>*:nth-child(4)]:lg:mx-auto [&>*:nth-child(5)]:lg:col-span-2 [&>*:nth-child(5)]:lg:max-w-md [&>*:nth-child(5)]:lg:mx-auto'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto'
                }`}>
                  {artist.members.map((member, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                      onClick={() => openMemberModal(member)}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Member Image */}
                        <div className="md:w-1/3 relative">
                          <img
                            src={member.imageUrl || (member.image ? URL.createObjectURL(member.image) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29ufGVufDB8fDB8fHww')}
                            alt={member.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <div className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              {member.role}
                            </div>
                          </div>
                        </div>
                        
                        {/* Member Info */}
                        <div className="md:w-2/3 p-6 flex flex-col justify-center">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                            <div className="flex items-center text-gray-600 mb-3">
                              <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></div>
                              <span className="text-sm font-medium">{member.role}</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                              {member.bio}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Member Modal Overlay */}
          {selectedMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Blurry Background */}
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeMemberModal}
              ></div>
              
              {/* Modal Content */}
              <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="relative">
                  {/* Member Image */}
                  <img
                    src={selectedMember.imageUrl || (selectedMember.image ? URL.createObjectURL(selectedMember.image) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29ufGVufDB8fDB8fHww')}
                    alt={selectedMember.name}
                    className="w-full h-64 object-cover rounded-t-3xl"
                  />
                  
                  {/* Close Button */}
                  <button
                    onClick={closeMemberModal}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {/* Role Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {selectedMember.role}
                    </div>
                  </div>
                </div>
                
                {/* Member Details */}
                <div className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedMember.name}</h2>
                    <div className="flex items-center justify-center text-gray-600 mb-4">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full mr-3"></div>
                      <span className="text-lg font-medium">{selectedMember.role}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">About</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedMember.bio}
                      </p>
                    </div>
                    
                    {/* Placeholder for future content */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Additional Information</h3>
                      <p className="text-gray-500 italic">
                        More details about {selectedMember.name} will be added here.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Equipment Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Equipment</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Own Equipment */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Equipment We Have</h3>
                </div>
                {artist.ownEquipment && artist.ownEquipment.length > 0 ? (
                  <ul className="space-y-2">
                    {artist.ownEquipment.map((equipment, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {equipment}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No equipment listed</p>
                )}
              </div>

              {/* Needed Equipment */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <MusicalNoteIcon className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Equipment We Need</h3>
                </div>
                {artist.needsEquipment && artist.needsEquipment.length > 0 ? (
                  <ul className="space-y-2">
                    {artist.needsEquipment.map((equipment, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        {equipment}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No equipment needed</p>
                )}
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Upcoming Events</h2>
            <div className="max-w-4xl mx-auto">
              {artist.events && artist.events.length > 0 ? (
                <div className="grid gap-6">
                  {artist.events
                    .filter(event => new Date(event.date) >= new Date()) // Only show future events
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date
                    .map((event, index) => (
                      <div 
                        key={index} 
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                                  <span className="font-medium">
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <MapPinIcon className="h-5 w-5 mr-2 text-indigo-600" />
                                  <span className="font-medium">{event.location}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-6">
                              <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
                                {new Date(event.date) > new Date() ? 'Upcoming' : 'Today'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                  <p className="text-gray-500">Check back later for upcoming performances!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sets Section */}
          {artist.sets && artist.sets.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Music Sets</h2>
              <div className="max-w-6xl mx-auto">
                <div className={`grid gap-8 ${
                  artist.sets.length === 1 
                    ? 'grid-cols-1 max-w-2xl mx-auto' 
                    : artist.sets.length === 2 
                    ? 'grid-cols-1 lg:grid-cols-2 max-w-4xl mx-auto'
                    : 'grid-cols-1 lg:grid-cols-3'
                }`}>
                  {artist.sets.map((set, index) => (
                    <div 
                      key={set.id} 
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{set.title}</h3>
                          {set.description && (
                            <p className="text-gray-600 text-sm mb-4">{set.description}</p>
                          )}
                          <div className="flex items-center mb-4">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              set.platform === 'youtube' ? 'bg-red-500' : 'bg-orange-500'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {set.platform}
                            </span>
                          </div>
                        </div>
                        
                        {set.platform === 'youtube' ? (
                          <div className="aspect-video rounded-lg overflow-hidden">
                            {(() => {
                              // Extract video ID from various YouTube URL formats
                              const url = set.url;
                              let videoId = '';
                              
                              // Handle different YouTube URL formats
                              if (url.includes('youtube.com/watch?v=')) {
                                videoId = url.split('v=')[1]?.split('&')[0] || '';
                              } else if (url.includes('youtu.be/')) {
                                videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
                              } else if (url.includes('youtube.com/embed/')) {
                                videoId = url.split('embed/')[1]?.split('?')[0] || '';
                              }
                              
                              if (videoId) {
                                return (
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title={set.title}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                );
                              } else {
                                return (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-gray-500 mb-2">📺</div>
                                      <p className="text-sm text-gray-600">Invalid YouTube URL</p>
                                      <a 
                                        href={set.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 text-sm mt-1 inline-block"
                                      >
                                        Open in YouTube
                                      </a>
                                    </div>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <iframe
                              width="100%"
                              height="166"
                              scrolling="no"
                              frameBorder="no"
                              allow="autoplay"
                              src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(set.url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
                              onError={() => {
                                // Fallback if iframe fails to load
                                console.error('SoundCloud embed failed to load');
                              }}
                            ></iframe>
                            <div className="mt-2 text-center">
                              <a 
                                href={set.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-orange-600 hover:text-orange-800 text-sm"
                              >
                                🎧 Open in SoundCloud
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Form */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Get in Touch</h2>
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Enter your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="mt-1 p-2 text-black placeholder:text-gray-300 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="mt-1 p-2 block w-full rounded-md text-black placeholder:text-gray-300 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="mt-1 block w-full p-2 text-black placeholder:text-gray-300 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Tell us about your project or collaboration idea..."
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2 inline" />
                    {messageSending ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    type="button"
                    onClick={handleStartChat}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    <PhoneIcon className="h-5 w-5 mr-2 inline" />
                    Start Chat
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Active Ads Section */}
          {activeAdsArtists.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Featured Artists</h2>
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {activeAdsArtists.map((adArtist) => (
                    <Link
                      key={adArtist._id}
                      href={`/artist/${adArtist._id}`}
                      onClick={() => profileClick(adArtist._id)}
                      className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-300 transform hover:-translate-y-1"
                    >
                      {/* Ad Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                          <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                          SPONSORED
                        </div>
                      </div>
                      
                      {/* Artist Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
                        <img 
                          alt={adArtist.name}
                          src={adArtist.images && adArtist.images[0] 
                            ? adArtist.images[0] 
                            : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8fDA%3D'
                          } 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                      </div>
                      
                      {/* Artist Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                          {adArtist.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {adArtist.concept}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {adArtist.location}
                          </div>
                          <div className="flex items-center">
                            <UsersIcon className="h-4 w-4 mr-1" />
                            {adArtist.members?.length || 0}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

