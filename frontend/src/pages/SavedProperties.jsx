// src/pages/SavedProperties.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function SavedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/saved-properties');
      setProperties(res.data.properties);
    } catch (err) {
      setError('Failed to load saved properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (propertyId) => {
    try {
      await api.delete(`/users/saved-properties/${propertyId}`);
      setProperties(properties.filter((p) => p.id !== propertyId));
    } catch (err) {
      alert('Failed to remove property');
    }
  };

  if (loading) return <p className="text-muted container">Loading...</p>;
  if (error) return <p className="text-error container">{error}</p>;

  return (
    <div className="container">
      <h1>Saved Properties</h1>

      {properties.length === 0 && <p className="text-muted">You haven't saved any properties yet.</p>}

      <div className="grid">
        {properties.map((property) => (
          <div key={property.id} className="card">
            <h3>{property.title}</h3>
            <p className="text-muted">{property.area}, {property.city}</p>
            <p className="price">₹{property.rent}/month</p>
            <div className="flex-row" style={{ marginTop: '1rem' }}>
              <Link to={`/properties/${property.id}`}>View</Link>
              <button onClick={() => handleUnsave(property.id)} className="danger" style={{ marginLeft: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedProperties;