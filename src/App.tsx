import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Register from './components/Register';
import EventsPage from './components/EventsPage';
import AdminEventManager from './components/AdminEventManager';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { currentUser, userProfile } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (currentUser) {
      // Redirect to appropriate page based on user role
      if (currentPage === 'home' || currentPage === 'login' || currentPage === 'admin-login' || currentPage === 'register') {
        if (userProfile?.isAdmin) {
          setCurrentPage('admin');
          return <AdminEventManager />;
        } else {
          setCurrentPage('events');
          return <EventsPage onNavigate={handleNavigate} />;
        }
      }
      
      // Handle specific pages
      if (userProfile?.isAdmin && currentPage === 'admin') {
        return <AdminEventManager />;
      } else if (!userProfile?.isAdmin && currentPage === 'events') {
        return <EventsPage onNavigate={handleNavigate} />;
      } else {
        // Redirect to appropriate page if user tries to access wrong page
        if (userProfile?.isAdmin) {
          setCurrentPage('admin');
          return <AdminEventManager />;
        } else {
          setCurrentPage('events');
          return <EventsPage onNavigate={handleNavigate} />;
        }
      }
    }

    // Public pages
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'admin-login':
        return <AdminLogin onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;