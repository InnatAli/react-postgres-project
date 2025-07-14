import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './TransportList.css';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch all pending events
  const fetchPendingEvents = async () => {
    try {
    const res = await axios.get('http://localhost:5000/api/events/status/pending'); 
      setPendingEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch pending events:', err);
    }
  };

  // Approve event
  const approveEvent = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/events/approve/${id}`);
      fetchPendingEvents(); // Refresh list
    } catch (err) {
      console.error('Error approving event:', err);
      alert('Tatizo la ku-approve event.');
    }
  };

  // Reject event
  const rejectEvent = async (id) => {
    const confirm = window.confirm("Una uhakika unataka ku-reject hii event?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/events/reject/${id}`);
      fetchPendingEvents(); // Refresh list
    } catch (err) {
      console.error('Error rejecting event:', err);
      alert('Tatizo la ku-reject event.');
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className="navbar">
          <div className="nav-links">
            <span onClick={() => navigate('/admindashboard')}>Dashboard</span>
            <span onClick={() => navigate('/dashboard')}>Events</span>
             <span onClick={() => navigate('/aboutus')}>About</span>
          </div>
        </div>

        <div className="user-transport-list">
          <h2>Pending Events for Approval</h2>
          {pendingEvents.length === 0 ? (
            <p>No pending events found.</p>
          ) : (
            <div className="transport-grid">
              {pendingEvents.map((event) => (
                <div className="transport-card" key={event.id}>
                  <img src={`http://localhost:5000${event.image}`} alt="Event" />
                  <h3>{event.title}</h3>
                  <p><strong>Location:</strong> 📍{event.location}</p>
                  <p>{event.description}</p>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Organizer:</strong> {event.organame}</p>
                  <p><strong>Price:</strong> ${event.price}</p>

                  <div className="transport-actions">
                    <button className="approve-btn" onClick={() => approveEvent(event.id)}>✅ Approve</button>
                    <button className="reject-btn" onClick={() => rejectEvent(event.id)}>❌ Reject</button>
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
