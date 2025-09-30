import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Calendar, MapPin, Clock, Trophy, Users, Eye, Phone, Hash } from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
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

interface TeamJoin {
  id: string;
  teamName: string;
  totalMembers: number;
  phoneNumber: string;
  eventId: string;
  eventName: string;
  joinedBy: string;
  joinedAt: string;
}

export default function AdminEventManager() {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [teamJoins, setTeamJoins] = useState<TeamJoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SportsEvent | null>(null);
  const [selectedEventTeams, setSelectedEventTeams] = useState<TeamJoin[]>([]);
  const [selectedEventName, setSelectedEventName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    location: '',
    date: '',
    time: '',
    description: ''
  });

  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    fetchEvents();
    fetchTeamJoins();
  }, [currentUser]);

  const fetchEvents = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      // Fetch all events, not just admin's own events
      const q = query(collection(db, 'sportsEvents'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const eventsData: SportsEvent[] = [];
      
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() } as SportsEvent);
      });

      setEvents(eventsData);
      logger.info('Admin events fetched successfully', 'FETCH_ADMIN_EVENTS', 
        { userId: currentUser.uid, eventCount: eventsData.length });
    } catch (error: any) {
      logger.error('Failed to fetch admin events', 'FETCH_ADMIN_EVENTS_FAILED', 
        { userId: currentUser?.uid, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamJoins = async () => {
    if (!currentUser) return;

    try {
      const q = query(collection(db, 'teamJoins'), orderBy('joinedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const teamsData: TeamJoin[] = [];
      
      querySnapshot.forEach((doc) => {
        teamsData.push({ id: doc.id, ...doc.data() } as TeamJoin);
      });

      setTeamJoins(teamsData);
      logger.info('Team joins fetched successfully', 'FETCH_TEAM_JOINS', 
        { userId: currentUser.uid, teamsCount: teamsData.length });
    } catch (error: any) {
      logger.error('Failed to fetch team joins', 'FETCH_TEAM_JOINS_FAILED', 
        { userId: currentUser?.uid, error: error.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      if (editingEvent) {
        await updateDoc(doc(db, 'sportsEvents', editingEvent.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        logger.info('Sports event updated by admin', 'ADMIN_UPDATE_EVENT', 
          { userId: currentUser.uid, eventId: editingEvent.id, eventName: formData.name });
      } else {
        await addDoc(collection(db, 'sportsEvents'), {
          ...formData,
          createdBy: currentUser.uid,
          createdAt: new Date().toISOString()
        });
        logger.info('Sports event created by admin', 'ADMIN_CREATE_EVENT', 
          { userId: currentUser.uid, eventName: formData.name });
      }
      
      resetForm();
      fetchEvents();
      fetchTeamJoins();
    } catch (error: any) {
      logger.error('Failed to save sports event', 'ADMIN_SAVE_EVENT_FAILED', 
        { userId: currentUser?.uid, error: error.message });
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteDoc(doc(db, 'sportsEvents', eventId));
      logger.info('Sports event deleted by admin', 'ADMIN_DELETE_EVENT', 
        { userId: currentUser?.uid, eventId });
      fetchEvents();
      fetchTeamJoins();
    } catch (error: any) {
      logger.error('Failed to delete sports event', 'ADMIN_DELETE_EVENT_FAILED', 
        { userId: currentUser?.uid, eventId, error: error.message });
    }
  };

  const handleEdit = (event: SportsEvent) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      sport: event.sport,
      location: event.location,
      date: event.date,
      time: event.time,
      description: event.description
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sport: '',
      location: '',
      date: '',
      time: '',
      description: ''
    });
    setEditingEvent(null);
    setShowModal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleViewTeams = (event: SportsEvent) => {
    const eventTeams = teamJoins.filter(team => team.eventId === event.id);
    setSelectedEventTeams(eventTeams);
    setSelectedEventName(event.name);
    setShowTeamsModal(true);
  };

  const getTeamCount = (eventId: string) => {
    return teamJoins.filter(team => team.eventId === eventId).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                  <Trophy className="h-10 w-10 text-purple-600 mr-3" />
                  Admin Event Manager
                </h1>
                <p className="text-xl text-gray-600">
                  Welcome, {userProfile?.displayName}! Post and manage sports events.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Post New Event</span>
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Events Posted</p>
                <p className="text-3xl font-bold">{events.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-purple-200" />
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Events Posted Yet</h3>
              <p className="text-gray-500 mb-6">Create your first sports event to get started!</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Post Event
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/20 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors truncate">
                        {event.name}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Trophy className="h-5 w-5 mr-3 text-purple-500" />
                        <span className="font-medium">{event.sport}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-3 text-green-500" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-3 text-orange-500" />
                        <span>{event.time}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-3 text-purple-500" />
                        <span>{getTeamCount(event.id)} Teams Joined</span>
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleViewTeams(event)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Teams ({getTeamCount(event.id)})</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Teams Modal */}
          {showTeamsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Teams for "{selectedEventName}"</h2>
                    <button
                      onClick={() => setShowTeamsModal(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {selectedEventTeams.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Teams Yet</h3>
                      <p className="text-gray-500">No teams have joined this event yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedEventTeams.map((team, index) => (
                        <div
                          key={team.id}
                          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-800">Team {index + 1}: {team.teamName}</h3>
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {team.totalMembers} Members
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center text-gray-600">
                              <Hash className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="font-medium">Members:</span>
                              <span className="ml-2">{team.totalMembers}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2 text-green-500" />
                              <span className="font-medium">Contact:</span>
                              <span className="ml-2">{team.phoneNumber}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-sm text-gray-500">
                            Joined: {new Date(team.joinedAt).toLocaleDateString()} at {new Date(team.joinedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowTeamsModal(false)}
                      className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {editingEvent ? 'Edit Event' : 'Post New Event'}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter event name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sport
                      </label>
                      <select
                        name="sport"
                        required
                        value={formData.sport}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select a sport</option>
                        <option value="Football">Football</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Soccer">Soccer</option>
                        <option value="Baseball">Baseball</option>
                        <option value="Volleyball">Volleyball</option>
                        <option value="Cricket">Cricket</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Swimming">Swimming</option>
                        <option value="Running">Running</option>
                        <option value="Cycling">Cycling</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter location"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          required
                          value={formData.date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time
                        </label>
                        <input
                          type="time"
                          name="time"
                          required
                          value={formData.time}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Event description (optional)"
                      />
                    </div>
                    
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                      >
                        {editingEvent ? 'Update Event' : 'Post Event'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
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
    </div>
  );
}