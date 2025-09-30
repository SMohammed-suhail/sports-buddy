import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Shield, MapPin, Trophy, Building } from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface City {
  id: string;
  name: string;
  country: string;
  createdAt: string;
}

interface Area {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  createdAt: string;
}

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

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'events' | 'categories' | 'cities' | 'areas'>('events');
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch events
      const eventsSnap = await getDocs(collection(db, 'sportsEvents'));
      const eventsData: SportsEvent[] = [];
      eventsSnap.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() } as SportsEvent);
      });
      setEvents(eventsData);

      // Fetch categories
      const categoriesSnap = await getDocs(collection(db, 'sportsCategories'));
      const categoriesData: Category[] = [];
      categoriesSnap.forEach((doc) => {
        categoriesData.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(categoriesData);

      // Fetch cities
      const citiesSnap = await getDocs(collection(db, 'cities'));
      const citiesData: City[] = [];
      citiesSnap.forEach((doc) => {
        citiesData.push({ id: doc.id, ...doc.data() } as City);
      });
      setCities(citiesData);

      // Fetch areas
      const areasSnap = await getDocs(collection(db, 'areas'));
      const areasData: Area[] = [];
      areasSnap.forEach((doc) => {
        const areaData = doc.data();
        const city = citiesData.find(c => c.id === areaData.cityId);
        areasData.push({ 
          id: doc.id, 
          ...areaData,
          cityName: city?.name || 'Unknown City'
        } as Area);
      });
      setAreas(areasData);

      logger.info('Admin data fetched successfully', 'FETCH_ADMIN_DATA', {
        userId: currentUser?.uid,
        eventsCount: eventsData.length,
        categoriesCount: categoriesData.length,
        citiesCount: citiesData.length,
        areasCount: areasData.length
      });
    } catch (error: any) {
      logger.error('Failed to fetch admin data', 'FETCH_ADMIN_DATA_FAILED', {
        userId: currentUser?.uid,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      let collectionName = '';
      let logAction = '';

      switch (activeTab) {
        case 'events':
          collectionName = 'sportsEvents';
          logAction = editingItem ? 'UPDATE_EVENT' : 'CREATE_EVENT';
          if (!editingItem) {
            formData.createdBy = currentUser.uid;
          }
          break;
        case 'categories':
          collectionName = 'sportsCategories';
          logAction = editingItem ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY';
          break;
        case 'cities':
          collectionName = 'cities';
          logAction = editingItem ? 'UPDATE_CITY' : 'CREATE_CITY';
          break;
        case 'areas':
          collectionName = 'areas';
          logAction = editingItem ? 'UPDATE_AREA' : 'CREATE_AREA';
          break;
      }

      if (editingItem) {
        await updateDoc(doc(db, collectionName, editingItem.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, collectionName), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }

      logger.info(`${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'created'}`, logAction, {
        userId: currentUser.uid,
        itemId: editingItem?.id,
        itemData: formData
      });

      resetForm();
      fetchData();
    } catch (error: any) {
      logger.error(`Failed to save ${activeTab.slice(0, -1)}`, `${logAction}_FAILED`, {
        userId: currentUser?.uid,
        error: error.message
      });
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;

    try {
      let collectionName = '';
      let logAction = '';

      switch (activeTab) {
        case 'categories':
          collectionName = 'sportsCategories';
          logAction = 'DELETE_CATEGORY';
          break;
        case 'cities':
          collectionName = 'cities';
          logAction = 'DELETE_CITY';
          break;
        case 'areas':
          collectionName = 'areas';
          logAction = 'DELETE_AREA';
          break;
      }

      await deleteDoc(doc(db, collectionName, item.id));

      logger.info(`${activeTab.slice(0, -1)} deleted`, logAction, {
        userId: currentUser?.uid,
        itemId: item.id
      });

      fetchData();
    } catch (error: any) {
      logger.error(`Failed to delete ${activeTab.slice(0, -1)}`, `${logAction}_FAILED`, {
        userId: currentUser?.uid,
        itemId: item.id,
        error: error.message
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({});
    setEditingItem(null);
    setShowModal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const openAddModal = () => {
    setFormData({});
    setEditingItem(null);
    setShowModal(true);
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    let data: any[] = [];
    let emptyMessage = '';

    switch (activeTab) {
      case 'events':
        data = events;
        emptyMessage = 'No sports events found';
        break;
      case 'categories':
        data = categories;
        emptyMessage = 'No sports categories found';
        break;
      case 'cities':
        data = cities;
        emptyMessage = 'No cities found';
        break;
      case 'areas':
        data = areas;
        emptyMessage = 'No areas found';
        break;
    }

    if (data.length === 0) {
      return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-2">{emptyMessage}</h3>
          <p className="text-gray-500 mb-6">Create your first {activeTab.slice(0, -1)} to get started!</p>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Add {activeTab.slice(0, -1)}
          </button>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/20 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 truncate">{item.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {activeTab === 'cities' && (
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-green-500" />
                  <span>{item.country}</span>
                </div>
              )}

              {activeTab === 'areas' && (
                <div className="flex items-center text-gray-600 mb-2">
                  <Building className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{item.cityName}</span>
                </div>
              )}
              
              {item.description && (
                <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
              )}
              
              <p className="text-xs text-gray-400 mt-4">
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>

              {activeTab === 'events' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sport
                    </label>
                    <select
                      name="sport"
                      required
                      value={formData.sport || ''}
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
                      value={formData.location || ''}
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
                        value={formData.date || ''}
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
                        value={formData.time || ''}
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
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Event description (optional)"
                    />
                  </div>
                </>
              )}

              {activeTab === 'categories' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter description"
                  />
                </div>
              )}

              {activeTab === 'cities' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={formData.country || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter country"
                  />
                </div>
              )}

              {activeTab === 'areas' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    name="cityId"
                    required
                    value={formData.cityId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}, {city.country}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  {editingItem ? 'Update' : 'Create'}
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                <Shield className="h-10 w-10 text-blue-600 mr-3" />
                Admin Panel
              </h1>
              <p className="text-xl text-gray-600">
                Welcome back, {userProfile?.displayName}! Manage your platform.
              </p>
            </div>
            <Trophy className="h-16 w-16 text-blue-600" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Events</p>
                <p className="text-3xl font-bold">{events.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Categories</p>
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
              <Trophy className="h-10 w-10 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Cities</p>
                <p className="text-3xl font-bold">{cities.length}</p>
              </div>
              <MapPin className="h-10 w-10 text-green-200" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl mb-8 border border-white/20">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'events', label: 'Sports Events', icon: Calendar },
              { key: 'categories', label: 'Sports Categories', icon: Trophy },
              { key: 'cities', label: 'Cities', icon: MapPin },
              { key: 'areas', label: 'Areas', icon: Building }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">
                Manage {activeTab}
              </h2>
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Add {activeTab.slice(0, -1)}</span>
              </button>
            </div>

            {renderTabContent()}
          </div>
        </div>

        {renderModal()}
      </div>
      </div>
    </div>
  );
}