import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomepageSearch = () => {
  const navigate = useNavigate();
  const [whereOpen, setWhereOpen] = useState(false);
  const [whenOpen, setWhenOpen] = useState(false);
  const [whoOpen, setWhoOpen] = useState(false);
  
  // Where state
  const [destination, setDestination] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  
  // When state
  const [whenTab, setWhenTab] = useState('dates');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [flexibility, setFlexibility] = useState('exact');
  const [tripDuration, setTripDuration] = useState(1);
  const [flexibleDuration, setFlexibleDuration] = useState('weekend');
  const [selectedMonths, setSelectedMonths] = useState([]);
  
  // Who state
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  
  const whereRef = useRef(null);
  const whenRef = useRef(null);
  const whoRef = useRef(null);

  // Mock destinations data
  const destinations = [
    { id: 1, city: 'Manali', country: 'India', image: 'https://images.unsplash.com/photo-1593109206479-05315a5c7f5e?w=400&h=300&fit=crop' },
    { id: 2, city: 'Goa', country: 'India', image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop' },
    { id: 3, city: 'Jaipur', country: 'India', image: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=400&h=300&fit=crop' },
    { id: 4, city: 'Kerala', country: 'India', image: 'https://images.unsplash.com/photo-1605540432061-1c7a0a5c5d2b?w=400&h=300&fit=crop' },
    { id: 5, city: 'Rishikesh', country: 'India', image: 'https://images.unsplash.com/photo-1599809544975-40d5ebc0c8d5?w=400&h=300&fit=crop' },
    { id: 6, city: 'Udaipur', country: 'India', image: 'https://images.unsplash.com/photo-1611262588024-d124302b35c9?w=400&h=300&fit=crop' },
  ];

  const recentSearches = [
    { id: 1, city: 'Mumbai', country: 'India' },
    { id: 2, city: 'Delhi', country: 'India' },
    { id: 3, city: 'Bangalore', country: 'India' },
  ];

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (whereRef.current && !whereRef.current.contains(event.target)) {
        setWhereOpen(false);
      }
      if (whenRef.current && !whenRef.current.contains(event.target)) {
        setWhenOpen(false);
      }
      if (whoRef.current && !whoRef.current.contains(event.target)) {
        setWhoOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter destinations based on search
  const filteredDestinations = destinations.filter(dest =>
    dest.city.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    dest.country.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  const handleDestinationSelect = (dest) => {
    setDestination(`${dest.city}, ${dest.country}`);
    setSelectedDestination(dest);
    setWhereOpen(false);
    setDestinationSearch('');
  };

  const handleSearch = () => {
    const searchData = {
      destination: destination || 'Anywhere',
      startDate,
      endDate,
      flexibility,
      adults,
      children,
      infants,
      pets,
      flexibleDuration,
      selectedMonths
    };
    
    localStorage.setItem('homepageSearch', JSON.stringify(searchData));
    navigate('/search');
  };

  const getWhenDisplay = () => {
    if (whenTab === 'dates' && startDate && endDate) {
      return `${startDate.toLocaleString('default', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleString('default', { month: 'short', day: 'numeric' })}`;
    }
    if (whenTab === 'months' && startDate && endDate) {
      return `${startDate.toLocaleString('default', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleString('default', { month: 'short', day: 'numeric' })}`;
    }
    if (whenTab === 'flexible') {
      return `${flexibleDuration.charAt(0).toUpperCase() + flexibleDuration.slice(1)}${selectedMonths.length > 0 ? ' · ' + selectedMonths.length + ' months' : ''}`;
    }
    return 'Anytime';
  };

  const getWhoDisplay = () => {
    const total = adults + children;
    const parts = [];
    if (total > 0) parts.push(`${total} guest${total > 1 ? 's' : ''}`);
    if (infants > 0) parts.push(`${infants} infant${infants > 1 ? 's' : ''}`);
    if (pets > 0) parts.push(`${pets} pet${pets > 1 ? 's' : ''}`);
    return parts.join(', ') || 'Add guests';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Find your next adventure</h1>
          <p className="text-xl text-gray-600">Discover amazing places around the world</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {/* Where Field */}
            <div ref={whereRef} className="relative">
              <button
                onClick={() => setWhereOpen(!whereOpen)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 rounded-2xl transition-colors"
                aria-label="Where to?"
                aria-expanded={whereOpen}
              >
                <div className="text-xs font-semibold text-gray-500 mb-1">Where</div>
                <div className="text-sm text-gray-900 font-medium">
                  {destination || 'Search destinations'}
                </div>
              </button>

              {whereOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-6">
                    <div className="relative mb-6">
                      <input
                        type="text"
                        placeholder="Search destinations"
                        value={destinationSearch}
                        onChange={(e) => setDestinationSearch(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                        autoFocus
                      />
                      <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {destinationSearch === '' && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent searches</h3>
                        <div className="space-y-2">
                          {recentSearches.map(search => (
                            <button
                              key={search.id}
                              onClick={() => handleDestinationSelect(search)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                              <div className="text-sm font-medium text-gray-900">{search.city}</div>
                              <div className="text-xs text-gray-500">{search.country}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Suggested destinations</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredDestinations.map(dest => (
                          <button
                            key={dest.id}
                            onClick={() => handleDestinationSelect(dest)}
                            className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center space-x-3"
                          >
                            <img src={dest.image} alt={dest.city} className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{dest.city}</div>
                              <div className="text-xs text-gray-500">{dest.country}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* When Field */}
            <div ref={whenRef} className="relative">
              <button
                onClick={() => setWhenOpen(!whenOpen)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 rounded-2xl transition-colors border-l border-gray-200"
                aria-label="When?"
                aria-expanded={whenOpen}
              >
                <div className="text-xs font-semibold text-gray-500 mb-1">When</div>
                <div className="text-sm text-gray-900 font-medium">
                  {getWhenDisplay()}
                </div>
              </button>

              {whenOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-6">
                    {/* Tabs */}
                    <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
                      {['dates', 'months', 'flexible'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setWhenTab(tab)}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            whenTab === tab
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Dates Tab */}
                    {whenTab === 'dates' && (
                      <div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start date</label>
                            <input
                              type="date"
                              onChange={(e) => setStartDate(new Date(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End date</label>
                            <input
                              type="date"
                              onChange={(e) => setEndDate(new Date(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Flexibility</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['exact', '±1', '±2', '±3', '±7', '±14'].map(option => (
                              <button
                                key={option}
                                onClick={() => setFlexibility(option)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  flexibility === option
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {option === 'exact' ? 'Exact dates' : `${option} days`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Months Tab */}
                    {whenTab === 'months' && (
                      <div>
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-4">Trip duration (months)</label>
                          <div className="flex items-center justify-center">
                            <div className="relative w-48 h-48">
                              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                              <div 
                                className="absolute inset-0 rounded-full border-4 border-pink-500 transition-all duration-300"
                                style={{
                                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((tripDuration / 12) * 2 * Math.PI - Math.PI / 2)}% ${50 - 50 * Math.sin((tripDuration / 12) * 2 * Math.PI - Math.PI / 2)}%)`
                                }}
                              ></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900">{tripDuration}</span>
                              </div>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="12"
                            value={tripDuration}
                            onChange={(e) => setTripDuration(parseInt(e.target.value))}
                            className="w-full mt-4"
                          />
                        </div>
                        
                        <div className="text-center text-sm text-gray-600">
                          {tripDuration} month{tripDuration > 1 ? 's' : ''} trip
                        </div>
                      </div>
                    )}

                    {/* Flexible Tab */}
                    {whenTab === 'flexible' && (
                      <div>
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">How long would you like to stay?</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {['weekend', 'week', 'month'].map(duration => (
                              <button
                                key={duration}
                                onClick={() => setFlexibleDuration(duration)}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                  flexibleDuration === duration
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {duration.charAt(0).toUpperCase() + duration.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-3">When do you want to go?</h3>
                          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {months.map((month, index) => (
                              <button
                                key={month}
                                onClick={() => {
                                  setSelectedMonths(prev =>
                                    prev.includes(index)
                                      ? prev.filter(m => m !== index)
                                      : [...prev, index]
                                  );
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  selectedMonths.includes(index)
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {month}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Who Field */}
            <div ref={whoRef} className="relative">
              <button
                onClick={() => setWhoOpen(!whoOpen)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 rounded-2xl transition-colors border-l border-gray-200"
                aria-label="Who?"
                aria-expanded={whoOpen}
              >
                <div className="text-xs font-semibold text-gray-500 mb-1">Who</div>
                <div className="text-sm text-gray-900 font-medium">
                  {getWhoDisplay()}
                </div>
              </button>

              {whoOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Adults</div>
                          <div className="text-xs text-gray-500">Ages 13+</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium">{adults}</span>
                          <button
                            onClick={() => setAdults(adults + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Children</div>
                          <div className="text-xs text-gray-500">Ages 2-12</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium">{children}</span>
                          <button
                            onClick={() => setChildren(children + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Infants</div>
                          <div className="text-xs text-gray-500">Under 2</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium">{infants}</span>
                          <button
                            onClick={() => setInfants(infants + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Pets */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Pets</div>
                          <div className="text-xs text-gray-500">Bringing a service animal?</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setPets(Math.max(0, pets - 1))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium">{pets}</span>
                          <button
                            onClick={() => setPets(pets + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageSearch;
