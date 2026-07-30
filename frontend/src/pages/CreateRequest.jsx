import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

export default function CreateRequest() {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  
  // New States
  const [clubs, setClubs] = useState([]);
  const [hods, setHods] = useState([]);
  const [clubId, setClubId] = useState('');
  const [includeHOD, setIncludeHOD] = useState(false);
  const [targetHOD, setTargetHOD] = useState('');

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const { data } = await API.get('/permissions/form-data');
        setClubs(data.clubs || []);
        setHods(data.hods || []);
      } catch (error) {
        toast.error('Failed to load form data');
      } finally {
        setDataLoading(false);
      }
    };
    fetchFormData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Permission letter is required');
      return;
    }
    if (!clubId) {
      toast.error('Please select a club');
      return;
    }
    if (includeHOD && !targetHOD) {
      toast.error('Please select an HOD');
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('eventName', eventName);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('clubId', clubId);
    if (includeHOD && targetHOD) {
      formData.append('targetHOD', targetHOD);
    }
    formData.append('permissionLetter', file);

    try {
      await API.post('/permissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Permission request created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (dataLoading) return <div className="p-8 text-center text-gray-500">Loading form...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">New Permission Request</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Name</label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 text-sm"
              placeholder="e.g., Annual Tech Fest 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description / Goal</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 text-sm"
              placeholder="Provide event details..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Date</label>
            <input
              type="date"
              required
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 text-sm"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Routing</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Club (Assigns Coordinator)</label>
                <select
                  required
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                >
                  <option value="">-- Select a Club --</option>
                  {clubs.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} (Coordinator: {c.coordinator ? c.coordinator.name : 'None'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 mt-4 inline-flex">
                <input
                  type="checkbox"
                  id="includeHOD"
                  checked={includeHOD}
                  onChange={(e) => setIncludeHOD(e.target.checked)}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <label htmlFor="includeHOD" className="text-sm font-medium text-gray-700 select-none">
                  Require HOD Approval?
                </label>
              </div>

              {includeHOD && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">Target HOD</label>
                  <select
                    required={includeHOD}
                    value={targetHOD}
                    onChange={(e) => setTargetHOD(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                  >
                    <option value="">-- Select HOD --</option>
                    {hods.map(h => (
                      <option key={h._id} value={h._id}>
                        {h.name} {h.department ? `- ${h.department}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Permission Letter (PDF/DOC)</label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-brand-50 file:text-brand-700
                hover:file:bg-brand-100 transition-colors cursor-pointer"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
