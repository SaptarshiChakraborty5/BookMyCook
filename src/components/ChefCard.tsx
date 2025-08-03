import { Link } from 'react-router-dom';
import { Star, Clock, DollarSign } from 'lucide-react';
import { Chef } from '../types';

interface ChefCardProps {
  chef: Chef;
}

const ChefCard = ({ chef }: ChefCardProps) => {
  return (
    <Link 
      to={`/chefs/${chef._id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-48 bg-gray-200">
        {chef.userId.profilePicture ? (
          <img 
            src={chef.userId.profilePicture} 
            alt={chef.userId.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-3xl font-bold text-gray-400">
              {chef.userId.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-xl font-semibold text-white">{chef.userId.name}</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-2">
          <span className="flex items-center text-amber-500 mr-2">
            <Star className="h-4 w-4 fill-current mr-1" />
            <span className="font-medium">{chef.rating.toFixed(1)}</span>
          </span>
          <span className="text-gray-500 text-sm">
            ({chef.reviews.length} reviews)
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {chef.speciality.slice(0, 3).map((specialty, index) => (
            <span 
              key={index} 
              className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-medium text-gray-700"
            >
              {specialty}
            </span>
          ))}
          {chef.speciality.length > 3 && (
            <span className="inline-block rounded-full px-2 py-1 text-xs font-medium text-gray-500">
              +{chef.speciality.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex items-center text-gray-700 mb-2">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm">{chef.experience} {chef.experience === 1 ? 'year' : 'years'} experience</span>
        </div>
        
        <div className="flex items-center text-gray-700">
          <DollarSign className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">${chef.hourlyRate}/hour</span>
        </div>
        
        <p className="mt-3 text-gray-600 line-clamp-2">
          {chef.bio || "Professional chef ready to create amazing culinary experiences for any occasion."}
        </p>
      </div>
    </Link>
  );
};

export default ChefCard;