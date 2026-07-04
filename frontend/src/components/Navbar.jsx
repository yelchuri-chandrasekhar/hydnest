// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav style={{
      background: 'var(--color-white)',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow)',
    }}>
      <div className="flex-between" style={{ padding: '1rem 1.5rem' }}>
        <Link to="/" onClick={closeMenu} style={{ fontWeight: '700', fontSize: '1.25rem', textDecoration: 'none', color: 'var(--color-primary-dark)' }}>
          HydNest
        </Link>

        {/* Hamburger button - visible only on mobile via CSS */}
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'transparent', color: 'var(--color-text)', border: 'none', fontSize: '1.5rem', padding: '0.25rem 0.5rem' }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop links */}
        <div className="navbar-links-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/properties" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Browse Properties</Link>

          {user ? (
            <>
              <span className="text-muted">Hi, {user.name}</span>
              {user.role === 'owner' && (
                <Link to="/my-listings" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>My Listings</Link>
              )}
              {user.role === 'tenant' && (
                <Link to="/saved-properties" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Saved</Link>
              )}
              <Link to="/enquiries" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Enquiries</Link>
              <button onClick={handleLogout} className="secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Login</Link>
              <Link to="/register">
                <button>Register</button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="navbar-links-mobile" style={{
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
          padding: '1rem 1.5rem 1.5rem', borderTop: '1px solid var(--color-border)',
        }}>
          <Link to="/properties" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Browse Properties</Link>

          {user ? (
            <>
              <span className="text-muted">Hi, {user.name}</span>
              {user.role === 'owner' && (
                <Link to="/my-listings" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>My Listings</Link>
              )}
              {user.role === 'tenant' && (
                <Link to="/saved-properties" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Saved</Link>
              )}
              <Link to="/enquiries" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Enquiries</Link>
              <button onClick={handleLogout} className="secondary" style={{ width: '100%' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Login</Link>
              <Link to="/register" onClick={closeMenu}>
                <button style={{ width: '100%' }}>Register</button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;