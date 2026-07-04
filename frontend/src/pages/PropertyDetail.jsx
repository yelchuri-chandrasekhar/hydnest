// src/pages/PropertyDetail.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

function PropertyDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [message, setMessage] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load property'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryStatus('');
    try {
      await api.post(`/enquiries/${id}`, { message });
      setEnquiryStatus('Enquiry sent successfully!');
      setMessage('');
    } catch (err) {
      setEnquiryStatus(err.response?.data?.message || 'Failed to send enquiry');
    }
  };

  const handleSave = async () => {
    setSaveStatus('');
    try {
      await api.post(`/users/saved-properties/${id}`);
      setSaveStatus('Saved!');
    } catch (err) {
      setSaveStatus(err.response?.data?.message || 'Failed to save');
    }
  };

  if (loading) return <p className="text-muted container">Loading...</p>;
  if (error) return <p className="text-error container">{error}</p>;
  if (!data) return null;

  const { property, amenities, images } = data;

  return (
    <div className="container-narrow" style={{ maxWidth: '700px' }}>
      <div className="card">
        <h1>{property.title}</h1>
        <p className="text-muted">{property.area}, {property.city}</p>
        <p className="price">
          ₹{property.rent}/month {property.deposit && <span className="text-muted" style={{ fontWeight: 400, fontSize: '0.9rem' }}>(Deposit: ₹{property.deposit})</span>}
        </p>
        <span className="badge badge-muted" style={{ marginRight: '0.5rem' }}>{property.property_type.replace('_', ' ')}</span>
        {property.furnishing && <span className="badge badge-muted">{property.furnishing.replace('_', ' ')}</span>}

        <p style={{ marginTop: '1rem' }}>{property.description}</p>
        <p><strong>Address:</strong> {property.address}</p>

        {images && images.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', margin: '1rem 0' }}>
            {images.map((img) => (
              <img
                key={img.id}
                src={`http://localhost:5000${img.image_url}`}
                alt={property.title}
                style={{ height: '150px', borderRadius: 'var(--radius)', objectFit: 'cover' }}
              />
            ))}
          </div>
        )}

        {amenities && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>Amenities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {Object.entries(amenities)
                .filter(([key]) => !['id', 'property_id'].includes(key))
                .map(([key, value]) => (
                  <span
                    key={key}
                    className={`badge ${value ? 'badge-success' : 'badge-muted'}`}
                  >
                    {value ? '✓' : '✗'} {key.replace('_', ' ')}
                  </span>
                ))}
            </div>
          </div>
        )}

        {user && user.role === 'tenant' && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <button onClick={handleSave} className="secondary" style={{ marginBottom: '1rem' }}>💾 Save Property</button>
            {saveStatus && <p className="text-success">{saveStatus}</p>}

            <h3>Interested? Send an enquiry</h3>
            <form onSubmit={handleEnquirySubmit}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about availability, visit timing, etc."
                required
                rows={3}
              />
              <button type="submit" style={{ marginTop: '0.75rem' }}>Send Enquiry</button>
            </form>
            {enquiryStatus && <p className="text-success">{enquiryStatus}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyDetail;