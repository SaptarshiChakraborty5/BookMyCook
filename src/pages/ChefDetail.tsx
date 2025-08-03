import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChefById, createBooking } from '../api';
import { Chef } from '../types';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewItem from '../components/ReviewItem';
import BookingForm from '../components/BookingForm';
import {
  Star,
  Clock,
  DollarSign,
  Calendar,
  Award,
  ChefHat,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const ChefDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [chef, setChef] = useState<Chef | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchChef = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await getChefById(id);
          setChef(response.data);
        }
      } catch (err) {
        setError('Failed to load chef details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChef();
  }, [id]);

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      await createBooking({
        ...bookingData,
        chefId: chef?._id
      });
      toast.success('Booking created successfully!');
      setShowBookingForm(false);
      navigate('/bookings');
    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const initiateBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a chef');
      navigate('/login');
      return;
    }
    
    setShowBookingForm(true);
  };

  const initiateChat = () => {
    if (!isAuthenticated) {
      toast.error('Please login to message a chef');
      navigate('/login');
      return;
    }
    
    navigate('/messages', { 
      state: { 
        receiverId: chef?.userId.id,
        receiverName: chef?.userId.name
      } 
    });
  };

  if (loading) return <LoadingSpinner />;

  if (error || !chef) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-2 text-lg font-medium text-gray-900">Error</h2>
        <p className="mt-1 text-gray-500">{error || 'Chef not found'}</p>
        <button
          onClick={() => navigate('/chefs')}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
        >
          Back to Chefs
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 md:w-1/3 relative h-64 md:h-full bg-gray-200">
              {chef.userId.profilePicture ? (
                <img 
                  src={chef.userId.profilePicture} 
                  alt={chef.userId.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                  <ChefHat className="h-24 w-24 text-emerald-600" />
                </div>
              )}
            </div>
            
            <div className="p-6 md:p-8 md:flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 md:mb-0">{chef.userId.name}</h1>
                <div className="flex items-center">
                  <span className="flex items-center text-amber-500 mr-2">
                    <Star className="h-5 w-5 fill-current mr-1" />
                    <span className="font-medium">{chef.rating.toFixed(1)}</span>
                  </span>
                  <span className="text-gray-600">
                    ({chef.reviews.length} reviews)
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                  <span>{chef.experience} {chef.experience === 1 ? 'year' : 'years'} experience</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                  <span className="font-medium">${chef.hourlyRate}/hour</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Award className="h-5 w-5 mr-2 text-emerald-600" />
                  <span>
                    Specialties: {chef.speciality.join(', ')}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                  <span>
                    {chef.availableDates.length} available dates
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">About</h2>
                <p className="text-gray-700">
                  {chef.bio || "No bio available"}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={initiateBooking}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Book this Chef
                </button>
                <button
                  onClick={initiateChat}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Book {chef.userId.name}</h2>
                  <button 
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <BookingForm 
                  chef={chef} 
                  onSubmit={handleBookingSubmit} 
                  onCancel={() => setShowBookingForm(false)} 
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>
          
          {chef.reviews.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No reviews yet</p>
          ) : (
            <div className="space-y-6">
              {chef.reviews.map((review, index) => (
                <ReviewItem key={index} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefDetail;