import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Calendar, MapPin, Clock, Trophy, Users } from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
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

export default function UserDashboard() {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SportsEvent | null>(null);
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
    fetchUserEvents();
  }, [currentUser]);

  const fetchUserEvents = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'sportsEvents'),
        where('createdBy', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const eventsData: SportsEvent[] = [];
      
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() } as SportsEvent);
      });

      setEvents(eventsData);
      logger.info('User events fetched successfully', 'FETCH_USER_EVENTS', 
        { userId: currentUser.uid, eventCount: eventsData.length });
    } catch (error: any) {
      logger.error('Failed to fetch user events', 'FETCH_USER_EVENTS_FAILED', 
        { userId: currentUser?.uid, error: error.message });
    } finally {
      setLoading(false);
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
        logger.info('Sports event updated', 'UPDATE_SPORTS_EVENT', 
          { userId: currentUser.uid, eventId: editingEvent.id, eventName: formData.name });
      } else {
        await addDoc(collection(db, 'sportsEvents'), {
          ...formData,
          createdBy: currentUser.uid,
          createdAt: new Date().toISOString()
        });
        logger.info('Sports event created', 'CREATE_SPORTS_EVENT', 
          { userId: currentUser.uid, eventName: formData.name });
      }
      
      resetForm();
      fetchUserEvents();
    } catch (error: any) {
      logger.error('Failed to save sports event', 'SAVE_SPORTS_EVENT_FAILED', 
        { userId: currentUser?.uid, error: error.message });
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteDoc(doc(db, 'sportsEvents', eventId));
      logger.info('Sports event deleted', 'DELETE_SPORTS_EVENT', 
        { userId: currentUser?.uid, eventId });
      fetchUserEvents();
    } catch (error: any) {
      logger.error('Failed to delete sports event', 'DELETE_SPORTS_EVENT_FAILED', 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome back, {userProfile?.displayName}!
              </h1>
              <p className="text-xl text-gray-600">Manage your sports events and activities</p>
            </div>
            <Trophy className="h-16 w-16 text-blue-600" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold">{events.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold">
                  {events.filter(event => new Date(event.date).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <MapPin className="h-10 w-10 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Sports Types</p>
                <p className="text-3xl font-bold">
                  {new Set(events.map(event => event.sport)).size}
                </p>
              </div>
              <Users className="h-10 w-10 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Add Event Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Event</span>
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Events Yet</h3>
            <p className="text-gray-500 mb-6">Create your first sports event to get started!</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/20 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 truncate">{event.name}</h3>
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
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Trophy className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">{event.sport}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-green-500" />
                      <span>{event.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-purple-500" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="mt-4 text-gray-600 text-sm line-clamp-3">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Event description (optional)"
                    />
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                    >
                      {editingEvent ? 'Update Event' : 'Create Event'}
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