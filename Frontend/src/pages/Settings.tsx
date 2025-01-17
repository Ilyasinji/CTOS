import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  Bell, 
  User, 
  Languages, 
  Shield, 
  Key, 
  UserCircle,
  Mail,
  ChevronRight
} from 'lucide-react';
import ChangePassword from '../components/ChangePassword';
import TwoFactorSetup from '../components/TwoFactorSetup';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SettingsProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Settings({ darkMode, setDarkMode }: SettingsProps) {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  const handleTwoFactorSuccess = () => {
    setTwoFactor(true);
    if (user) {
      setUser({ ...user, twoFactorEnabled: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-4">
            <SettingsIcon className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
              <p className="mt-2 text-purple-100">{t('settings.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* General Settings */}
          <div className="border-b border-gray-200">
            <div className="p-4 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">{t('settings.generalSettings')}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{t('settings.darkMode')}</h3>
                    <p className="text-sm text-gray-500">{t('settings.darkModeDesc')}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Languages className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{t('settings.language')}</h3>
                    <p className="text-sm text-gray-500">{t('settings.languageDesc')}</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border-gray-300 text-sm"
                >
                  <option>English</option>
                  <option>Somali</option>
                  <option>Arabic</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Bell className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{t('settings.notifications')}</h3>
                    <p className="text-sm text-gray-500">{t('settings.notificationsDesc')}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="border-b border-gray-200">
            <div className="p-4 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">{t('settings.securitySettings')}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {/* Change Password */}
              <div 
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setShowChangePassword(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Key className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{t('settings.changePassword')}</h3>
                    <p className="text-sm text-gray-500">{t('settings.changePasswordDesc')}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Two Factor Authentication */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Shield className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{t('settings.twoFactorAuth')}</h3>
                    <p className="text-sm text-gray-500">{t('settings.twoFactorAuthDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {twoFactor ? t('twoFactor.enabled') : t('twoFactor.disabled')}
                  </span>
                  <button
                    onClick={() => setShowTwoFactorSetup(true)}
                    className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    {twoFactor ? t('twoFactor.disable') : t('twoFactor.enable')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Settings */}
          <div>
            <div className="p-4 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">{t('settings.profileSettings')}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {/* Update Profile */}
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <UserCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{t('settings.updateProfile')}</h3>
                    <p className="text-sm text-gray-500">{t('settings.updateProfileDesc')}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Update Email */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Mail className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{t('settings.updateEmail')}</h3>
                    <p className="text-sm text-gray-500">{t('settings.updateEmailDesc')}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
      {showTwoFactorSetup && (
        <TwoFactorSetup 
          onClose={() => setShowTwoFactorSetup(false)}
          onSuccess={handleTwoFactorSuccess}
        />
      )}
    </div>
  );
}
