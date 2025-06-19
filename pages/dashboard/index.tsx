import Sidebar from '@/component/Dashboard/Sidebar'
import { useArtists } from '@/context/mainContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Index = () => {
  const { artists, setSelectedArtist } = useArtists()
  const router = useRouter()

  useEffect(() => {
    // If we have artists and no artist ID in the URL, redirect to the first artist
    if (artists && artists.length > 0 && !router.query.id) {
      const firstArtist = artists[0]
      setSelectedArtist(firstArtist._id)
      router.replace(`/dashboard/${firstArtist._id}/profile`)
    }
  }, [artists, router, setSelectedArtist])

  // Show loading while redirecting
  if (artists && artists.length > 0 && !router.query.id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Redirecting to your artist profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Sidebar />
    </div>
  )
}

export default Index
