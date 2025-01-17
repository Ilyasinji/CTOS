import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { fetchDeletionRequests, updateDeletionRequestStatus } from '../services/api';
import { Navigate } from 'react-router-dom';

interface DeletionRequest {
  _id: string;
  offenseId: string;
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
  reason: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  originalOffense: {
    driverName: string;
    vehicleNumber: string;
    offenceType: string;
    location: string;
    date: string;
    fine: number;
  };
}

const DeletionRequests: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if user is not superadmin
  if (!user || user.role !== 'superadmin') {
    addNotification('Access denied. Superadmin privileges required.', 'error');
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadDeletionRequests();
  }, []);

  const loadDeletionRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchDeletionRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading deletion requests:', error);
      addNotification('Error loading deletion requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDeletionRequestStatus(requestId, status);
      addNotification(`Request ${status} successfully`, 'success');
      loadDeletionRequests(); // Reload the list
    } catch (error) {
      console.error(`Error ${status}ing request:`, error);
      addNotification(`Error ${status}ing request`, 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('deletionRequests.title')}</h1>
      
      {requests.length === 0 ? (
        <p className="text-gray-500">{t('deletionRequests.noRequests')}</p>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {t('deletionRequests.offenseBy')} {request.originalOffense.driverName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('deletionRequests.requestedBy')}: {request.requestedBy.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('deletionRequests.requestDate')}: {new Date(request.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">{t('deletionRequests.offenseDetails')}:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">{t('deletionRequests.vehicle')}:</span> {request.originalOffense.vehicleNumber}</p>
                    <p><span className="font-medium">{t('deletionRequests.offense')}:</span> {request.originalOffense.offenceType}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">{t('deletionRequests.location')}:</span> {request.originalOffense.location}</p>
                    <p><span className="font-medium">{t('deletionRequests.fine')}:</span> ${request.originalOffense.fine}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">{t('deletionRequests.reasonForDeletion')}:</h4>
                <p className="text-gray-700">{request.reason}</p>
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'approved')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    {t('deletionRequests.approve')}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'rejected')}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    {t('deletionRequests.reject')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletionRequests;
