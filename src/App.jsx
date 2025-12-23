import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { SERVER_URL } from './services/api';
import { logout } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import ThreadDetail from './pages/ThreadDetail';
import Profile from './pages/Profile';
import PrivateChat from './pages/PrivateChat';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import BannedScreen from './pages/BannedScreen';
function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isBanned, setIsBanned] = useState(false);
  useEffect(() => {
    const socket = io(SERVER_URL);
    if (user && user._id) {
      socket.emit('user_online', user._id);
    }
    socket.on('user_banned', ({ userId }) => {
      if (user && user._id === userId) {
        setIsBanned(true);
        dispatch(logout());
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [user, dispatch]);
  if (isBanned) {
    return <BannedScreen />;
  }
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen font-sans bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/threads/:id" element={<ThreadDetail />} />
          <Route path="/chat/private" element={<PrivateChat />} />
          <Route path="/chat/private/:userId" element={<PrivateChat />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;