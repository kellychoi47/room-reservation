import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Spinner from './components/Spinner';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Booking from './pages/Booking';
import Calendar from './pages/Calendar';
import Map from './pages/Map';
import Admin from './pages/Admin';
import './styles.css';
import './mobile.css';

function WorkspaceLoadError({ message, onRetry }) {
  return <main className="workspace-load-error">
    <section>
      <p className="eyebrow">WORKSPACE</p>
      <h1>Unable to load workspace</h1>
      <p>{message || 'Please check your connection or try again.'}</p>
      <button className="primary" onClick={onRetry}>Try again</button>
    </section>
  </main>;
}

function Guard({ children, admin = false }) {
  const { user, profile, loading, error, retry } = useAuth();
  if (loading) return <Spinner />;
  if (error) return <WorkspaceLoadError message={error} onRetry={retry} />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && profile?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return <Routes>
    <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route element={<Guard><Layout /></Guard>}>
      <Route index element={<Dashboard />} />
      <Route path="rooms" element={<Rooms />} />
      <Route path="rooms/:id" element={<RoomDetails />} />
      <Route path="book" element={<Booking />} />
      <Route path="booking" element={<Booking />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="map" element={<Map />} />
      <Route path="admin" element={<Guard admin><Admin /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider><App /></AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
