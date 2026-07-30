import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import AuthContext from '../context/AuthContext';
import { CheckCircle, XCircle, Clock, FileText, ArrowLeft, Download } from 'lucide-react';
import moment from 'moment';
import { toast } from 'react-hot-toast';

export default function ViewRequest() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const { data } = await API.get(`/permissions/${id}`);
      setRequest(data);
    } catch (error) {
      toast.error('Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this request?')) return;
    setActionLoading(true);
    try {
      await API.put(`/permissions/${id}/approve`);
      toast.success('Request approved successfully');
      fetchRequest();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason) {
      toast.error('Please provide a reason');
      return;
    }
    setActionLoading(true);
    try {
      await API.put(`/permissions/${id}/reject`, { reason: rejectReason });
      toast.success('Request rejected');
      setShowRejectModal(false);
      fetchRequest();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!request) return <div className="p-8 text-center text-red-500">Request not found</div>;

  const canAct = user.role !== 'Student' && request.status === 'Pending' && request.currentStage === user.role;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{request.eventName}</h1>
                <p className="text-sm text-gray-500 mt-1">Requested by {request.createdBy.name} on {moment(request.createdAt).format('LL')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {request.status === 'Approved' && <CheckCircle className="w-4 h-4" />}
                {request.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                {request.status === 'Pending' && <Clock className="w-4 h-4" />}
                {request.status}
              </span>
            </div>

            <div className="prose max-w-none text-gray-700 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
              <p className="bg-gray-50 p-4 rounded-lg">{request.description}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-brand-50 p-4 rounded-lg">
                <span className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">Event Date</span>
                <span className="text-sm font-medium text-brand-900">{moment(request.date).format('LL')}</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <span className="block text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Current Stage</span>
                <span className="text-sm font-medium text-blue-900">{request.status === 'Approved' ? 'Completed' : request.currentStage}</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <span className="block text-xs font-semibold text-purple-800 uppercase tracking-wider mb-1">Club</span>
                <span className="text-sm font-medium text-purple-900">{request.club?.name || 'N/A'}</span>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <span className="block text-xs font-semibold text-orange-800 uppercase tracking-wider mb-1">HOD Approval</span>
                <span className="text-sm font-medium text-orange-900">{request.skipHOD ? 'Skipped' : (request.targetHOD?.name || 'Required')}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Attached Document</h3>
              <a
                href={`http://localhost:5000${request.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                download
              >
                <FileText className="w-4 h-4 text-brand-600" />
                View Permission Letter
                <Download className="w-4 h-4 ml-1 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Rejection Alert */}
          {request.status === 'Rejected' && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Rejected by {request.rejectedBy}</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{request.rejectionReason}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Panel */}
          {canAct && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Action Required</h3>
              {!showRejectModal ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReject} className="space-y-3">
                  <textarea
                    autoFocus
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Provide rejection reason..."
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(false)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Submit Rejection
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Approval History</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {request.history.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <div className="relative pb-8">
                      {itemIdx !== request.history.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            item.action === 'Created' ? 'bg-blue-500' :
                            item.action === 'Approved' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {item.action === 'Created' ? <FileText className="h-4 w-4 text-white" /> :
                             item.action === 'Approved' ? <CheckCircle className="h-4 w-4 text-white" /> :
                             <XCircle className="h-4 w-4 text-white" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {item.action}{' '}
                              <span className="font-medium text-gray-900">
                                by {item.actor ? item.actor.name : 'Unknown'} ({item.role})
                              </span>
                            </p>
                            {item.action === 'Rejected' && item.reason && (
                              <p className="text-xs text-red-600 mt-1">Reason: {item.reason}</p>
                            )}
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-gray-500">
                            {moment(item.timestamp).fromNow()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
