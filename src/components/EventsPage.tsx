import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Trophy, Users, Search, Filter, Star, X } from 'lucide-react';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface SportsEvent {
  id: string;
  name: string;
  sport: string;
  location: string;
  date: string;
  time: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

interface TeamDetails {
  teamName: string;
  totalMembers: number;
  phoneNumber: string;
  eventId: string;
  eventName: string;
  joinedBy: string;
  joinedAt: string;
}

interface EventsPageProps {
  onNavigate: (page: string) => void;
}

export default function EventsPage({ onNavigate }: EventsPageProps) {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
  const [teamFormData, setTeamFormData] = useState({
    teamName: '',
    totalMembers: 1,
    phoneNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { currentUser } = useAuth();
  const sports = ['Football', 'Basketball', 'Tennis', 'Soccer', 'Baseball', 'Volleyball', 'Cricket', 'Badminton', 'Swimming', 'Running', 'Cycling'];

  useEffect(() => {
    fetchAllEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedSport, selectedDate]);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'sportsEvents'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const eventsData: SportsEvent[] = [];
      
      querySnapshot.forEach((doc) => {
        const eventData = doc.data() as SportsEvent;
        // Show all events (both past and future)
        eventsData.push({ id: doc.id, ...eventData });
      });

      setEvents(eventsData);
      logger.info('Public events fetched successfully', 'FETCH_PUBLIC_EVENTS', 
        { eventCount: eventsData.length });
    } catch (error: any) {
      logger.error('Failed to fetch public events', 'FETCH_PUBLIC_EVENTS_FAILED', 
        { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSport) {
      filtered = filtered.filter(event => event.sport === selectedSport);
    }

    if (selectedDate) {
      filtered = filtered.filter(event => event.date === selectedDate);
    }

    setFilteredEvents(filtered);
  };

  const handleJoinEvent = (event: SportsEvent) => {
    setSelectedEvent(event);
    setShowTeamModal(true);
  };

  const handleTeamFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeamFormData(prev => ({
      ...prev,
      [name]: name === 'totalMembers' ? parseInt(value) || 1 : value
    }));
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedEvent) return;

    try {
      setSubmitting(true);
      
      const teamDetails: TeamDetails = {
        teamName: teamFormData.teamName,
        totalMembers: teamFormData.totalMembers,
        phoneNumber: teamFormData.phoneNumber,
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        joinedBy: currentUser.uid,
        joinedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'teamJoins'), teamDetails);
      
      logger.info('Team joined event successfully', 'TEAM_JOIN_EVENT', {
        userId: currentUser.uid,
        eventId: selectedEvent.id,
        teamName: teamFormData.teamName
      });

      // Reset form and close modal
      setTeamFormData({ teamName: '', totalMembers: 1, phoneNumber: '' });
      setShowTeamModal(false);
      setSelectedEvent(null);
      
      alert('Successfully joined the event! The admin will contact you soon.');
    } catch (error: any) {
      logger.error('Failed to join event', 'TEAM_JOIN_EVENT_FAILED', {
        userId: currentUser?.uid,
        eventId: selectedEvent?.id,
        error: error.message
      });
      alert('Failed to join event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetTeamModal = () => {
    setTeamFormData({ teamName: '', totalMembers: 1, phoneNumber: '' });
    setShowTeamModal(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Trophy className="h-16 w-16 text-blue-600 animate-bounce" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                Discover Sports Events
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join exciting sports events in your area. Connect with fellow athletes and discover new opportunities to play!
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                />
              </div>
              
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
              >
                <option value="">All Sports</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
              />
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSport('');
                  setSelectedDate('');
                }}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Filter className="h-5 w-5" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
              <Trophy className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-600 mb-4">No Events Found</h3>
              <p className="text-gray-500 mb-8 text-lg">
                {searchTerm || selectedSport || selectedDate 
                  ? "Try adjusting your search filters to find more events."
                  : "Be the first to create an exciting sports event!"
                }
              </p>
              <button
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Join Sports Buddy
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Found
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/20 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {event.name}
                        </h3>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {event.sport}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-5 w-5 mr-3 text-green-500" />
                          <span className="font-medium">{event.location}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-5 w-5 mr-3 text-orange-500" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          <span>Join Event</span>
                        </div>
                        <button
                          onClick={() => handleJoinEvent(event)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 text-sm"
                        >
                          Join Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Team Details Modal */}
        {showTeamModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-md w-full border border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Team Details</h2>
                  <button
                    onClick={resetTeamModal}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">{selectedEvent.name}</h3>
                  <div className="text-sm text-blue-600 space-y-1">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2" />
                      <span>{selectedEvent.sport}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(selectedEvent.date)} at {selectedEvent.time}</span>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleTeamSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      name="teamName"
                      required
                      value={teamFormData.teamName}
                      onChange={handleTeamFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your team name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Members *
                    </label>
                    <input
                      type="number"
                      name="totalMembers"
                      required
                      min="1"
                      max="50"
                      value={teamFormData.totalMembers}
                      onChange={handleTeamFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Number of team members"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      value={teamFormData.phoneNumber}
                      onChange={handleTeamFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter contact number"
                    />
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
                    >
                      {submitting ? 'Joining...' : 'Join Event'}
                    </button>
                    <button
                      type="button"
                      onClick={resetTeamModal}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}