import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string>('/default-avatar.png');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  console.log('Header Component User:', user);
  console.log('Current Profile Image:', user?.image);

  useEffect(() => {
    if (user?.image) {
      const timestamp = new Date().getTime();
      const imageUrl = `http://localhost:5000${user.image}?t=${timestamp}`;
      console.log('Setting Header Image URL:', imageUrl);
      setProfileImageUrl(imageUrl);
    } else {
      console.log('No profile image found, using default');
      setProfileImageUrl('/default-avatar.png');
    }
  }, [user, user?.image]);

  useEffect(() => {
    const refreshImage = () => {
      if (user?.image) {
        const timestamp = new Date().getTime();
        const imageUrl = `http://localhost:5000${user.image}?t=${timestamp}`;
        console.log('Refreshing Header Image:', imageUrl);
        setProfileImageUrl(imageUrl);
      }
    };

    refreshImage();
    const timer = setTimeout(refreshImage, 500);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <FaBars className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
              <FaBell className="h-5 w-5" />
            </button>

            <div className="relative profile-dropdown">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 cursor-pointer focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  <img
                    key={profileImageUrl} // Force re-render on URL change
                    src={profileImageUrl}
                    alt={user?.name || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image load error in header');
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.png';
                    }}
                    onLoad={() => console.log('Header image loaded successfully')}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {t('profile.title')}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    {t('auth.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;