import React from 'react';
import { Users, MapPin, Calendar, Trophy, Star, Shield } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Find Sports Partners",
      description: "Connect with like-minded athletes in your area who share your passion for sports."
    },
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: "Local Events",
      description: "Discover sports events, tournaments, and activities happening near you."
    },
    {
      icon: <Calendar className="h-8 w-8 text-orange-600" />,
      title: "Easy Scheduling",
      description: "Create and manage sports events with our intuitive scheduling system."
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Safe Community",
      description: "Join a verified community of sports enthusiasts with robust safety features."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "200+", label: "Cities" },
    { number: "15+", label: "Sports" },
    { number: "10K+", label: "Events Monthly" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Trophy className="h-20 w-20 text-blue-600 animate-bounce" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
              Sports Buddy
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The world's largest sports matching platform. Connect with millions of sports enthusiasts, 
            find your perfect buddy, and join the game!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('login')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Login to Browse Events
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Register Now
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 group-hover:text-orange-500 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Why Choose Sports Buddy?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to connect, play, and grow your sports network
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Find Your Sports Buddy?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of athletes who have already found their perfect sports partners
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('register')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Register Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center mb-6">
            <Trophy className="h-8 w-8 text-blue-400 mr-2" />
            <span className="text-2xl font-bold">Sports Buddy</span>
          </div>
          <p className="text-gray-400 mb-6">
            Connecting athletes worldwide, one match at a time.
          </p>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-500">
              © 2024 Sports Buddy. Built with cutting-edge technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}