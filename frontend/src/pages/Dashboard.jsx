import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import API from '../api/axios';
import { PlusCircle, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import moment from 'moment';

const STAGES = ['Coordinator', 'HOD', 'Principal', 'Director', 'Completed'];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/permissions');
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Approved</span>;
      case 'Rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {user?.role === 'Student' && (
          <Link
            to="/create-request"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 shadow transition-colors font-medium text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Request
          </Link>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
        <ul className="divide-y divide-gray-200">
          {requests.length === 0 ? (
            <li className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No permission requests found.</p>
            </li>
          ) : (
            requests.map((req) => (
              <li key={req._id}>
                <Link to={`/request/${req._id}`} className="block hover:bg-gray-50 transition-colors">
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 bg-brand-50 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">{req.eventName}</p>
                        <p className="text-xs text-gray-500 mt-1">Event Date: {moment(req.date).format('MMMM Do YYYY')}</p>
                        {user.role !== 'Student' && (
                          <p className="text-xs text-gray-500 mt-1">Requested by: {req.createdBy.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(req.status)}
                      <p className="text-xs text-gray-500">
                        {req.status === 'Pending' ? `At ${req.currentStage}` : req.status === 'Rejected' ? `By ${req.rejectedBy}` : 'Completed'}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
