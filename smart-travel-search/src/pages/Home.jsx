import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/HomepageNavbar';
import SearchSection from '../components/SearchSection';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      
      {/* Hero Section with Search */}
      <SearchSection />
    </div>
  );
};

export default Home;
