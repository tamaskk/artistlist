import React, { useEffect, useState } from "react";
import { getMessages, readMessage } from "@/service/message.service";
import { useRouter } from "next/router";
import { Message } from "@/types/message.type";
import { useArtists } from "@/context/mainContext";

interface MessageItem {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  type: 'chat' | 'email';
  status: 'unread' | 'read';
  subject?: string;
  preview?: string;
}

const Messages = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'email'>('chat');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  // const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();
  const [emailMessages, setEmailMessages] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<MessageItem[]>([]);
  const { id } = router.query

  // Reply and Forward states
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [forwardSubject, setForwardSubject] = useState('');
  const [forwardBody, setForwardBody] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    // Here you would typically make an API call to send the message
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log(id)
        if (id) {
          const messages = await getMessages(id as string);
          setEmailMessages(messages.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
    fetchMessages();
  }, [id]);

  const { refreshCounters } = useArtists();

  const handleReadMessage = async (messageId: string) => {
    try {
      await readMessage(messageId);
      const now = new Date();
      const newMessages = emailMessages.map(message => 
        message._id === messageId 
          ? { ...message, isRead: true, readAt: now } 
          : message
      );
      setEmailMessages(newMessages);
      
      // Refresh counters to update unread count in sidebar
      await refreshCounters();
    } catch (error) {
      console.error('Error reading message:', error);
    }
  }

  const handleReply = () => {
    const selectedMessage = emailMessages.find(e => e._id === selectedEmail);
    if (selectedMessage) {
      setReplySubject(`Re: ${selectedMessage.name} - ${selectedMessage.message.substring(0, 50)}...`);
      setReplyBody(`\n\n--- Original Message ---\nFrom: ${selectedMessage.name} (${selectedMessage.email})\nDate: ${dateFormat(selectedMessage.createdAt)}\n\n${selectedMessage.message}`);
      setShowReplyModal(true);
    }
  };

  const handleForward = () => {
    const selectedMessage = emailMessages.find(e => e._id === selectedEmail);
    if (selectedMessage) {
      setForwardSubject(`Fwd: ${selectedMessage.name} - ${selectedMessage.message.substring(0, 50)}...`);
      setForwardBody(`\n\n--- Forwarded Message ---\nFrom: ${selectedMessage.name} (${selectedMessage.email})\nDate: ${dateFormat(selectedMessage.createdAt)}\n\n${selectedMessage.message}`);
      setShowForwardModal(true);
    }
  };

  const sendReply = () => {
    const selectedMessage = emailMessages.find(e => e._id === selectedEmail);
    if (selectedMessage) {
      const mailtoLink = `mailto:${selectedMessage.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
      window.open(mailtoLink);
      setShowReplyModal(false);
      setReplySubject('');
      setReplyBody('');
    }
  };

  const sendForward = () => {
    if (forwardTo.trim()) {
      const mailtoLink = `mailto:${forwardTo}?subject=${encodeURIComponent(forwardSubject)}&body=${encodeURIComponent(forwardBody)}`;
      window.open(mailtoLink);
      setShowForwardModal(false);
      setForwardTo('');
      setForwardSubject('');
      setForwardBody('');
    }
  };

  const dateFormat = (date: Date) => {
    // I want the format like DD-MM-YYYY HH:MM
    return new Date(date).toLocaleString('hu-HU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  return (
    <div className="bg-white max-h-screen min-h-screen overflow-y-auto p-4 w-full">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`${
                activeTab === 'chat'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Chat Messages
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`${
                activeTab === 'email'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Email Messages
            </button>
          </nav>
        </div>

        {activeTab === 'chat' ? (
          // Chat Interface
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
              {/* Chat List */}
              <div className="md:col-span-1 border-r border-gray-200 pr-4">
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>

                  {/* Chat List */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedChat('1')}
                      className={`w-full text-left p-3 rounded-lg ${
                        selectedChat === '1' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="size-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">John Doe</p>
                            <p className="text-xs text-gray-500">2m ago</p>
                          </div>
                          <p className="text-sm text-gray-500 truncate">Hey, I'm interested in your artwork...</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat View */}
              <div className="md:col-span-2 flex flex-col">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="size-8 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">John Doe</h3>
                          <p className="text-sm text-gray-500">Online</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${
                            message.sender.id === 'me' ? 'justify-end' : ''
                          }`}
                        >
                          {message.sender.id !== 'me' && (
                            <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                              <svg className="size-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <div
                            className={`rounded-lg px-4 py-2 max-w-[80%] ${
                              message.sender.id === 'me'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender.id === 'me' ? 'text-indigo-200' : 'text-gray-500'
                            }`}>
                              {message.timestamp}
                            </p>
                          </div>
                          {message.sender.id === 'me' && (
                            <div className="size-8 rounded-full bg-indigo-200 flex items-center justify-center shrink-0">
                              <svg className="size-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="mt-4 border-t border-gray-200 pt-4">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type your message..."
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a conversation to start chatting
                  </div>
                )}
              </div>
            </div>

            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md mx-4">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  Real-time chat functionality is currently under development. Stay tuned for updates!
                </p>
                <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium inline-block">
                  In Development
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Email Interface
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            {/* Email List */}
            <div className="md:col-span-1 border-r border-gray-200 pr-4">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search emails..."
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>

                {/* Email List */}
                <div className="space-y-2">
                  {emailMessages.map((email) => (
                    <button
                      key={email._id}
                      onClick={() => {
                        setSelectedEmail(email._id)
                        handleReadMessage(email._id)
                      }}
                      className={`w-full text-left p-3 rounded-lg ${
                        selectedEmail === email._id ? 'bg-gray-50' : 'hover:bg-gray-50'
                      } ${email.isRead === false ? 'font-semibold' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <svg className="size-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm ${email.isRead === false ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
                              {email.name}
                            </p>
                            <p className="text-xs text-gray-500">{dateFormat(email.createdAt)}</p>
                          </div>
                          <p className={`text-sm ${email.isRead === false ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                            {email.message}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Email View */}
            <div className="md:col-span-2">
              {selectedEmail ? (
                <div className="h-full flex flex-col">
                  {/* Email Header */}
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {emailMessages.find(e => e._id === selectedEmail)?.name}
                    </h2>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="size-8 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {emailMessages.find(e => e._id === selectedEmail)?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {dateFormat(emailMessages.find(e => e._id === selectedEmail)?.createdAt as Date)}
                          </p>
                          {emailMessages.find(e => e._id === selectedEmail)?.readAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Read at: {dateFormat(emailMessages.find(e => e._id === selectedEmail)?.readAt as Date)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleReply}
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={handleForward}
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Forward
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="prose max-w-none">
                      <p className="text-gray-900">
                        {emailMessages.find(e => e._id === selectedEmail)?.message}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select an email to read
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reply to Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="block w-full rounded-md p-2 text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={8}
                    className="block w-full rounded-md p-2 text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplySubject('');
                      setReplyBody('');
                    }}
                    className="rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendReply}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Forward Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="email"
                    value={forwardTo}
                    onChange={(e) => setForwardTo(e.target.value)}
                    placeholder="Enter email address"
                    className="block w-full rounded-md p-2 text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={forwardSubject}
                    onChange={(e) => setForwardSubject(e.target.value)}
                    className="block w-full rounded-md p-2 text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={forwardBody}
                    onChange={(e) => setForwardBody(e.target.value)}
                    rows={8}
                    className="block w-full rounded-md p-2 text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowForwardModal(false);
                      setForwardTo('');
                      setForwardSubject('');
                      setForwardBody('');
                    }}
                    className="rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendForward}
                    disabled={!forwardTo.trim()}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Send Forward
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
