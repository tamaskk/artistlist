import React from "react";

interface ActivityItem {
  id: string;
  type: 'message' | 'profile_view' | 'ad_interest' | 'connection';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

interface AdMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

const Dashboard = () => {
  // Mock data - In a real app, this would come from your API
  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'message',
      title: 'New Message',
      description: 'John Doe sent you a message about your artwork',
      timestamp: '5 minutes ago',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      id: '2',
      type: 'profile_view',
      title: 'Profile View',
      description: 'Your profile was viewed by 12 people today',
      timestamp: '1 hour ago',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      id: '3',
      type: 'ad_interest',
      title: 'Ad Interest',
      description: 'Your latest ad received 5 new inquiries',
      timestamp: '2 hours ago',
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
    },
  ];

  const adMetrics: AdMetric[] = [
    {
      id: '1',
      title: 'Total Views',
      value: 1234,
      change: 12.5,
      trend: 'up',
    },
    {
      id: '2',
      title: 'Engagement Rate',
      value: 8.2,
      change: -2.1,
      trend: 'down',
    },
    {
      id: '3',
      title: 'Active Inquiries',
      value: 15,
      change: 5,
      trend: 'up',
    },
    {
      id: '4',
      title: 'Response Rate',
      value: 92,
      change: 0,
      trend: 'neutral',
    },
  ];

  const unreadMessages = 3;
  const profileViews = 156;
  const activeAds = 4;

  return (
    <div className="bg-white max-h-screen overflow-y-auto p-4 w-full">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your profile today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Messages Card */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <p className="text-2xl font-bold text-gray-900">{unreadMessages}</p>
                <p className="text-sm text-gray-500">Unread messages</p>
              </div>
            </div>
          </div>

          {/* Profile Views Card */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Profile Views</h2>
                <p className="text-2xl font-bold text-gray-900">{profileViews}</p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>

          {/* Active Ads Card */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Active Ads</h2>
                <p className="text-2xl font-bold text-gray-900">{activeAds}</p>
                <p className="text-sm text-gray-500">Currently running</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Performance Metrics */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Ad Performance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
            {adMetrics.map((metric) => (
              <div key={metric.id} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {metric.title === 'Engagement Rate' ? `${metric.value} %` : 
                     metric.title === 'Response Rate' ? `${metric.value}%` : 
                     metric.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                  <span className={`ml-2 text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-6 flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
