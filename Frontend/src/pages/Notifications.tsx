import { useState, useEffect } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: string;
  userId?: string;
}

export default function Notifications() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Load notifications from localStorage on component mount
  useEffect(() => {
    const loadNotifications = () => {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          // Filter notifications based on user role and ID
          const filteredNotifications = user?.role === 'driver'
            ? parsed.filter((n: NotificationItem) => n.userId === user._id)
            : parsed;
          setNotifications(filteredNotifications);
        } catch (error) {
          console.error('Failed to parse notifications:', error);
        }
      }
    };

    loadNotifications();
    
    // Set up interval to check for new notifications
    const interval = setInterval(loadNotifications, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const clearAllNotifications = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      // Admins can clear all notifications
      localStorage.removeItem('notifications');
      setNotifications([]);
    } else {
      // Drivers can only clear their notifications
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        const remainingNotifications = parsed.filter(
          (n: NotificationItem) => n.userId && n.userId !== user?._id
        );
        localStorage.setItem('notifications', JSON.stringify(remainingNotifications));
        setNotifications(notifications.filter(n => n.userId !== user?._id));
      }
    }
  };

  const deleteNotification = (id: string) => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      const notification = parsed.find((n: NotificationItem) => n.id === id);
      
      // Only allow deletion if admin or if it's user's own notification
      if (user?.role === 'admin' || user?.role === 'superadmin' || notification.userId === user?._id) {
        const updated = parsed.filter((n: NotificationItem) => n.id !== id);
        localStorage.setItem('notifications', JSON.stringify(updated));
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{t('notifications.title')}</h1>
              <p className="mt-2 text-purple-100">
                {t('notifications.subtitle')}
              </p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                {t('common.clearAll')}
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-md">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You don't have any notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 border-b border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Bell className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">{notification.timestamp}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
