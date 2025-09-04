import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import BookingModal from '../components/BookingModal';
import UserAvatar from '../components/Avatar';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function UserDashboard() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedID, setSelectedID] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [bookedEventsIds, setBookedEventsIds] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
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
      const booking = res.data.booking || res.data.bookings || [];
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

  return (
    <div className="dashboard-container">
     
      <div className="main-content">
        <div className="navbar">
          <div className="nav-links">
            <span onClick={() => navigate('/userdashboard')}>Events</span>
            <span onClick={() => navigate('/userbookinghistory/1')}>My History</span>
            <span onClick={() => navigate('/contact')}>Contact Us</span>
            <span onClick={() => navigate('/about')}>About</span>
            <span className="avatar-container"><UserAvatar onLogout={() => { localStorage.removeItem('token'); window.location.href = '/login';
  }}
  onChangePassword={() => setShowPasswordModal(true)}
/>
<ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} /></span> 
          </div>
        </div>
        <div className="user-transport-list">
          <h2>Available Events</h2>
          <div className="transport-grid">
             <button onClick={() => window.location.href='/events/new'}>Create New Event</button>  
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
                  {bookedEventsIds.includes(String(event.id)) ? (
                    <button disabled style={{ backgroundColor: 'gray', cursor: 'not-allowed' }}>
                      Registered
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedID(event.id);
                        setSelectedType('events');
                        setShowModal(true);
                      }}
                    >
                      Register Now!
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && selectedID && selectedType && (
        <BookingModal
          item_type={selectedType}
          item_id={selectedID}
          onClose={() => setShowModal(false)}
          onSuccess={(id) => {
            // 🔑 Immediately mark booked event as Registered
            setBookedEventsIds(prev => [...prev, String(id)]);
          }}
        />
      )}
    </div>
  );
}
