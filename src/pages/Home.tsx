import { Link } from 'react-router-dom';
import { ArrowRight, Search, Calendar, Star, ChefHat, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center h-[600px]" style={{ backgroundImage: "url('https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Personal Chef Experience <br/> 
            <span className="text-emerald-400">At Your Home</span>
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl">
            Book talented chefs to create memorable dining experiences for any occasion. From intimate dinners to special celebrations.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/chefs" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-300">
              Find a Chef
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/signup" className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-emerald-700 transition-colors duration-300">
              Join as a Chef
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              A simple process to bring culinary excellence to your home
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-emerald-100 p-3 rounded-full mb-4">
                <Search className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Find a Chef</h3>
              <p className="text-gray-600">
                Browse and filter through our selection of professional chefs based on cuisine, pricing, and availability.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-emerald-100 p-3 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Book Your Experience</h3>
              <p className="text-gray-600">
                Select a date and time, discuss your menu preferences, and book your personalized dining experience.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-emerald-100 p-3 rounded-full mb-4">
                <ChefHat className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Enjoy Your Meal</h3>
              <p className="text-gray-600">
                Your chef arrives, prepares your meal, serves it, and cleans up. All you need to do is enjoy!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cuisines */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Cuisines</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Explore culinary traditions from around the world
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Italian', image: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
              { name: 'Japanese', image: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
              { name: 'Mexican', image: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
              { name: 'Indian', image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
              { name: 'French', image: 'https://images.pexels.com/photos/299410/pexels-photo-299410.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
              { name: 'Mediterranean', image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
              { name: 'Thai', image: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
              { name: 'American', image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }
            ].map((cuisine, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg group h-48">
                <img src={cuisine.image} alt={cuisine.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <h3 className="text-white font-medium">{cuisine.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Hear from people who have experienced our service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                review: 'Our anniversary dinner was perfect! The chef created an amazing 5-course meal and explained each dish. It felt like dining at a Michelin star restaurant, but in our own home.',
                rating: 5
              },
              {
                name: 'Michael Roberts',
                image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                review: 'We hired a chef for our dinner party, and our guests are still talking about it. Professional service, incredible food, and they left the kitchen cleaner than they found it!',
                rating: 5
              },
              {
                name: 'Emily Chen',
                image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                review: 'What a fantastic experience! Our chef was knowledgeable and personable. The Thai food was authentic and delicious. Already planning our next booking!',
                rating: 4
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover mr-4" />
                  <div>
                    <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.review}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience Culinary Excellence?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Join thousands of food enthusiasts who have discovered the joy of private dining experiences.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/chefs" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-emerald-700 bg-white hover:bg-gray-100 transition-colors duration-300">
              Browse Chefs
            </Link>
            <Link to="/signup" className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-emerald-700 transition-colors duration-300">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;