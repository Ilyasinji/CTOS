import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

interface TwoFactorSetupProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function TwoFactorSetup({ onClose, onSuccess }: TwoFactorSetupProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateSecret = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/2fa/generate',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSecret(response.data.secret);
        setQrCode('generated'); // Just a flag to show QR code
        setStep('verify');
      } else {
        setError(t('twoFactor.generateError'));
      }
    } catch (err: any) {
      console.error('Error generating 2FA secret:', err);
      setError(err.response?.data?.message || t('twoFactor.generateError'));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/2fa/verify',
        {
          token: verificationCode
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        onSuccess();
        onClose();
      } else {
        setError(t('twoFactor.verificationFailed'));
      }
    } catch (err: any) {
      console.error('Error verifying 2FA code:', err);
      setError(err.response?.data?.message || t('twoFactor.verificationError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">
          {t('twoFactor.setup')}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              {t('twoFactor.setupInstructions')}
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>{t('twoFactor.downloadApp')}</li>
              <li>{t('twoFactor.scanQR')}</li>
              <li>{t('twoFactor.enterCode')}</li>
            </ol>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={generateSecret}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? t('common.loading') : t('twoFactor.start')}
              </button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center py-4">
                <QRCodeSVG 
                  value={secret ? `otpauth://totp/TrafficSystem:${user?.email}?secret=${secret}&issuer=TrafficSystem` : ''} 
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">{t('twoFactor.backupCode')}</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono select-all">
                {secret}
              </code>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('twoFactor.verificationCode')}
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={verifyCode}
                disabled={loading || verificationCode.length !== 6}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? t('common.verifying') : t('common.verify')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
