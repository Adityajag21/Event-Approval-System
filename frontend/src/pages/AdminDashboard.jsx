import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Users, Plus, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [clubs, setClubs] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);

  // New club form state
  const [newClubName, setNewClubName] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clubsRes, coordsRes] = await Promise.all([
        API.get('/admin/clubs'),
        API.get('/admin/coordinators')
      ]);
      setClubs(clubsRes.data);
      setCoordinators(coordsRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/admin/clubs', {
        name: newClubName,
        description: newClubDesc
      });
      setClubs([...clubs, data]);
      setNewClubName('');
      setNewClubDesc('');
      toast.success('Club created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create club');
    }
  };

  const handleAssignCoordinator = async (clubId, coordinatorId) => {
    try {
      const { data } = await API.put(`/admin/clubs/${clubId}/assign`, {
        coordinatorId: coordinatorId || null
      });
      setClubs(clubs.map(c => c._id === clubId ? data : c));
      toast.success('Coordinator updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update coordinator');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading admin dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <Shield className="w-8 h-8 text-brand-600" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Create Club Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-500" />
              Create New Club
            </h2>
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Club Name</label>
                <input
                  type="text"
                  required
                  value={newClubName}
                  onChange={e => setNewClubName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  placeholder="e.g. Coding Club"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  value={newClubDesc}
                  onChange={e => setNewClubDesc(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  rows="3"
                  placeholder="Describe the club's purpose..."
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                Create Club
              </button>
            </form>
          </div>
        </div>

        {/* Clubs List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-500" />
                Manage Clubs & Coordinators
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {clubs.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No clubs found. Create one to get started.
                </div>
              ) : (
                clubs.map(club => (
                  <div key={club._id} className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{club.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{club.description}</p>
                    </div>
                    
                    <div className="w-full sm:w-auto mt-4 sm:mt-0 flex-shrink-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Assign Coordinator
                      </label>
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 rounded-md"
                        value={club.coordinator?._id || ''}
                        onChange={(e) => handleAssignCoordinator(club._id, e.target.value)}
                      >
                        <option value="">-- Unassigned --</option>
                        {coordinators.map(coord => (
                          <option key={coord._id} value={coord._id}>
                            {coord.name} ({coord.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
