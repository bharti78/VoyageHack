import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/HomepageNavbar";

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
  }, []);

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

  const stats = [
    { label: "Trips Planned", value: "12", icon: "🌍" },
    { label: "Places Visited", value: "8", icon: "✈️" },
    { label: "Reviews", value: "23", icon: "⭐" },
    { label: "Saved Places", value: "45", icon: "❤️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-blue-100/20"></div>
      
      {/* Profile Content */}
      <div className="relative min-h-screen">
        <Navbar user={user} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              My
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600">
                {" "}Profile
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your account settings and travel preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {['profile', 'settings', 'activity'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-pink-600 border-b-2 border-pink-600'
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
                          className="absolute bottom-0 right-0 bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-full shadow-lg transition-colors"
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

                    {/* Stats */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats.map((stat, index) => (
                        <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                          <div className="text-2xl mb-1">{stat.icon}</div>
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
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
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
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

              {/* Settings Tab Content */}
              {activeTab === 'settings' && (
                <div className="p-8">
                  <div className="text-center py-16">
                    <div className="text-gray-500 text-lg">Settings coming soon...</div>
                  </div>
                </div>
              )}

              {/* Activity Tab Content */}
              {activeTab === 'activity' && (
                <div className="p-8">
                  <div className="text-center py-16">
                    <div className="text-gray-500 text-lg">Activity history coming soon...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
