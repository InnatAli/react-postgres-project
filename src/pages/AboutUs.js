import React, { useEffect, useState } from 'react';
import './Style.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AboutUs = () => {
    const navigate = useNavigate();
     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
     <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
           <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="nav-links">
             <span onClick={() => navigate('/admindashboard')}>Dashboard</span>
            <span onClick={() => navigate('/dashboard')}>Events</span>
            <span onClick={() => navigate('/aboutus')}>About</span>
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
