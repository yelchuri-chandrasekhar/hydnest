// src/pages/PropertyList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchApi } from '../services/api';

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    minRent: '',
    maxRent: '',
  });

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const res = await searchApi.get('/search/properties', { params });
      setProperties(res.data.properties);
    } catch (err) {
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div className="container">
      <h1>Browse Properties</h1>

      <form
        onSubmit={handleFilterSubmit}
        className="card"
        style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'flex-end' }}
      >
        <div style={{ flex: '1 1 150px' }}>
          <label>City</label>
          <input type="text" name="city" placeholder="e.g. Hyderabad" value={filters.city} onChange={handleFilterChange} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label>Property Type</label>
          <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="pg">PG</option>
            <option value="hostel">Hostel</option>
            <option value="1bhk">1BHK</option>
            <option value="2bhk">2BHK</option>
            <option value="3bhk">3BHK</option>
            <option value="single_room">Single Room</option>
            <option value="flat_share">Flat Share</option>
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label>Min Rent</label>
          <input type="number" name="minRent" placeholder="₹0" value={filters.minRent} onChange={handleFilterChange} />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label>Max Rent</label>
          <input type="number" name="maxRent" placeholder="Any" value={filters.maxRent} onChange={handleFilterChange} />
        </div>
        <div>
          <button type="submit">Search</button>
        </div>
      </form>

      {loading && <p className="text-muted">Loading properties...</p>}
      {error && <p className="text-error">{error}</p>}
      {!loading && properties.length === 0 && <p className="text-muted">No properties found.</p>}

      <div className="grid">
        {properties.map((property) => (
          <Link key={property.id} to={`/properties/${property.id}`} className="card-link">
            <div className="card">
              <h3>{property.title}</h3>
              <p className="text-muted">{property.area}, {property.city}</p>
              <p className="price">₹{property.rent}/month</p>
              <span className="badge badge-muted">{property.propertyType.replace('_', ' ')}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PropertyList;