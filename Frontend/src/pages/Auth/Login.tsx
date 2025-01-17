import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Toast from '../../components/Toast';
import { FaCarAlt, FaUserShield, FaDesktop } from 'react-icons/fa';

const Login = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [need2FA, setNeed2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      if (isLogin) {
        console.log('Attempting login with:', { email });
        const result = await login(email, password, need2FA ? twoFactorCode : undefined);
        
        if (result.need2FA) {
          setNeed2FA(true);
          setToastMessage(t('twoFactor.codeRequired'));
          setToastType('info');
          setShowToast(true);
          return;
        }

        console.log('Login successful');
        setToastMessage(t('auth.loginSuccess'));
        setToastType('success');
        setShowToast(true);
        navigate('/');
      } else {
        if (!name || !email || !password || !role) {
          const missingFields = [];
          if (!name) missingFields.push('name');
          if (!email) missingFields.push('email');
          if (!password) missingFields.push('password');
          if (!role) missingFields.push('role');
          
          const errorMessage = `Please provide ${missingFields.join(', ')}`;
          setToastMessage(errorMessage);
          setToastType('error');
          setShowToast(true);
          return;
        }

        console.log('Attempting registration with:', { name, email, role });
        await register({
          name,
          email,
          password,
          role
        });

        setToastMessage('Registration successful! Please login.');
        setToastType('success');
        setShowToast(true);
        
        // Reset form and show login
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Failed to login');
      setToastMessage(err.message || 'Failed to login');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleRoleSelect = (selectedRole: string) => {
    console.log('Selected role:', selectedRole);
    setRole(selectedRole);
    
    // Show visual feedback
    const toast = {
      message: `Selected role: ${
        selectedRole === 'driver' 
          ? 'Driver' 
          : selectedRole === 'officer' 
          ? 'Police Officer' 
          : 'System Admin'
      }`,
      type: 'success' as const
    };
    setToastMessage(toast.message);
    setToastType(toast.type);
    setShowToast(true);
    
    // Hide toast after 2 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="w-full max-w-6xl flex rounded-xl shadow-2xl overflow-hidden bg-white">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h2>
            <p className="text-gray-600">
              Traffic Offense Management System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {need2FA && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t('twoFactor.verificationCode')}
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">Select Role</label>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    onClick={() => handleRoleSelect('driver')}
                    className={`p-4 rounded-lg border-2 cursor-pointer ${
                      role === 'driver'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    } flex flex-col items-center justify-center transition-all`}
                  >
                    <FaCarAlt className="text-3xl mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Driver</span>
                  </div>
                  <div
                    onClick={() => handleRoleSelect('officer')}
                    className={`p-4 rounded-lg border-2 cursor-pointer ${
                      role === 'officer'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    } flex flex-col items-center justify-center transition-all`}
                  >
                    <FaUserShield className="text-3xl mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Police Officer</span>
                  </div>
                  <div
                    onClick={() => handleRoleSelect('superadmin')}
                    className={`p-4 rounded-lg border-2 cursor-pointer ${
                      role === 'superadmin'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    } flex flex-col items-center justify-center transition-all`}
                  >
                    <FaDesktop className="text-3xl mb-2 text-blue-600" />
                    <span className="text-sm font-medium">System Admin</span>
                  </div>
                </div>
                {/* Hidden input to store the role value */}
                <input type="hidden" name="role" value={role} required />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              {isLogin ? t('auth.signIn') : t('auth.createAccount')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setName('');
                setEmail('');
                setPassword('');
                setRole('');
                setShowToast(false);
                setNeed2FA(false);
                setTwoFactorCode('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin
                ? t('auth.needAccount')
                : t('auth.alreadyHaveAccount')}
            </button>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-100 to-blue-50 p-12">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Traffic Offense Management System
              </h3>
              <p className="text-gray-600">
                Efficiently manage traffic violations, driver records, and police reports
                in one centralized system.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <FaCarAlt className="text-4xl text-blue-600 mb-4" />
                <h4 className="font-medium text-gray-800 mb-2">Driver Management</h4>
                <p className="text-sm text-gray-600">Track driver records and violation history</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <FaUserShield className="text-4xl text-blue-600 mb-4" />
                <h4 className="font-medium text-gray-800 mb-2">Police Portal</h4>
                <p className="text-sm text-gray-600">Record and manage traffic violations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default Login;
