import Sidebar from '@/component/Dashboard/Sidebar'
import Ads from '@/component/Dashboard/Ads'

const AdsPage = () => {
  return (
    <div className='bg-white flex w-screen max-h-screen overflow-hidden'>
      <Sidebar />
      <div className="flex-1 lg:ml-0">
        <Ads />
      </div>
    </div>
  )
}

export default AdsPage
