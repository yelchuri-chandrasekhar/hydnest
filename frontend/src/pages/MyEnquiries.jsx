// src/pages/MyEnquiries.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

function MyEnquiries() {
  const { user } = useContext(AuthContext);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwner = user?.role === 'owner';
  const endpoint = isOwner ? '/enquiries/received' : '/enquiries/sent';

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      setEnquiries(res.data.enquiries);
    } catch (err) {
      setError('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEnquiries();
    }
  }, [user]);

  const handleStatusChange = async (enquiryId, status) => {
    try {
      await api.put(`/enquiries/${enquiryId}/status`, { status });
      setEnquiries(enquiries.map((e) => (e.id === enquiryId ? { ...e, status } : e)));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const statusBadgeClass = (status) => {
    if (status === 'responded') return 'badge-success';
    if (status === 'closed') return 'badge-muted';
    return 'badge-muted';
  };

  if (loading) return <p className="text-muted container">Loading...</p>;
  if (error) return <p className="text-error container">{error}</p>;

  return (
    <div className="container-narrow" style={{ maxWidth: '700px' }}>
      <h1>{isOwner ? 'Received Enquiries' : 'My Enquiries'}</h1>

      {enquiries.length === 0 && <p className="text-muted">No enquiries {isOwner ? 'received' : 'sent'} yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {enquiries.map((enquiry) => (
          <div key={enquiry.id} className="card">
            <Link to={`/properties/${enquiry.property_id}`} style={{ fontWeight: 600, textDecoration: 'none' }}>
              {enquiry.property_title}
            </Link>
            <p style={{ marginTop: '0.5rem' }}>{enquiry.message}</p>
            {isOwner && (
              <p className="text-muted">From: {enquiry.tenant_name} ({enquiry.tenant_phone})</p>
            )}
            <div className="flex-between" style={{ marginTop: '0.75rem' }}>
              {isOwner ? (
                <select
                  value={enquiry.status}
                  onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="pending">Pending</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </select>
              ) : (
                <span className={`badge ${statusBadgeClass(enquiry.status)}`}>{enquiry.status}</span>
              )}
              <small className="text-muted">{new Date(enquiry.created_at).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyEnquiries;