import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    user?.profileImage ? `http://localhost:5000${user.profileImage}` : '/default-avatar.png'
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.profileImage) {
      setPreviewUrl(`http://localhost:5000${user.profileImage}`);
    }
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const formData = new FormData();

      // Add name if changed
      if (name !== user?.name) {
        formData.append('name', name);
      }

      // Add profile image if provided
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      // Handle password change
      if (newPassword) {
        // Validate current password is provided
        if (!currentPassword) {
          setError(t('profile.currentPasswordRequired'));
          setLoading(false);
          return;
        }

        // Validate password confirmation
        if (newPassword !== confirmPassword) {
          setError(t('profile.passwordsDoNotMatch'));
          setLoading(false);
          return;
        }

        // Add password fields
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      console.log('Making profile update request...');
      const formDataObject: { [key: string]: FormDataEntryValue } = {};
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });
      console.log('Form data contents:', formDataObject);

      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Profile update response:', response.data);

      if (response.data.success) {
        setSuccess(t('profile.updateSuccess'));
        
        const updatedUser = response.data.user;
        
        // Update local storage and context
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Update preview URL if there's a new image
        if (updatedUser.profileImage) {
          const timestamp = new Date().getTime();
          setPreviewUrl(`http://localhost:5000${updatedUser.profileImage}?t=${timestamp}`);
        }

        // Clear password fields after successful update
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setProfileImage(null);
      } else {
        setError(response.data.message || t('profile.updateError'));
      }

    } catch (err: any) {
      console.error('Error updating profile:', err);
      // Show detailed error message from the server if available
      const errorMessage = err.response?.data?.message || err.message || t('profile.updateError');
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMessage
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">{t('profile.title')}</h1>
        <p className="text-gray-600 mb-6">{t('profile.subtitle')}</p>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6 text-center">
            <div
              className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden cursor-pointer"
              onClick={handleImageClick}
            >
              <img
                src={previewUrl}
                alt={t('profile.profileImage')}
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('profile.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('profile.currentPassword')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('profile.newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('profile.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? '...' : t('profile.saveChanges')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
