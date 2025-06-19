import Sidebar from '@/component/Dashboard/Sidebar'
import Messages from '@/component/Dashboard/Messages'

const MessagesPage = () => {
  return (
    <div className='bg-white flex w-screen max-h-screen overflow-hidden'>
      <Sidebar />
      <div className="flex-1 lg:ml-0">
        <Messages />
      </div>
    </div>
  )
}

export default MessagesPage
