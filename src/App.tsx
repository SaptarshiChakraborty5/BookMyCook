import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChefRoute from './components/ChefRoute';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import ChefListing from './pages/ChefListing';
import ChefDetail from './pages/ChefDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserProfile from './pages/UserProfile';
import ChefProfile from './pages/ChefProfile';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="chefs" element={<ChefListing />} />
              <Route path="chefs/:id" element={<ChefDetail />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<UserProfile />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="bookings/:id" element={<BookingDetail />} />
                <Route path="messages" element={<Messages />} />
              </Route>
              
              {/* Chef-only Routes */}
              <Route element={<ChefRoute />}>
                <Route path="chef-profile" element={<ChefProfile />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;