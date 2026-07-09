// src/pages/Home.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { searchApi } from '../services/api';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { user } = useContext(AuthContext);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchApi.get('/search/properties')
      .then((res) => setFeatured(res.data.properties.slice(0, 3)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'var(--color-primary-light)',
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Find Your Perfect Stay in Hyderabad</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
          PGs, hostels, flats, and shared rooms — all in one place.
        </p>
        <Link to="/properties">
          <button style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: '600',
          }}>
            Browse Properties
          </button>
        </Link>
        {!user && (
          <p style={{ marginTop: '1.5rem' }}>
            Are you a property owner?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary-dark)', textDecoration: 'underline' }}>
              List your property
            </Link>
          </p>
        )}
      </div>

      {/* Featured Properties */}
      <div className="container">
        <h2>Featured Properties</h2>

        {loading && <p className="text-muted">Loading...</p>}
        {!loading && featured.length === 0 && <p className="text-muted">No properties listed yet. Check back soon!</p>}

        <div className="grid">
          {featured.map((property) => (
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

        {featured.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/properties">View all properties →</Link>
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--color-primary-light)', padding: '3rem 1rem', marginTop: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2>How HydNest Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div>
              <h3>🔍 Search</h3>
              <p className="text-muted">Filter by city, budget, and property type to find what fits.</p>
            </div>
            <div>
              <h3>💬 Enquire</h3>
              <p className="text-muted">Message property owners directly to ask questions or book a visit.</p>
            </div>
            <div>
              <h3>🏠 Move In</h3>
              <p className="text-muted">Finalize the details and settle into your new place.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;