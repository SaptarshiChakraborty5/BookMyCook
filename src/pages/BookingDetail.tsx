import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, updateBookingStatus, addReview } from '../api';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  MessageSquare,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      if (id) {
        const response = await getBookingById(id);
        setBooking(response.data);
      }
    } catch (err) {
      setError('Failed to load booking details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      if (!id) return;
      
      setUpdatingStatus(true);
      await updateBookingStatus(id, status);
      
      // Update local state
      if (booking) {
        setBooking({
          ...booking,
          status
        });
      }
      
      toast.success(`Booking ${status === 'confirmed' ? 'confirmed' : 'canceled'} successfully!`);
    } catch (error) {
      toast.error('Failed to update booking status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      if (!booking || typeof booking.chefId !== 'object') return;
      
      await addReview(booking.chefId._id, reviewData);
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      
      // Refresh booking data
      fetchBooking();
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  const navigateToChat = () => {
    if (!booking) return;
    
    const receiverId = user?.role === 'chef' 
      ? (typeof booking.userId === 'object' ? booking.userId.id : booking.userId)
      : (typeof booking.chefId === 'object' && typeof booking.chefId.userId === 'object' 
          ? booking.chefId.userId.id 
          : null);
          
    const receiverName = user?.role === 'chef'
      ? (typeof booking.userId === 'object' ? booking.userId.name : 'Customer')
      : (typeof booking.chefId === 'object' && typeof booking.chefId.userId === 'object'
          ? booking.chefId.userId.name
          : 'Chef');
    
    if (receiverId) {
      navigate('/messages', { 
        state: { 
          receiverId,
          receiverName,
          bookingId: booking._id
        } 
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner />;

  if (error || !booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-2 text-lg font-medium text-gray-900">Error</h2>
        <p className="mt-1 text-gray-500">{error || 'Booking not found'}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const chef = typeof booking.chefId === 'object' ? booking.chefId : null;
  const chefUser = chef?.userId && typeof chef.userId === 'object' ? chef.userId : null;
  const customer = typeof booking.userId === 'object' ? booking.userId : null;
  
  const canReview = user?.role === 'user' && 
                    booking.status === 'completed' && 
                    chef && 
                    !chef.reviews.some(review => 
                      typeof review.userId === 'object' 
                        ? review.userId.id === user.id 
                        : review.userId === user.id
                    );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          <BookingStatusBadge status={booking.status} />
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {user?.role === 'chef' 
                ? `Booking from ${customer?.name || 'Customer'}` 
                : `Booking with ${chefUser?.name || 'Chef'}`}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Booking ID: {booking._id}
            </p>
          </div>
          
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(booking.date)}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  Duration
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  Location
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.location}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                  Total Price
                </dt>
                <dd className="mt-1 text-sm text-gray-900">${booking.totalPrice}</dd>
              </div>
              
              {booking.menu && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Menu Preferences</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{booking.menu}</dd>
                </div>
              )}
              
              {booking.specialInstructions && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Special Instructions</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{booking.specialInstructions}</dd>
                </div>
              )}
            </dl>
          </div>
          
          <div className="px-4 py-5 sm:px-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={navigateToChat}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <MessageSquare className="mr-2 h-5 w-5 text-gray-500" />
                Send Message
              </button>
              
              {user?.role === 'chef' && booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={updatingStatus}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('canceled')}
                    disabled={updatingStatus}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Decline Booking
                  </button>
                </>
              )}
              
              {user?.role === 'user' && booking.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('canceled')}
                  disabled={updatingStatus}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Cancel Booking
                </button>
              )}
              
              {canReview && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600"
                >
                  <Star className="mr-2 h-5 w-5" />
                  Leave Review
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Review Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
                  <button 
                    onClick={() => setShowReviewForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewData({ ...reviewData, rating: value })}
                          className="p-1 focus:outline-none"
                        >
                          <Star 
                            className={`h-8 w-8 ${
                              value <= reviewData.rating 
                                ? 'text-amber-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Review
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Share your experience with this chef..."
                      required
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={!reviewData.comment}
                      className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;