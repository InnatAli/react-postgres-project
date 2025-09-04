import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../components/Avatar';
import ChangePasswordModal from '../components/ChangePasswordModal';
import './Dashboard.css';
import './TransportList.css'; 

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [bookedEventsIds, setBookedEventsIds] = useState([]);
  const navigate = useNavigate();
 const [showPasswordModal, setShowPasswordModal] = useState(false);
  const userName = localStorage.getItem('userName');

  // Fetch all approved events
  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events/approved');
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching approved events:', err);
      alert('Failed to fetch approved events.');
    }
  };

  // Fetch bookings for this user
  const fetchUserBookings = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/eventsbooking/${userName}`);
      const booking = res.data.booking;

      const eventIds = booking
        .filter((b) => b.item_type === 'events')
        .map((b) => String(b.item_id));

      setBookedEventsIds(eventIds);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
    }
  }, [userName]);

  useEffect(() => {
    fetchEvents();
    fetchUserBookings();
  }, [fetchUserBookings]);

  // Delete event
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`http://localhost:5000/api/events/${id}/delete`);
        fetchEvents(); 
      } catch (err) {
        console.error(err);
        alert('Failed to delete event.');
      }
    }
  };

  // Edit event
  const handleEdit = (id) => {
    navigate(`/admin/events/edit/${id}`);
  };

  return (
    <div className="dashboard-container">
      <div className= "main-content">
        <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="nav-links">
            <span onClick={() => navigate('/admindashboard')}>Dashboard</span>
            <span onClick={() => navigate('/dashboard')}>Events</span>
            <span onClick={() => window.location.href='/events/new'}>Create New Event</span>  
          <span onClick={() => navigate('/adminusers')}>Manage Admins</span>
          <span onClick={() => navigate('/adminbookings')}>Manage Booking</span> 
            <span onClick={() => navigate('/aboutus')}>About</span>
             <span className="avatar-container"><UserAvatar onLogout={() => { localStorage.removeItem('token'); window.location.href = '/login';
  }}
  onChangePassword={() => setShowPasswordModal(true)}
/>
<ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} /></span> 
          </div>
        </div>

        <div className="user-transport-list">
          <h2>Available Events</h2>
          {events.length === 0 ? (
            <p>No approved events found.</p>
          ) : (
            <div className="transport-grid">
              {events.map((event) => (
                <div className="transport-card" key={event.id}>
           <img src={`http://localhost:5000${event.image}`} alt={event.title} />
                  <h3>{event.title}</h3>
                  <p><strong>Location:</strong> 📍 {event.location}</p>
                  <p>{event.description}</p>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Organizer:</strong> {event.organame}</p>
                  <p><strong>Price:</strong> ${event.price}</p>

                  <div className="transport-actions">
                    <button className="btn edit" onClick={() => handleEdit(event.id)}>Edit</button>
                    <button className='btn delete' onClick={() => handleDelete(event.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
