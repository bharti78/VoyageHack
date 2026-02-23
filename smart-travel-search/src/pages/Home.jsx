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
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/travel.jpeg)' }}>
      <div className="min-h-screen bg-black bg-opacity-40">
        <Navbar user={user} />
        
        {/* Hero Section with Search */}
        <SearchSection />
      </div>
    </div>
  );
};

export default Home;
