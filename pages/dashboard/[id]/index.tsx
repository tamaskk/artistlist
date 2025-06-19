import Sidebar from '@/component/Dashboard/Sidebar'
import Dashboard from '@/component/Dashboard/Dashboard'

const DashboardPage = () => {
  return (
    <div className='bg-white flex w-screen max-h-screen overflow-hidden'>
      <Sidebar />
      <div className="flex-1 lg:ml-0">
        <Dashboard />
      </div>
    </div>
  )
}

export default DashboardPage
