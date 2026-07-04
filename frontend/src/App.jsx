// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import MyListings from './pages/MyListings';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import SavedProperties from './pages/SavedProperties';
import MyEnquiries from './pages/MyEnquiries';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/edit-property/:id" element={<EditProperty />} />
        <Route path="/saved-properties" element={<SavedProperties />} />
        <Route path="/enquiries" element={<MyEnquiries />} />
      </Routes>
    </>
  );
}

export default App;