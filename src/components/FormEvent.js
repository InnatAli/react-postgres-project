import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './FormEvent.css';

function FormEvent({ editMode = false }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [organame, setOrganame] = useState('');
  const [price, setPrice] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (editMode && id) {
      axios.get(`http://localhost:5000/api/events/${id}`)
        .then(res => {
          const data = res.data;
          setTitle(data.title);
          setLocation(data.location);
          setDescription(data.description);
          setDate(data.date);
          setPrice(data.price);
          setOrganame(data.organame);
        })
        .catch(err => alert('Failed to fetch event'));
    }
  }, [editMode, id]);

const handleImageChange = (e) => {
  setImage(e.target.files[0]);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const payload = { title, location, description, date, organame, price };

  try {
    if (editMode) {
      await axios.put(`http://localhost:5000/api/events/${id}`, payload);
      alert('Event updated successfully!');
    } else {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('location', location);
      formData.append('description', description);
      formData.append('date', date);
      formData.append('organame', organame);
      formData.append('price', price);
      if (image) {
        formData.append('image', image);
      }

      await axios.post('http://localhost:5000/api/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Event created successfully!');
    }

    navigate('/dashboard');
 } catch (err) {
  console.error('Error details:', err.response?.data || err.message);
  alert('Failed to save Event: ' + (err.response?.data?.message || err.message));
}
};

return (
  <div className="form-container">
    <h2>{editMode ? 'Edit Itinerary' : 'Add New Event'}</h2>
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <label>Title:</label>
      <input value={title} onChange={e => setTitle(e.target.value)} required />

      <label>Location:</label>
      <input value={location} onChange={e => setLocation(e.target.value)} required />

      <label>Description:</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} required />

      <label>Date:</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
       <label>Organizer Name:</label>
      <input type="organame" value={organame} onChange={e => setOrganame(e.target.value)} required />

       <label>Price:</label>
      <input type="price" value={price} onChange={e => setPrice(e.target.value)} required />

      <label>Upload Image:</label>
      <input type="file" accept="image/*" onChange={handleImageChange} />

      <button type="submit">{editMode ? 'Update' : 'Save'}</button>
    </form>
  </div>
);

}

export default FormEvent;
