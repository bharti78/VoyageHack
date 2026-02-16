import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchSection = () => {
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
    <div className="relative bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-blue-100/20"></div>
      
      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find your next
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600">
              {" "}adventure
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing places around the world with personalized travel experiences tailored just for you
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-2 border border-white/20">
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
                  <div className="text-sm text-gray-900 font-medium truncate">
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
                  <div className="text-sm text-gray-900 font-medium truncate">
                    {getWhenDisplay()}
                  </div>
                </button>

                {whenOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden min-w-[800px]">
                    <div className="p-8">
                      {/* Tabs */}
                      <div className="flex space-x-2 mb-8">
                        {['dates', 'months', 'flexible'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setWhenTab(tab)}
                            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                              whenTab === tab
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </button>
                        ))}
                      </div>

                      {/* Dates Tab - Calendar */}
                      {whenTab === 'dates' && (
                        <div>
                          {/* Calendar Navigation */}
                          <div className="flex items-center justify-between mb-6">
                            <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">February 2026</div>
                              <div className="text-sm text-gray-500">March 2026</div>
                            </div>
                            <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-2 gap-8 mb-8">
                            {/* February Calendar */}
                            <div className="border border-gray-200 rounded-xl p-4">
                              <div className="text-center font-bold text-gray-900 mb-4 text-lg">February 2026</div>
                              <div className="grid grid-cols-7 gap-2 text-sm">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                  <div key={i} className="text-center text-gray-500 font-semibold py-2">
                                    {day}
                                  </div>
                                ))}
                                {Array.from({ length: 35 }, (_, i) => {
                                  const date = i - 3; // Feb starts on Thursday
                                  const isCurrentMonth = date >= 1 && date <= 28;
                                  const isInRange = date >= 1 && date <= 7;
                                  const isToday = date === 15; // Example today
                                  return (
                                    <div
                                      key={i}
                                      className={`text-center py-2 rounded-lg cursor-pointer transition-all duration-200 font-medium ${
                                        !isCurrentMonth ? 'text-gray-300' : 
                                        isInRange ? 'bg-pink-500 text-white font-bold hover:bg-pink-600' : 
                                        isToday ? 'bg-gray-900 text-white font-bold' :
                                        'text-gray-700 hover:bg-gray-100'
                                      }`}
                                    >
                                      {isCurrentMonth ? date : ''}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* March Calendar */}
                            <div className="border border-gray-200 rounded-xl p-4">
                              <div className="text-center font-bold text-gray-900 mb-4 text-lg">March 2026</div>
                              <div className="grid grid-cols-7 gap-2 text-sm">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                  <div key={i} className="text-center text-gray-500 font-semibold py-2">
                                    {day}
                                  </div>
                                ))}
                                {Array.from({ length: 35 }, (_, i) => {
                                  const date = i - 6; // Mar starts on Saturday
                                  const isCurrentMonth = date >= 1 && date <= 31;
                                  const isInRange = date >= 1 && date <= 7;
                                  const isToday = date === 15; // Example today
                                  return (
                                    <div
                                      key={i}
                                      className={`text-center py-2 rounded-lg cursor-pointer transition-all duration-200 font-medium ${
                                        !isCurrentMonth ? 'text-gray-300' : 
                                        isInRange ? 'bg-pink-500 text-white font-bold hover:bg-pink-600' : 
                                        isToday ? 'bg-gray-900 text-white font-bold' :
                                        'text-gray-700 hover:bg-gray-100'
                                      }`}
                                    >
                                      {isCurrentMonth ? date : ''}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Flexibility Options */}
                          <div className="border-t border-gray-200 pt-6">
                            <div className="text-sm font-semibold text-gray-900 mb-4">Flexibility</div>
                            <div className="flex gap-3">
                              {['exact', '±1', '±2', '±3', '±7', '±14'].map(option => (
                                <button
                                  key={option}
                                  onClick={() => setFlexibility(option)}
                                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    flexibility === option
                                      ? 'bg-gray-900 text-white shadow-md'
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
                          <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-900 mb-6">Trip duration (months)</label>
                            <div className="flex items-center justify-center">
                              <div className="relative w-56 h-56">
                                {/* Background circle */}
                                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                                
                                {/* Progress circle */}
                                <div 
                                  className="absolute inset-0 rounded-full border-4 border-pink-500 transition-all duration-300"
                                  style={{
                                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((tripDuration / 12) * 2 * Math.PI - Math.PI / 2)}% ${50 - 50 * Math.sin((tripDuration / 12) * 2 * Math.PI - Math.PI / 2)}%)`
                                  }}
                                ></div>
                                
                                {/* Center content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-3xl font-bold text-gray-900">{tripDuration}</span>
                                  <span className="text-sm text-gray-500">month{tripDuration > 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Range slider */}
                            <div className="max-w-xs mx-auto mt-6">
                              <input
                                type="range"
                                min="1"
                                max="12"
                                value={tripDuration}
                                onChange={(e) => setTripDuration(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(tripDuration / 12) * 100}%, #e5e7eb ${(tripDuration / 12) * 100}%, #e5e7eb 100%)`
                                }}
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>1</span>
                                <span>6</span>
                                <span>12</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Date range display */}
                          <div className="text-center mb-8 p-4 bg-gray-50 rounded-xl">
                            <div className="text-sm text-gray-600">
                              {(() => {
                                const start = new Date(2026, 0, 1); // January 1, 2026
                                const end = new Date(2026, tripDuration - 1, 1); // Add tripDuration months
                                return `${start.toLocaleString('default', { month: 'short', day: 'numeric' })} – ${end.toLocaleString('default', { month: 'short', day: 'numeric' })}`;
                              })()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Flexible Tab */}
                      {whenTab === 'flexible' && (
                        <div>
                          {/* Duration Selection */}
                          <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">How long would you like to stay?</h3>
                            <div className="grid grid-cols-3 gap-4">
                              {['weekend', 'week', 'month'].map(duration => (
                                <button
                                  key={duration}
                                  onClick={() => setFlexibleDuration(duration)}
                                  className={`px-6 py-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    flexibleDuration === duration
                                      ? 'bg-pink-500 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {duration.charAt(0).toUpperCase() + duration.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Month Selection */}
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">When do you want to go?</h3>
                            <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
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
                                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    selectedMonths.includes(index)
                                      ? 'bg-pink-500 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {month}
                                </button>
                              ))}
                            </div>
                            
                            {/* Selection Summary */}
                            {selectedMonths.length > 0 && (
                              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                <div className="text-sm text-gray-600">
                                  {selectedMonths.length} month{selectedMonths.length > 1 ? 's' : ''} selected
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {selectedMonths.map(i => months[i]).join(', ')}
                                </div>
                              </div>
                            )}
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
                  <div className="text-sm text-gray-900 font-medium truncate">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">500+</div>
            <div className="text-gray-600">Destinations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">10K+</div>
            <div className="text-gray-600">Happy Travelers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">4.8</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
