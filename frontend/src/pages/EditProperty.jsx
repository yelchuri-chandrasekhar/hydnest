// src/pages/EditProperty.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function EditProperty() {
  const { id } = useParams();

  const [formData, setFormData] = useState(null);
  const [amenities, setAmenities] = useState(null);
  const [images, setImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.get(`/properties/${id}`).then((res) => {
      setFormData(res.data.property);
      setAmenities(res.data.amenities);
      setImages(res.data.images);
    }).catch(() => setError('Failed to load property'));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAmenityChange = (e) => {
    setAmenities({ ...amenities, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');
    try {
      await api.put(`/properties/${id}`, formData);
      await api.put(`/properties/${id}/amenities`, amenities);
      setStatus('Property updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update property');
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (newFiles.length === 0) return;
    const data = new FormData();
    for (const file of newFiles) {
      data.append('images', file);
    }
    try {
      const res = await api.post(`/properties/${id}/images`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages([...images, ...res.data.images]);
      setNewFiles([]);
    } catch (err) {
      setError('Failed to upload images');
    }
  };

  const handleImageDelete = async (imageId) => {
    try {
      await api.delete(`/properties/${id}/images/${imageId}`);
      setImages(images.filter((img) => img.id !== imageId));
    } catch (err) {
      setError('Failed to delete image');
    }
  };

  if (!formData) return <p className="text-muted container">Loading...</p>;

  return (
    <div className="container-narrow">
      <div className="card">
        <h1>Edit Property</h1>
        {error && <p className="text-error">{error}</p>}
        {status && <p className="text-success">{status}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} />
          </div>
          <div className="form-group">
            <label>Rent (₹/month)</label>
            <input type="number" name="rent" value={formData.rent} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Deposit (₹)</label>
            <input type="number" name="deposit" value={formData.deposit || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} style={{ width: 'auto' }} />
              Available
            </label>
          </div>

          <h3 style={{ marginTop: '1.5rem' }}>Amenities</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            {amenities && Object.entries(amenities)
              .filter(([key]) => !['id', 'property_id'].includes(key))
              .map(([key, value]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'capitalize', fontWeight: 400 }}>
                  <input type="checkbox" name={key} checked={value} onChange={handleAmenityChange} style={{ width: 'auto' }} />
                  {key.replace('_', ' ')}
                </label>
              ))}
          </div>

          <button type="submit" style={{ width: '100%' }}>Save Changes</button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Images</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: 'relative' }}>
              <img
                src={`http://localhost:5000${img.image_url}`}
                alt=""
                style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: 'var(--radius)' }}
              />
              <button
                onClick={() => handleImageDelete(img.id)}
                className="danger"
                style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  width: '24px', height: '24px', padding: 0,
                  borderRadius: '50%', fontSize: '0.8rem', lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleImageUpload} className="flex-row">
          <input type="file" multiple accept="image/*" onChange={(e) => setNewFiles([...e.target.files])} style={{ flex: 1 }} />
          <button type="submit">Upload</button>
        </form>
      </div>
    </div>
  );
}

export default EditProperty;