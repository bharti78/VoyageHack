import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatAssistant from "../components/ChatAssistant";

const SearchSection = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const recognitionRef = useRef(null);

  // Search States
  const [destination, setDestination] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Handlers for Search, Voice, and Image (Preserved logic)
  const handleVoice = () => { /* your existing logic */ };
  const handleImageUpload = (e) => { /* your existing logic */ };
  const handleSearch = () => { /* your existing logic */ };

  return (
    <div className="bg-white font-sans text-[#444]">
      {/* Light Hero Section matching TBO index.html */}
      <section className="relative w-full overflow-hidden bg-white py-12 md:py-20 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Content: TBO Professional Typography */}
            <div className="w-full lg:w-7/12 text-center md:text-left">
              <h1 className="text-[#212529] text-4xl md:text-6xl font-bold leading-tight mb-6">
                Simplifying Travel<span className="text-[#f26b25] inline-block w-2 h-2 rounded-full bg-[#f26b25] ml-1"></span> <br />
                <span className="text-[#212529]">Enabling Growth</span>
              </h1>
              <p className="text-[#6c757d] text-lg md:text-xl mb-8 max-w-2xl leading-relaxed text-justify">
                We are one of the leading global travel distribution platforms, simplifying the travel business for both suppliers and buyers. Our platform enables seamless transactions between these parties, connecting over 159,000 buyers with over 1 million suppliers across 100+ countries.
              </p>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button className="bg-[#f26b25] hover:bg-[#d95a1d] text-white font-semibold py-3 px-8 rounded-full transition-all shadow-md transform hover:-translate-y-1">
                  Become TBO Partner
                </button>
                <button className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold py-3 px-8 rounded-full transition-all shadow-md transform hover:-translate-y-1">
                  Agent Partner
                </button>
              </div>
            </div>

            {/* Right Side: TBO Video Container */}
            <div className="w-full lg:w-5/12">
              <div className="rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-[#f8f9fa] relative group">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  className="w-full h-[400px] object-cover"
                >
                  <source src="https://www.tbo.com/img/videos/The-World-of-TBO-Group.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Search Component Container */}
      <section className="py-12 bg-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-3 md:p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
              
              {/* Destination Input */}
              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Where to?</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter City or Country"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f26b25] outline-none text-sm font-medium"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              {/* Trip Type Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Trip Style</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f26b25] outline-none text-sm font-medium appearance-none">
                  <option>Summer Specials</option>
                  <option>Winter Escapes</option>
                  <option>Adventure Tours</option>
                </select>
              </div>

              {/* Tools: Voice & Image */}
              <div className="flex gap-2 justify-center pb-1">
                <button 
                  onClick={handleVoice}
                  title="Voice Search"
                  className={`p-3 rounded-xl border transition-all ${listening ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-white text-gray-400 border-gray-200 hover:border-[#f26b25] hover:text-[#f26b25]'}`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
                </button>
                <label className="p-3 rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-[#f26b25] hover:text-[#f26b25] cursor-pointer transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>

              {/* Search Button */}
              <div className="lg:col-span-2">
                <button 
                  onClick={handleSearch}
                  className="w-full bg-[#f26b25] hover:bg-[#d95a1d] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
                >
                  <span className="uppercase tracking-widest text-sm">Find Best Deals</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TBO "In Numbers" Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-[#212529]">TBO in numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-extrabold text-[#212529] mb-2">159K+</div>
              <p className="text-[#6c757d] font-semibold text-sm uppercase tracking-wide">Travel Buyers</p>
              <div className="w-10 h-1 bg-[#f26b25] mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-extrabold text-[#f26b25] mb-2">1M+</div>
              <p className="text-[#6c757d] font-semibold text-sm uppercase tracking-wide">Hotels Worldwide</p>
              <div className="w-10 h-1 bg-[#f26b25] mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-extrabold text-[#212529] mb-2">100+</div>
              <p className="text-[#6c757d] font-semibold text-sm uppercase tracking-wide">Countries</p>
              <div className="w-10 h-1 bg-[#f26b25] mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-extrabold text-[#f26b25] mb-2">55+</div>
              <p className="text-[#6c757d] font-semibold text-sm uppercase tracking-wide">Currencies</p>
              <div className="w-10 h-1 bg-[#f26b25] mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Bot Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-8 right-8 bg-[#f26b25] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 border-4 border-white"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M8,7V10H11V7H8M13,7V10H16V7H13M8,12V15H11V12H8M13,12V15H16V12H13Z"/></svg>
      </button>

      <ChatAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default SearchSection;