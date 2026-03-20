import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import FeedPage       from './pages/FeedPage';
import JobsPage       from './pages/JobsPage';
import RoomsPage      from './pages/RoomsPage';
import DatingPage     from './pages/DatingPage';
import BlogsPage      from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ChatPage       from './pages/ChatPage';
import ProfilePage    from './pages/ProfilePage';
import SettingsPage   from './pages/SettingsPage';
import NotFoundPage   from './pages/NotFoundPage';
import Layout         from './components/common/Layout';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl">🇳🇵</div>
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading UK ma Nepali...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const Public = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: '12px',
                    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                    fontSize: '14px',
                  },
                }}
              />
              <Routes>
                <Route path="/login"    element={<Public><LoginPage /></Public>} />
                <Route path="/register" element={<Public><RegisterPage /></Public>} />

                <Route element={<Protected><Layout /></Protected>}>
                  <Route path="/"             element={<FeedPage />} />
                  <Route path="/jobs"         element={<JobsPage />} />
                  <Route path="/rooms"        element={<RoomsPage />} />
                  <Route path="/dating"       element={<DatingPage />} />
                  <Route path="/blogs"        element={<BlogsPage />} />
                  <Route path="/blogs/:id"    element={<BlogDetailPage />} />
                  <Route path="/chat"         element={<ChatPage />} />
                  <Route path="/chat/:userId" element={<ChatPage />} />
                  <Route path="/profile"      element={<ProfilePage />} />
                  <Route path="/profile/:id"  element={<ProfilePage />} />
                  <Route path="/settings"     element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
