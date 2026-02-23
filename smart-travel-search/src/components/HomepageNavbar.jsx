import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const links = [
  { label: "Home", path: "/home" },
  { label: "Products", path: "/search" },
  { label: "Solutions", path: "/flights" },
  { label: "TBO Cares", path: "/hotels" },
  { label: "Careers", path: "/cabs" },
  
];

export default function HomepageNavbar({ user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function go(path) {
    setMobileMenuOpen(false);
    setShowProfileMenu(false);
    navigate(path);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    go("/");
  }

  return (
    // <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="h-16 flex items-center justify-between gap-3">
    //       <button
    //         type="button"
    //         onClick={() => go("/home")}
    //         className="text-lg sm:text-xl font-bold text-pink-600 hover:text-pink-700 transition whitespace-nowrap"
    //       >
    //         VoyageHack
    //       </button>

    //       <div className="hidden md:flex items-center gap-2">
    //         {links.map((item) => (
    //           <button
    //             key={item.path}
    //             type="button"
    //             onClick={() => go(item.path)}
    //             className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
    //               location.pathname === item.path
    //                 ? "text-pink-600 bg-pink-50"
    //                 : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
    //             }`}
    //           >
    //             {item.label}
    //           </button>
    //         ))}
    //       </div>

    //       <div className="flex items-center gap-2">
    //         <div className="relative hidden md:block">
    //           <button
    //             type="button"
    //             onClick={() => setShowProfileMenu((v) => !v)}
    //             className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition"
    //           >
    //             <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
    //               {user?.profileImage ? (
    //                 <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
    //               ) : (
    //                 <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-600">
    //                   {(user?.name || "U").slice(0, 1).toUpperCase()}
    //                 </div>
    //               )}
    //             </div>
    //             <span className="text-sm font-medium">{user?.name || "User"}</span>
    //           </button>

    //           {showProfileMenu && (
    //             <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
    //               <button
    //                 type="button"
    //                 onClick={() => go("/profile")}
    //                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
    //               >
    //                 Profile
    //               </button>
    //               <button
    //                 type="button"
    //                 onClick={handleLogout}
    //                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
    //               >
    //                 Logout
    //               </button>
    //             </div>
    //           )}
    //         </div>

    //         <button
    //           type="button"
    //           className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-700"
    //           onClick={() => setMobileMenuOpen((v) => !v)}
    //           aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
    //         >
    //           {mobileMenuOpen ? (
    //             <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    //               <path d="M6 6l12 12M18 6l-12 12" />
    //             </svg>
    //           ) : (
    //             <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    //               <path d="M4 6h16M4 12h16M4 18h16" />
    //             </svg>
    //           )}
    //         </button>
    //       </div>
    //     </div>

    //     {mobileMenuOpen && (
    //       <div className="md:hidden pb-3 border-t border-gray-100">
    //         <div className="pt-3 space-y-1">
    //           {links.map((item) => (
    //             <button
    //               key={item.path}
    //               type="button"
    //               onClick={() => go(item.path)}
    //               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
    //                 location.pathname === item.path
    //                   ? "text-pink-600 bg-pink-50"
    //                   : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
    //               }`}
    //             >
    //               {item.label}
    //             </button>
    //           ))}
    //           <button
    //             type="button"
    //             onClick={() => go("/profile")}
    //             className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
    //           >
    //             Profile
    //           </button>
    //           <button
    //             type="button"
    //             onClick={handleLogout}
    //             className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
    //           >
    //             Logout
    //           </button>
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </nav>
    <nav></nav>
  );
}
