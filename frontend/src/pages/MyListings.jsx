// src/pages/MyListings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function MyListings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/properties/my-listings');
      setProperties(res.data.properties);
    } catch (err) {
      setError('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  if (loading) return <p className="text-muted container">Loading...</p>;
  if (error) return <p className="text-error container">{error}</p>;

  return (
    <div className="container">
      <div className="flex-between">
        <h1>My Listings</h1>
        <Link to="/add-property">
          <button>+ Add Property</button>
        </Link>
      </div>

      {properties.length === 0 && <p className="text-muted">You haven't listed any properties yet.</p>}

      <div className="grid">
        {properties.map((property) => (
          <div key={property.id} className="card">
            <h3>{property.title}</h3>
            <p className="text-muted">{property.area}, {property.city}</p>
            <p className="price">₹{property.rent}/month</p>
            <span className={`badge ${property.available ? 'badge-success' : 'badge-muted'}`}>
              {property.available ? 'Available' : 'Not available'}
            </span>
            <div className="flex-row" style={{ marginTop: '1rem' }}>
              <Link to={`/properties/${property.id}`}>View</Link>
              <Link to={`/edit-property/${property.id}`}>Edit</Link>
              <button onClick={() => handleDelete(property.id)} className="danger" style={{ marginLeft: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyListings;