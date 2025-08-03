import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChefHat, Calendar, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <ChefHat className="h-8 w-8 text-emerald-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BookmyCook</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="border-transparent text-gray-600 hover:text-emerald-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/chefs" className="border-transparent text-gray-600 hover:text-emerald-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Find a Chef
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/bookings" className="border-transparent text-gray-600 hover:text-emerald-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Bookings
                  </Link>
                  <Link to="/messages" className="border-transparent text-gray-600 hover:text-emerald-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Messages
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  {user?.role === 'chef' && (
                    <Link to="/chef-profile" className="text-gray-600 hover:text-emerald-600">
                      Chef Dashboard
                    </Link>
                  )}
                  <div className="relative">
                    <Link to="/profile" className="block rounded-full p-1 text-gray-600 hover:text-emerald-600">
                      <span className="sr-only">Open user menu</span>
                      <User className="h-6 w-6" />
                    </Link>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link 
                  to="/login" 
                  className="inline-block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="inline-block rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {isMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="space-y-1 pt-2 pb-3">
            <Link
              to="/"
              onClick={closeMenu}
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-emerald-600"
            >
              Home
            </Link>
            <Link
              to="/chefs"
              onClick={closeMenu}
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-emerald-600"
            >
              Find a Chef
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/bookings"
                  onClick={closeMenu}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-emerald-600"
                >
                  Bookings
                </Link>
                <Link
                  to="/messages"
                  onClick={closeMenu}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-emerald-600"
                >
                  Messages
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-emerald-600"
                >
                  <div className="flex items-center">
                    <User className="mr-3 h-6 w-6" />
                    Profile
                  </div>
                </Link>
                {user?.role === 'chef' && (
                  <Link
                    to="/chef-profile"
                    onClick={closeMenu}
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-emerald-600"
                  >
                    <div className="flex items-center">
                      <ChefHat className="mr-3 h-6 w-6" />
                      Chef Dashboard
                    </div>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-emerald-600"
                >
                  <div className="flex items-center">
                    <LogOut className="mr-3 h-6 w-6" />
                    Logout
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block py-2 text-base font-medium text-gray-600 hover:text-emerald-600"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="block py-2 text-base font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;