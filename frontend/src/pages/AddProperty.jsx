// src/pages/AddProperty.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AddProperty() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: '1bhk',
    gender_preference: 'any',
    furnishing: 'unfurnished',
    rent: '',
    deposit: '',
    area: '',
    address: '',
    city: 'Hyderabad',
    available_from: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/properties', formData);
      navigate(`/edit-property/${res.data.property.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create property');
    }
  };

  return (
    <div className="container-narrow">
      <div className="card">
        <h1>Add Property</h1>
        {error && <p className="text-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />
          </div>
          <div className="form-group">
            <label>Property Type</label>
            <select name="property_type" value={formData.property_type} onChange={handleChange}>
              <option value="pg">PG</option>
              <option value="hostel">Hostel</option>
              <option value="1bhk">1BHK</option>
              <option value="2bhk">2BHK</option>
              <option value="3bhk">3BHK</option>
              <option value="single_room">Single Room</option>
              <option value="flat_share">Flat Share</option>
            </select>
          </div>
          <div className="form-group">
            <label>Gender Preference</label>
            <select name="gender_preference" value={formData.gender_preference} onChange={handleChange}>
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Furnishing</label>
            <select name="furnishing" value={formData.furnishing} onChange={handleChange}>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi_furnished">Semi Furnished</option>
              <option value="fully_furnished">Fully Furnished</option>
            </select>
          </div>
          <div className="form-group">
            <label>Rent (₹/month)</label>
            <input type="number" name="rent" value={formData.rent} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Deposit (₹)</label>
            <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Area / Locality</label>
            <input type="text" name="area" value={formData.area} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Available From</label>
            <input type="date" name="available_from" value={formData.available_from} onChange={handleChange} />
          </div>
          <button type="submit" style={{ width: '100%' }}>Create Property</button>
        </form>
      </div>
    </div>
  );
}

export default AddProperty;