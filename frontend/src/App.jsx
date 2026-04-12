import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import RootLogin from './pages/RootLogin';
import VoterDashboard from './pages/voter/VoterDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import RootDashboard from './pages/root/RootDashboard';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/root/login" element={!user ? <RootLogin /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={
        !user ? <Navigate to="/login" /> :
        user.role === 'root' ? <RootDashboard /> :
        user.role === 'admin' ? <AdminDashboard /> :
        <VoterDashboard />
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a1d24', color: '#e8eaf0', border: '1px solid #22262f' }
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
