import React, { useState } from 'react';
import './Style.css';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../components/Avatar';
import ChangePasswordModal from '../components/ChangePasswordModal';

const Contact = () => {
 const navigate = useNavigate();
 const [showPasswordModal, setShowPasswordModal] = useState(false);
   const userName = localStorage.getItem('userName');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
     <div className="dashboard-container">
      <div className= "main-content">
           <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <section className="content">
          <h2>Get In Touch</h2>
          <p>If you have any questions, suggestions, or want to collaborate on an event, feel free to reach out!</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />

            <label htmlFor="message">Message:</label>
            <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange} required></textarea>

            <button type="submit">Send Message</button>
          </form>
        </section>
 <hr></hr>
        <p>&copy; 2025 College Event Management. All rights reserved.</p>
    </div>
    </div>
  );
};

export default Contact;
