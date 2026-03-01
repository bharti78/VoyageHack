import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchSectionTopNav from "../components/SearchSectionTopNav";
import SearchSectionFooter from "../components/SearchSectionFooter";
import { getBookingRecords, updateBookingRecordStatus } from "../utils/bookingLedger";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    profileImage: ""
  });
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        bio: parsedUser.bio || "",
        profileImage: parsedUser.profileImage || ""
      });
      setPreviewImage(parsedUser.profileImage || "");
    }
    setBookings(getBookingRecords());
  }, []);

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  };

  const handleCancelBooking = (booking) => {
    if (!booking?.id) return;
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    const ok = updateBookingRecordStatus(booking.id, "Cancelled");
    if (ok) {
      setBookings(getBookingRecords());
      setSuccess("Booking cancelled successfully.");
      setError("");
      setTimeout(() => setSuccess(""), 2500);
    } else {
      setError("Unable to cancel this booking right now. Please try again.");
      setTimeout(() => setError(""), 2500);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      
      // Compress image before converting to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set max dimensions
          const maxWidth = 400;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPreviewImage(compressedDataUrl);
          setUser(prev => ({ ...prev, profileImage: compressedDataUrl }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_ORIGIN}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError((data && data.error) || "Failed to update profile");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user || user));
      setSuccess("Profile updated successfully!");
    } catch {
      setError("Network error. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <SearchSectionTopNav />
      <div className="pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
              My
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f5298] to-[#f26b25]">
                {" "}Profile
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Manage your account settings and travel preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {['profile', 'bookings'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-[#0f5298] border-b-2 border-[#0f5298]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Profile Tab Content */}
              {activeTab === 'profile' && (
                <div className="p-8">
                  {/* Profile Header */}
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-xl">
                          {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-[#0f5298] hover:bg-[#0b3f75] text-white p-2 rounded-full shadow-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mt-4">{user.name || "Your Name"}</h3>
                      <p className="text-gray-600">{user.email || "your.email@example.com"}</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={user.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f5298] focus:border-transparent"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={user.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f5298] focus:border-transparent bg-gray-50"
                          placeholder="Enter your email"
                          disabled
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={user.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f5298] focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={user.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f5298] focus:border-transparent resize-none"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>

                  {/* Messages */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                      {success}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-[#0f5298] to-[#f26b25] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0b457f] hover:to-[#d95b1b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {/* Bookings Tab Content */}
              {activeTab === 'bookings' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                    <h3 className="text-2xl font-bold text-gray-900">My Bookings</h3>
                    <button
                      type="button"
                      onClick={() => setBookings(getBookingRecords())}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Refresh
                    </button>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-4xl mb-3">🧳</div>
                      <div className="text-gray-700 font-semibold">No bookings yet</div>
                      <div className="text-gray-500 text-sm mt-1">Book flights, hotels, or cabs to see them here.</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                                {String(item.service || "booking")}
                              </div>
                              <div className="text-lg font-semibold text-gray-900">{item.title || "Booking"}</div>
                              <div className="text-sm text-gray-600 mt-1">{item.location || "Location not available"}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Status</div>
                              <div className="text-sm font-bold text-green-600">{item.status || "Confirmed"}</div>
                              <div className="text-xs text-gray-500 mt-1">{formatDateTime(item.createdAt || item.date)}</div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div className="p-3 rounded-xl bg-gray-50">
                              <div className="text-gray-500 text-xs">Reference</div>
                              <div className="font-semibold text-gray-900 break-all">{item.reference || "N/A"}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50">
                              <div className="text-gray-500 text-xs">Amount</div>
                              <div className="font-semibold text-gray-900">
                                {Number(item.amount || 0) > 0 ? `${item.currency || "INR"} ${Number(item.amount).toLocaleString("en-IN")}` : "N/A"}
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50">
                              <div className="text-gray-500 text-xs">Booked On</div>
                              <div className="font-semibold text-gray-900">{formatDateTime(item.createdAt)}</div>
                            </div>
                          </div>

                          {String(item.status || "").toLowerCase() !== "cancelled" && (
                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleCancelBooking(item)}
                                className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors"
                              >
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <SearchSectionFooter />
    </div>
  );
}

export default Profile;


