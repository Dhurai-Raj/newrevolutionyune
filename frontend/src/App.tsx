import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';

// Core components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioPlayer } from './components/AudioPlayer';

// Pages
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { TrackDetails } from './pages/TrackDetails';
import { AuthPages } from './pages/AuthPages';
import { Dashboard } from './pages/Dashboard';
import { Pricing } from './pages/Pricing';
import { AdminDashboard } from './pages/AdminDashboard';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Legal } from './pages/Legal';
import { Blog } from './pages/Blog';

// Protected Route for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#0b0819]">
        <div className="w-10 h-10 border-4 border-royal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400">Restoring session secure lock...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Protected Admin Route
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#0b0819]">
        <div className="w-10 h-10 border-4 border-royal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main Layout Wrapper
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="w-full min-h-[75vh]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/track/:id" element={<TrackDetails />} />
            <Route path="/login" element={<AuthPages mode="login" />} />
            <Route path="/register" element={<AuthPages mode="register" />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/terms" element={<Legal />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/dmca" element={<Legal />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      
      {/* Sticky Bottom Audio Player Bar */}
      <AudioPlayer />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AudioProvider>
          <AppLayout />
        </AudioProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
