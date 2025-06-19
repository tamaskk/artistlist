import Sidebar from '@/component/Dashboard/Sidebar'
import Settings from '@/component/Dashboard/Settings'

const SettingsPage = () => {
  return (
    <div className='bg-white flex w-screen max-h-screen overflow-hidden'>
      <Sidebar />
      <div className="flex-1 lg:ml-0">
        <Settings />
      </div>
    </div>
  )
}

export default SettingsPage
