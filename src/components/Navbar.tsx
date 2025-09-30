import React, { useState } from 'react';
import { Menu, X, Users, Trophy, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate('home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center space-x-2"
            >
              <Trophy className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Sports Buddy
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!currentUser ? (
              <>
                <button
                  onClick={() => handleNavigate('home')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === 'home'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigate('login')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === 'login'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigate('admin-login')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === 'admin-login'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleNavigate('register')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate(userProfile?.isAdmin ? 'admin' : 'events')}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === 'events' || currentPage === 'admin'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {userProfile?.isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  <span>{userProfile?.isAdmin ? 'Post Events' : 'Browse Events'}</span>
                </button>
                <span className="text-gray-600">Welcome, {userProfile?.displayName}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!currentUser ? (
              <>
                <button
                  onClick={() => handleNavigate('home')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigate('login')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigate('admin-login')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                >
                  Admin
                </button>
                <button
                  onClick={() => handleNavigate('register')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-blue-500 hover:bg-blue-50 rounded-md"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate(userProfile?.isAdmin ? 'admin' : 'events')}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  {userProfile?.isAdmin ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  <span>{userProfile?.isAdmin ? 'Post Events' : 'Browse Events'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-red-500 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}