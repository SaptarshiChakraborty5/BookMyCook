import { useState, useEffect } from 'react';
import { getChefs } from '../api';
import { Chef, ChefSearchFilters } from '../types';
import ChefCard from '../components/ChefCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, X } from 'lucide-react';

const ChefListing = () => {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<ChefSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Form state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
  const [minRate, setMinRate] = useState<string>('');
  const [maxRate, setMaxRate] = useState<string>('');
  const [date, setDate] = useState<string>('');
  
  // Speciality options
  const specialityOptions = [
    'Italian', 'French', 'Japanese', 'Mexican', 'Indian', 
    'Mediterranean', 'Thai', 'American', 'Chinese', 'Spanish'
  ];

  useEffect(() => {
    fetchChefs();
  }, [filters]);

  const fetchChefs = async () => {
    try {
      setLoading(true);
      const response = await getChefs(filters);
      setChefs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load chefs. Please try again later.');
      setChefs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeciality = (speciality: string) => {
    if (selectedSpecialities.includes(speciality)) {
      setSelectedSpecialities(selectedSpecialities.filter(s => s !== speciality));
    } else {
      setSelectedSpecialities([...selectedSpecialities, speciality]);
    }
  };

  const applyFilters = () => {
    const newFilters: ChefSearchFilters = {};
    
    if (selectedSpecialities.length > 0) {
      newFilters.speciality = selectedSpecialities;
    }
    
    if (minRate) {
      newFilters.minRate = parseInt(minRate);
    }
    
    if (maxRate) {
      newFilters.maxRate = parseInt(maxRate);
    }
    
    if (date) {
      newFilters.date = date;
    }
    
    setFilters(newFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setSelectedSpecialities([]);
    setMinRate('');
    setMaxRate('');
    setDate('');
    setFilters({});
    setShowFilters(false);
  };

  const filteredChefs = searchTerm
    ? chefs.filter(chef => 
        chef.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chef.speciality.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (chef.bio && chef.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : chefs;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Find a Chef</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, cuisine or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Filter className="mr-2 h-5 w-5" />
            Filters
            {Object.keys(filters).length > 0 && (
              <span className="ml-1 bg-emerald-100 text-emerald-800 py-0.5 px-2 rounded-full text-xs">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Filter Options</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cuisine Specialities</h3>
                <div className="flex flex-wrap gap-2">
                  {specialityOptions.map(speciality => (
                    <button
                      key={speciality}
                      onClick={() => toggleSpeciality(speciality)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedSpecialities.includes(speciality)
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {speciality}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Hourly Rate</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minRate" className="block text-xs text-gray-500">Min Rate ($)</label>
                    <input
                      type="number"
                      id="minRate"
                      min="0"
                      value={minRate}
                      onChange={(e) => setMinRate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxRate" className="block text-xs text-gray-500">Max Rate ($)</label>
                    <input
                      type="number"
                      id="maxRate"
                      min="0"
                      value={maxRate}
                      onChange={(e) => setMaxRate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Availability</h3>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-emerald-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-emerald-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchChefs}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredChefs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chefs found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
            {(Object.keys(filters).length > 0 || searchTerm) && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChefs.map((chef) => (
              <ChefCard key={chef._id} chef={chef} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefListing;