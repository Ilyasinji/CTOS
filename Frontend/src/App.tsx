import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Payment from './pages/Payment';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import TrafficOffences from './pages/TrafficOffences';
import Drivers from './pages/Drivers';
import SecuritySettings from './pages/SecuritySettings';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import DeletionRequests from './pages/DeletionRequests';

// Check if user has required role
const hasRequiredRole = (user: any, allowedRoles: string[]) => {
  return user && allowedRoles.includes(user.role);
};

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Role-based Route component
const RoleBasedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasRequiredRole(user, allowedRoles)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard - accessible by admin, superadmin, and driver */}
            <Route
              path="/dashboard"
              element={
                <RoleBasedRoute allowedRoles={['officer', 'superadmin', 'driver']}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Driver Routes */}
            <Route
              path="/driver/payment"
              element={
                <RoleBasedRoute allowedRoles={['driver']}>
                  <Layout>
                    <Payment />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            <Route
              path="/driver/offences"
              element={
                <RoleBasedRoute allowedRoles={['driver']}>
                  <Layout>
                    <TrafficOffences />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            <Route
              path="/driver/notifications"
              element={
                <RoleBasedRoute allowedRoles={['driver']}>
                  <Layout>
                    <Notifications />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            <Route
              path="/driver/settings"
              element={
                <RoleBasedRoute allowedRoles={['driver']}>
                  <Layout>
                    <Settings darkMode={darkMode} setDarkMode={setDarkMode} />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            {/* Admin Only Routes */}
            <Route
              path="/offences"
              element={
                <RoleBasedRoute allowedRoles={['officer', 'superadmin']}>
                  <Layout>
                    <TrafficOffences />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            <Route
              path="/drivers"
              element={
                <RoleBasedRoute allowedRoles={['officer', 'superadmin']}>
                  <Layout>
                    <Drivers />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            {/* Payment Routes */}
            <Route
              path="/payment"
              element={
                <RoleBasedRoute allowedRoles={['officer', 'superadmin']}>
                  <Layout>
                    <Payment />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            {/* Notifications Route */}
            <Route
              path="/notifications"
              element={
                <RoleBasedRoute allowedRoles={['officer', 'superadmin']}>
                  <Layout>
                    <Notifications />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            {/* Reports Route - Superadmin Only */}
            <Route
              path="/reports"
              element={
                <RoleBasedRoute allowedRoles={['superadmin']}>
                  <Layout>
                    <Reports />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            {/* Settings Route */}
            <Route
              path="/settings"
              element={
                <RoleBasedRoute allowedRoles={['officer', 'superadmin']}>
                  <Layout>
                    <Settings darkMode={darkMode} setDarkMode={setDarkMode} />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            {/* SuperAdmin Only Routes */}
            <Route
              path="/security"
              element={
                <RoleBasedRoute allowedRoles={['superadmin']}>
                  <Layout>
                    <SecuritySettings />
                  </Layout>
                </RoleBasedRoute>
              }
            />

            <Route
              path="/deletion-requests"
              element={
                <RoleBasedRoute allowedRoles={['superadmin']}>
                  <Layout>
                    <DeletionRequests />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;