import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './Avatar'; 
import ChangePasswordModal from './ChangePasswordModal';

function Sidebar({ isOpen, toggleSidebar }) {
      const navigate = useNavigate();
        const userFromStorage = JSON.parse(localStorage.getItem('user'));
        const [showPasswordModal, setShowPasswordModal] = useState(false);
  return (
    
    <>
      <button className="menu-btn" onClick={toggleSidebar}>
        {isOpen ? '☰' : '☰'}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className='bar'>
            <UserAvatar
  onLogout={() => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }}
  onChangePassword={() => setShowPasswordModal(true)}
/>

<ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
  <div className='hayya'>
        <ul>
          <h3>Admin Dashboard</h3>
          <li onClick={() => window.location.href='/events/new'}>Create New Event</li>  
          <li onClick={() => navigate('/adminusers')}>Manage Users</li>
          <li onClick={() => navigate('/adminbookings')}>Manage Booking</li> 
        </ul>
      </div>
      </div>
      </div>
    </>
  );
}

export default Sidebar;
