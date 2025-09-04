import React, { useEffect, useState } from 'react';
import './Style.css';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../components/Avatar';
import ChangePasswordModal from '../components/ChangePasswordModal';

const AboutUs = () => {
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
     const userName = localStorage.getItem('userName');

  return (
     <div className="dashboard-container">

      <div className= "main-content ">
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
        <section className="content">
          <h2>Who We Are</h2>
          <p>
            We are a passionate team of students and staff committed to organizing and managing engaging, inclusive, and educational events within our college community.
          </p>

          <h2>Our Mission</h2>
          <p>
            To provide a platform for talent, creativity, and knowledge-sharing through well-planned college events, workshops, seminars, and fests.
          </p>

          <h2>Why It Matters</h2>
          <p>
            Events play a critical role in building community, enhancing student experience, and nurturing leadership among our peers.
          </p>
        </section>
        <hr></hr>
        <p>&copy; 2025 College Event Management. All rights reserved.</p>
    </div>
    </div>
  );
};

export default AboutUs;
