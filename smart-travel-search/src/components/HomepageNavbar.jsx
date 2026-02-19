import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HomepageNavbar = ({ user }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const goToProfile = () => {
    setShowProfileMenu(false);
    navigate("/profile");
  };

  const goToLogin = () => {
    navigate("/");
  };

  return (
    // <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="flex justify-between items-center h-16">
    //       {/* Logo */}
    //       <div className="flex items-center">
    //         <button
    //           onClick={() => navigate("/home")}
    //           className="flex items-center space-x-2 text-2xl font-bold text-pink-600 hover:text-pink-700 transition"
    //         >
    //           <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
    //             <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 7a2 2 0 11-4 0 2 2 0 014 0zm8 8a6 6 0 01-12 0v-1a1 1 0 011-1h2a1 1 0 011 1v1a2 2 0 104 0v-1a1 1 0 011-1h2a1 1 0 011 1v1z"/>
    //           </svg>
    //           <span>TravelSmart</span>
    //         </button>
    //       </div>

    //       {/* Desktop Navigation */}
    //       <div className="hidden md:flex items-center space-x-8">
    //         <button
    //           onClick={() => navigate("/home")}
    //           className={`text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium transition ${
    //             location.pathname === "/home" ? "text-pink-600" : ""
    //           }`}
    //         >
    //           Home
    //         </button>
    //         <button
    //           onClick={() => navigate("/search")}
    //           className={`text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium transition ${
    //             location.pathname === "/search" ? "text-pink-600" : ""
    //           }`}
    //         >
    //           Explore
    //         </button>
    //         <button className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium transition">
    //           Trips
    //         </button>
    //         <button className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium transition">
    //           Help
    //         </button>
    //       </div>

    //       {/* User Menu */}
    //       <div className="hidden md:flex items-center space-x-4">
    //         {user ? (
    //           <div className="relative">
    //             <button
    //               onClick={() => setShowProfileMenu(!showProfileMenu)}
    //               className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition"
    //             >
    //               <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
    //                 {user?.profileImage ? (
    //                   <img 
    //                     src={user.profileImage} 
    //                     alt="Profile" 
    //                     className="w-full h-full object-cover"
    //                   />
    //                 ) : (
    //                   <div className="w-full h-full flex items-center justify-center">
    //                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
    //                       <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    //                     </svg>
    //                   </div>
    //                 )}
    //               </div>
    //               <span className="text-sm font-medium">
    //                 {user?.name || "User"}
    //               </span>
    //               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    //               </svg>
    //             </button>

    //             {showProfileMenu && (
    //               <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
    //                 <div className="py-1">
    //                   <button
    //                     onClick={goToProfile}
    //                     className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
    //                   >
    //                     <div className="flex items-center space-x-2">
    //                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    //                       </svg>
    //                       <span>Profile</span>
    //                     </div>
    //                   </button>
    //                   <hr className="border-gray-200" />
    //                   <button
    //                     onClick={handleLogout}
    //                     className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
    //                   >
    //                     <div className="flex items-center space-x-2">
    //                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    //                       </svg>
    //                       <span>Logout</span>
    //                     </div>
    //                   </button>
    //                 </div>
    //               </div>
    //             )}
    //           </div>
    //         ) : (
    //           <button
    //             onClick={goToLogin}
    //             className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition"
    //           >
    //             Login
    //           </button>
    //         )}
    //       </div>

    //       {/* Mobile menu button */}
    //       <div className="md:hidden">
    //         <button
    //           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    //           className="text-gray-700 hover:text-pink-600 p-2"
    //         >
    //           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //             {mobileMenuOpen ? (
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    //             ) : (
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    //             )}
    //           </svg>
    //         </button>
    //       </div>
    //     </div>

    //     {/* Mobile menu */}
    //     {mobileMenuOpen && (
    //       <div className="md:hidden border-t border-gray-200 py-4">
    //         <div className="space-y-3">
    //           <button
    //             onClick={() => navigate("/home")}
    //             className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600 hover:bg-gray-50 rounded-lg"
    //           >
    //             Home
    //           </button>
    //           <button
    //             onClick={() => navigate("/search")}
    //             className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600 hover:bg-gray-50 rounded-lg"
    //           >
    //             Explore
    //           </button>
    //           <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600 hover:bg-gray-50 rounded-lg">
    //             Trips
    //           </button>
    //           <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600 hover:bg-gray-50 rounded-lg">
    //             Help
    //           </button>
              
    //           {user ? (
    //             <>
    //               <button
    //                 onClick={goToProfile}
    //                 className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600 hover:bg-gray-50 rounded-lg"
    //               >
    //                 Profile
    //               </button>
    //               <button
    //                 onClick={handleLogout}
    //                 className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600 hover:bg-gray-50 rounded-lg"
    //               >
    //                 Logout
    //               </button>
    //             </>
    //           ) : (
    //             <button
    //               onClick={goToLogin}
    //               className="block w-full text-left px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
    //             >
    //               Login
    //             </button>
    //           )}
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </nav>
    <nav></nav>
  );
};

export default HomepageNavbar;
