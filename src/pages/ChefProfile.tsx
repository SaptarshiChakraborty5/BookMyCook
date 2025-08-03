import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createChefProfile, getChefs } from '../api';
import { Chef } from '../types';
import { ChefHat, Star, DollarSign, Calendar, X, Plus, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ChefProfile = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chefProfile, setChefProfile] = useState<Chef | null>(null);
  
  const [formData, setFormData] = useState({
    speciality: [] as string[],
    experience: 1,
    hourlyRate: 50,
    bio: '',
    availableDates: [] as string[]
  });
  
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Speciality options for suggestions
  const specialityOptions = [
    'Italian', 'French', 'Japanese', 'Mexican', 'Indian', 
    'Mediterranean', 'Thai', 'American', 'Chinese', 'Spanish'
  ];
  
  useEffect(() => {
    const fetchChefProfile = async () => {
      try {
        setLoading(true);
        // Find chef profile by userId
        const response = await getChefs();
        const chefData = response.data.find((chef: Chef) => 
          typeof chef.userId === 'object' && chef.userId.id === user?.id
        );
        
        if (chefData) {
          setChefProfile(chefData);
          setFormData({
            speciality: chefData.speciality,
            experience: chefData.experience,
            hourlyRate: chefData.hourlyRate,
            bio: chefData.bio || '',
            availableDates: chefData.availableDates.map(date => new Date(date).toISOString().split('T')[0])
          });
        }
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === 'chef') {
      fetchChefProfile();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'experience' || name === 'hourlyRate' ? parseInt(value) : value
    });
  };
  
  const addSpeciality = () => {
    if (specialtyInput && !formData.speciality.includes(specialtyInput)) {
      setFormData({
        ...formData,
        speciality: [...formData.speciality, specialtyInput]
      });
      setSpecialtyInput('');
    }
  };
  
  const removeSpeciality = (specialty: string) => {
    setFormData({
      ...formData,
      speciality: formData.speciality.filter(s => s !== specialty)
    });
  };
  
  const addDate = () => {
    if (selectedDate && !formData.availableDates.includes(selectedDate)) {
      setFormData({
        ...formData,
        availableDates: [...formData.availableDates, selectedDate].sort()
      });
      setSelectedDate('');
    }
  };
  
  const removeDate = (date: string) => {
    setFormData({
      ...formData,
      availableDates: formData.availableDates.filter(d => d !== date)
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const response = await createChefProfile(formData);
      
      setChefProfile(response.data.chefProfile);
      toast.success('Chef profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chef Profile</h1>
          
          {chefProfile && (
            <div className="mt-3 md:mt-0 flex items-center">
              <span className="flex items-center text-amber-500 mr-2">
                <Star className="h-5 w-5 fill-current mr-1" />
                <span className="font-medium">{chefProfile.rating.toFixed(1)}</span>
              </span>
              <span className="text-gray-600">
                ({chefProfile.reviews.length} reviews)
              </span>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ChefHat className="h-8 w-8 text-emerald-600" />
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-medium text-gray-900">{user?.name}</h2>
                <p className="text-sm text-gray-600">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine Specialties
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.speciality.map(specialty => (
                    <span 
                      key={specialty} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpeciality(specialty)}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-emerald-400 hover:text-emerald-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={specialtyInput}
                      onChange={(e) => setSpecialtyInput(e.target.value)}
                      list="speciality-options"
                      className="block w-full rounded-l-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Add a specialty..."
                    />
                    <datalist id="speciality-options">
                      {specialityOptions
                        .filter(option => !formData.speciality.includes(option))
                        .map(option => (
                          <option key={option} value={option} />
                        ))}
                    </datalist>
                  </div>
                  <button
                    type="button"
                    onClick={addSpeciality}
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-r-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {[...Array(30)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} {i+1 === 1 ? 'year' : 'years'}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                    Hourly Rate ($)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="hourlyRate"
                      id="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      min="0"
                      step="5"
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio / About You
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Tell clients about your background, experience, and cooking style..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Dates
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.availableDates.map(date => (
                    <span 
                      key={date} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {new Date(date).toLocaleDateString()}
                      <button
                        type="button"
                        onClick={() => removeDate(date)}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-10 block w-full rounded-l-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addDate}
                    disabled={!selectedDate}
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-r-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {chefProfile && chefProfile.reviews.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Reviews</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {chefProfile.reviews.map((review, index) => (
                <div key={index} className="px-4 py-5 sm:px-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {typeof review.userId === 'object' && review.userId.profilePicture ? (
                        <img 
                          src={review.userId.profilePicture} 
                          alt="" 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {typeof review.userId === 'object' ? review.userId.name.charAt(0) : 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          {typeof review.userId === 'object' ? review.userId.name : 'User'}
                        </h3>
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefProfile;