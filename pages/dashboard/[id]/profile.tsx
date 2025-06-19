import Sidebar from '@/component/Dashboard/Sidebar'
import Profile from '@/component/Dashboard/Profile'

const ProfilePage = () => {
  return (
    <div className='bg-white flex w-screen max-h-screen overflow-hidden'>
      <Sidebar />
      <div className="flex-1 lg:ml-0">
        <Profile />
      </div>
    </div>
  )
}

export default ProfilePage
