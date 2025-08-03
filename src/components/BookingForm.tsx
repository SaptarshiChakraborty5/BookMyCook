import { useState } from 'react';
import { Chef } from '../types';
import { Calendar, Clock, MapPin, FileText, AlertCircle } from 'lucide-react';

interface BookingFormProps {
  chef: Chef;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const BookingForm = ({ chef, onSubmit, onCancel }: BookingFormProps) => {
  const [formData, setFormData] = useState({
    date: '',
    duration: 3,
    location: '',
    menu: '',
    specialInstructions: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (formData.duration < 1) newErrors.duration = 'Duration must be at least 1 hour';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Calculate total price
  const totalPrice = chef.hourlyRate * formData.duration;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              name="date"
              id="date"
              className={`pl-10 block w-full shadow-sm rounded-md ${
                errors.date 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]} // Set min date to today
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (hours)
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="duration"
              id="duration"
              className={`pl-10 block w-full shadow-sm rounded-md ${
                errors.duration 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              value={formData.duration}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(hour => (
                <option key={hour} value={hour}>{hour} hour{hour > 1 ? 's' : ''}</option>
              ))}
            </select>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="location"
              id="location"
              placeholder="Enter your address"
              className={`pl-10 block w-full shadow-sm rounded-md ${
                errors.location 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              value={formData.location}
              onChange={handleChange}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="menu" className="block text-sm font-medium text-gray-700">
            Menu Preferences (Optional)
          </label>
          <div className="mt-1 relative">
            <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              name="menu"
              id="menu"
              rows={3}
              placeholder="Describe your desired menu or dietary restrictions"
              className="pl-10 block w-full shadow-sm rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.menu}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700">
            Special Instructions (Optional)
          </label>
          <textarea
            name="specialInstructions"
            id="specialInstructions"
            rows={3}
            placeholder="Any special requests or instructions for the chef"
            className="mt-1 block w-full shadow-sm rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            value={formData.specialInstructions}
            onChange={handleChange}
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between">
            <span className="text-gray-700">Chef Rate:</span>
            <span className="font-medium">${chef.hourlyRate}/hour</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-700">Duration:</span>
            <span className="font-medium">{formData.duration} hours</span>
          </div>
          <div className="flex justify-between mt-1 font-bold">
            <span>Total Price:</span>
            <span>${totalPrice}</span>
          </div>
        </div>
        
        <div className="flex items-start p-4 bg-blue-50 rounded-md">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2 mt-0.5" />
          <p className="text-sm text-blue-700">
            This is a request for booking. The chef will need to confirm your booking before it's finalized.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Book Now
          </button>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;