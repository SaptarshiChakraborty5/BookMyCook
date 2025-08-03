import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <ChefHat className="h-24 w-24 text-emerald-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
        >
          Go to Home
        </Link>
        <Link
          to="/chefs"
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          Browse Chefs
        </Link>
      </div>
    </div>
  );
};

export default NotFound;