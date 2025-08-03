import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    profilePicture: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        profilePicture: user.profilePicture || ''
      });
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const response = await updateProfile(formData);
      
      // Update user in auth context
      updateUser({
        ...user!,
        name: formData.name,
        profilePicture: formData.profilePicture
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="flex-shrink-0">
                {formData.profilePicture ? (
                  <img 
                    src={formData.profilePicture} 
                    alt={formData.name} 
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-medium text-gray-900">{formData.name}</h2>
                <p className="text-sm text-gray-600">
                  {user?.email}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Role: {user?.role === 'chef' ? 'Chef' : 'Customer'}
                </p>
                
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
                      Profile Picture URL
                    </label>
                    <input
                      type="text"
                      name="profilePicture"
                      id="profilePicture"
                      value={formData.profilePicture}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="https://example.com/your-photo.jpg"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Enter the URL of your profile picture, or leave empty to use default.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data to original values
                        if (user) {
                          setFormData({
                            name: user.name,
                            profilePicture: user.profilePicture || ''
                          });
                        }
                      }}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.role === 'chef' ? 'Chef' : 'Customer'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;