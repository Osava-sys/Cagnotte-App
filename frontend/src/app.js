import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import Dashboard from './pages/Dashboard';
import { auth } from './services/api';
import './styles/main.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = auth.getCurrentUser();
    if (currentUser && auth.isAuthenticated()) {
      setUser(currentUser);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <Header user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/campaigns/:id" 
              element={<CampaignDetail user={user} />} 
            />
            <Route 
              path="/campaigns/create" 
              element={user ? <CreateCampaign user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

