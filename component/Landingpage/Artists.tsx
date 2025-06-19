import { Artist } from '@/types/artist.type';
import { useEffect, useState } from 'react'
import { getAllArtists, profileClick } from '@/service/artist.service';
import Link from 'next/link';

export default function Artists() {
  const [artists, setArtists] = useState<Artist[] | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      const artists = await getAllArtists();
      setArtists(artists.artists);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Artists</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore talented musicians and performers from around the world
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {artists && artists.map((artist) => (
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
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-medium">{artist.concept.length > 20 ? artist.concept.slice(0, 20) + '...' : artist.concept}</span>
                  </div>
                </div>
              </div>
              
              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
            </Link>
          ))}
        </div>
        
        {artists && artists.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-500">Check back later for new artists</p>
          </div>
        )}
      </div>
    </div>
  )
}
