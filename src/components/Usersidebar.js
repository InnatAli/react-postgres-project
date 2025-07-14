import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './Avatar'; 
import ChangePasswordModal from './ChangePasswordModal';

function Usersidebar({ isOpen, toggleSidebar }) {
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
          <h3>Student Dashboard</h3>
          <li onClick={() => window.location.href='/events/new'}>Create New Event</li>  
         <li onClick={() => navigate('/userbookinghistory/1')}>My History</li>
        </ul>
      </div>
      </div>
      </div>
    </>
  );
}

export default Usersidebar;
