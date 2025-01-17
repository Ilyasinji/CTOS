import type { FC } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaCreditCard, FaBell, FaCog, FaTrash, FaCarCrash, FaCar, FaBars } from 'react-icons/fa';
import { BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Sidebar: FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-[#F26822] text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    // Menu items for driver role
    if (user?.role === 'driver') {
      return [
        {
          path: '/dashboard',
          icon: <FaHome className="mr-3" />,
          text: t('navigation.dashboard')
        },
        {
          path: '/driver/payment',
          icon: <FaCreditCard className="mr-3" />,
          text: t('navigation.myPayments')
        },
        {
          path: '/driver/notifications',
          icon: <FaBell className="mr-3" />,
          text: t('navigation.notifications')
        },
        {
          path: '/driver/settings',
          icon: <FaCog className="mr-3" />,
          text: t('navigation.settings')
        }
      ];
    }

    // Menu items for officer and superadmin roles
    const items = [
      {
        path: '/dashboard',
        icon: <FaHome className="mr-3" />,
        text: t('navigation.dashboard'),
        roles: ['officer', 'superadmin']
      },
      {
        path: '/offences',
        icon: <FaCarCrash className="mr-3" />,
        text: t('navigation.trafficOffences'),
        roles: ['officer', 'superadmin']
      },
      {
        path: '/drivers',
        icon: <FaUsers className="mr-3" />,
        text: t('navigation.drivers'),
        roles: ['officer', 'superadmin']
      },
      {
        path: '/payment',
        icon: <FaCreditCard className="mr-3" />,
        text: t('navigation.payment'),
        roles: ['officer', 'superadmin']
      },
      {
        path: '/notifications',
        icon: <FaBell className="mr-3" />,
        text: t('navigation.notifications'),
        roles: ['officer', 'superadmin']
      },
      {
        path: '/reports',
        icon: <BarChart2 className="mr-3" />,
        text: t('navigation.reports'),
        roles: ['superadmin']
      },
      {
        path: '/settings',
        icon: <FaCog className="mr-3" />,
        text: t('navigation.settings'),
        roles: ['officer', 'superadmin']
      },
      {
        path: '/deletion-requests',
        icon: <FaTrash className="mr-3" />,
        text: t('navigation.deletionRequests'),
        roles: ['superadmin']
      }
    ];

    return items.filter(item => item.roles.includes(user?.role || ''));
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-[#F26822] text-white"
      >
        <FaBars className="text-xl" />
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out lg:relative h-screen w-64 bg-gray-900 text-white z-10`}>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-[#F26822] rounded-lg flex items-center justify-center">
              <FaCar className="text-white text-2xl" />
            </div>
            <h1 className="text-xl font-bold text-[#F26822]">{t('common.appName')}</h1>
          </div>

          <nav>
            <ul className="space-y-2">
              {getMenuItems().map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive(item.path)}`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {item.icon}
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;