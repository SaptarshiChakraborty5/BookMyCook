import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings } from '../api';
import { Booking } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Clock, MapPin, DollarSign, ChefHat, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BookingStatusBadge = ({ status }: { status: string }) => {
  let color;
  switch (status) {
    case 'pending':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    case 'confirmed':
      color = 'bg-green-100 text-green-800';
      break;
    case 'completed':
      color = 'bg-blue-100 text-blue-800';
      break;
    case 'canceled':
      color = 'bg-red-100 text-red-800';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const response = await getBookings(params);
      setBookings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load bookings. Please try again later.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const tabClass = (tab: string) => 
    `px-4 py-2 text-sm font-medium ${
      activeTab === tab
        ? 'bg-emerald-100 text-emerald-700 rounded-md'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'chef' ? 'My Booking Requests' : 'My Bookings'}
          </h1>
          
          {user?.role !== 'chef' && (
            <Link
              to="/chefs"
              className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Book a Chef
            </Link>
          )}
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 px-4 py-3">
              <button
                className={tabClass('all')}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button
                className={tabClass('pending')}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
              <button
                className={tabClass('confirmed')}
                onClick={() => setActiveTab('confirmed')}
              >
                Confirmed
              </button>
              <button
                className={tabClass('completed')}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
              <button
                className={tabClass('canceled')}
                onClick={() => setActiveTab('canceled')}
              >
                Canceled
              </button>
            </nav>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-10">
              <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
              <p className="mt-2 text-gray-600">{error}</p>
              <button
                onClick={fetchBookings}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab !== 'all' 
                  ? `You don't have any ${activeTab} bookings.` 
                  : 'You have not made any bookings yet.'}
              </p>
              {user?.role !== 'chef' && (
                <div className="mt-6">
                  <Link
                    to="/chefs"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    Book a Chef
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => {
                const chef = typeof booking.chefId === 'object' ? booking.chefId : null;
                const chefUser = chef?.userId && typeof chef.userId === 'object' ? chef.userId : null;
                const customer = typeof booking.userId === 'object' ? booking.userId : null;
                
                return (
                  <li key={booking._id} className="hover:bg-gray-50">
                    <Link to={`/bookings/${booking._id}`} className="block">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-emerald-700 truncate">
                            {user?.role === 'chef' 
                              ? `Booking from ${customer?.name || 'Customer'}` 
                              : `Booking with ${chefUser?.name || 'Chef'}`}
                          </p>
                          <div className="ml-2 flex-shrink-0">
                            <BookingStatusBadge status={booking.status} />
                          </div>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" />
                            <span>{booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" />
                            <span className="truncate">{booking.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" />
                            <span>${booking.totalPrice}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;