
import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/Sidebar';
import { Tabs, Tab } from '@mui/material'; 
import { useNavigate } from 'react-router-dom';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [tab, setTab] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllBookings();
    fetchCancelledBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/booking');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const fetchCancelledBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/cancelled_bookings');
      const data = await res.json();
      setCancelledBookings(data.cancelled || []);
    } catch (err) {
      console.error('Failed to fetch cancelled bookings:', err);
    }
  };

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  const renderTable = (data) => (
    <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{ backgroundColor: '#f7f7f7' }}>
        <tr>
          <th>#</th>
          <th>Booking ID</th>
          <th>User Name</th>
          <th>Service</th>
          <th>Student Name</th>
          <th>Email</th>
          <th>Booked On</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan="8" style={{ textAlign: 'center' }}>No data found.</td>
          </tr>
        ) : (
          data.map((b, i) => (
            <tr key={b.booking_id}>
              <td>{i + 1}</td>
              <td>#{b.booking_id}</td>
              <td>{b.user_name}</td>
              <td>{b.item_type}</td>
              <td>{b.name}</td>
              <td>{b.email}</td>
              <td>{new Date(b.booking_date).toLocaleString()}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  // Filter confirmed bookings
  const confirmedBookings = bookings.filter(b => !cancelledBookings.some(c => c.booking_id === b.booking_id));

  return (
    <div className="dashboard-container">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
          <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="nav-links">
             <span onClick={() => navigate('/admindashboard')}>Dashboard</span>
            <span onClick={() => navigate('/dashboard')}>Events</span>
            <span onClick={() => navigate('/aboutus')}>About</span>
          </div>
        </div>

        <div className="admin-bookings" style={{ padding: '20px' }}>
          <h2 style={{ color: '#333' }}>Manage Bookings</h2>

          <Tabs value={tab} onChange={handleTabChange} aria-label="Bookings Tabs">
            <Tab label="All Bookings" />
            <Tab label="Confirmed Bookings" />
            <Tab label="Cancelled Bookings" />
          </Tabs>

          <div style={{ marginTop: '20px' }}>
            {tab === 0 && renderTable(bookings)}
            {tab === 1 && renderTable(confirmedBookings)}
            {tab === 2 && renderTable(cancelledBookings)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
