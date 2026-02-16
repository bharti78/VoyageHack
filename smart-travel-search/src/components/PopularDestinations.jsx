import { useNavigate } from 'react-router-dom';

const PopularDestinations = () => {
  const navigate = useNavigate();

  const destinations = [
    {
      id: 1,
      name: "Manali",
      country: "India",
      image: "https://images.unsplash.com/photo-1593109206479-05315a5c7f5e?w=600&h=400&fit=crop",
      price: "₹4,500",
      rating: 4.8,
      description: "Snow-capped mountains and adventure sports"
    },
    {
      id: 2,
      name: "Goa",
      country: "India",
      image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&h=400&fit=crop",
      price: "₹3,200",
      rating: 4.7,
      description: "Beautiful beaches and vibrant nightlife"
    },
    {
      id: 3,
      name: "Jaipur",
      country: "India",
      image: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=600&h=400&fit=crop",
      price: "₹2,800",
      rating: 4.6,
      description: "Royal palaces and rich cultural heritage"
    },
    {
      id: 4,
      name: "Kerala",
      country: "India",
      image: "https://images.unsplash.com/photo-1605540432061-1c7a0a5c5d2b?w=600&h=400&fit=crop",
      price: "₹5,200",
      rating: 4.9,
      description: "Backwaters and lush green landscapes"
    },
    {
      id: 5,
      name: "Rishikesh",
      country: "India",
      image: "https://images.unsplash.com/photo-1599809544975-40d5ebc0c8d5?w=600&h=400&fit=crop",
      price: "₹2,500",
      rating: 4.7,
      description: "Spiritual retreat and adventure hub"
    },
    {
      id: 6,
      name: "Udaipur",
      country: "India",
      image: "https://images.unsplash.com/photo-1611262588024-d124302b35c9?w=600&h=400&fit=crop",
      price: "₹3,800",
      rating: 4.8,
      description: "City of lakes and royal architecture"
    }
  ];

  const handleDestinationClick = (destination) => {
    const searchData = {
      destination: `${destination.name}, ${destination.country}`,
      startDate: null,
      endDate: null,
      flexibility: 'exact',
      adults: 1,
      children: 0,
      infants: 0,
      pets: 0,
      flexibleDuration: 'weekend',
      selectedMonths: []
    };
    
    localStorage.setItem('homepageSearch', JSON.stringify(searchData));
    navigate('/search');
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Popular Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the most loved destinations by travelers around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="group cursor-pointer"
              onClick={() => handleDestinationClick(destination)}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                {/* Image */}
                <div className="aspect-w-16 aspect-h-12 relative h-64">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-gray-900">{destination.price}</span>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">{destination.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {destination.name}
                      </h3>
                      <p className="text-sm text-gray-500">{destination.country}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {destination.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-600">
                      {destination.price}
                      <span className="text-sm text-gray-500 font-normal">/night</span>
                    </span>
                    <button className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors">
                      Explore →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/search')}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Destinations
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
