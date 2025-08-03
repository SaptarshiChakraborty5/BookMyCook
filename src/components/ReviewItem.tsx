import { Star } from 'lucide-react';
import { Review } from '../types';

interface ReviewItemProps {
  review: Review;
}

const ReviewItem = ({ review }: ReviewItemProps) => {
  // Format date
  const formattedDate = new Date(review.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get user name or fallback
  const userName = typeof review.userId === 'object' ? review.userId.name : 'Anonymous';
  
  // Get user profile picture if available
  const profilePicture = typeof review.userId === 'object' ? review.userId.profilePicture : undefined;

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start">
        <div className="mr-4">
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt={userName} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="font-medium text-gray-600">{userName.charAt(0)}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900">{userName}</h4>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          
          <div className="flex mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          
          <p className="text-gray-700">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;