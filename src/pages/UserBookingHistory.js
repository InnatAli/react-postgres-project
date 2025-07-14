import React, { useEffect, useState } from 'react';
import Usersidebar from '../components/Usersidebar'; 
import { useNavigate } from 'react-router-dom';

const UserBookingHistory = ({ user_name }) => {
  const [bookings, setBookings] = useState([]);
  const [cancelledBookingIds, setCancelledBookingIds] = useState([]);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user_name) return;
    const fetchBookings = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/user/booking/${user_name}`);
        const data = await res.json();
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        alert('Error on fetching bookings.');
      }
    };

    const fetchCancelledBookings = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/user/cancelled_bookings/${user_name}`);
        const data = await res.json();
        const ids = data.cancelled.map(b => b.booking_id);
        setCancelledBookingIds(ids);
      } catch (err) {
        console.error('Error fetching cancelled bookings:', err);
      }
    };

    fetchBookings();
    fetchCancelledBookings();
  }, [user_name]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/booking/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name }),
      });

      if (res.ok) {
        alert('Booking cancelled successfully.');
        setCancelledBookingIds(prev => [...prev, bookingId]);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Server error while cancelling.');
    }
  };

  return (
    <div className="dashboard-container">
      <Usersidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className="navbar">
          <div className="nav-links">
            <span onClick={() => navigate('/userdashboard')}>Events</span>
            <span onClick={() => navigate('/contact')}>Contact Us</span>
            <span onClick={() => navigate('/about')}>About</span>
          </div>
        </div>

        <div className="user-transport-list">
          <div className="booking-history" style={{ padding: '20px' }}>
            <h2 style={{ color: 'green' }}>My Tour History</h2>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th>#</th>
                  <th>Booking ID</th>
                  <th>Service Type</th>
                  <th>Service Name</th>
                  <th>Booking Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No bookings found.</td>
                  </tr>
                ) : (
                  bookings.map((booking, i) => (
                    <tr key={booking.booking_id}>
                      <td>{i + 1}</td>
                      <td>#{booking.booking_id}</td>
                      <td>{booking.item_type}</td>
                      <td>{booking.item_name}</td>
                      <td>{new Date(booking.booking_date).toLocaleString()}</td>
                      <td>
                        {cancelledBookingIds.includes(booking.booking_id) ? (
                          <span style={{ color: 'red', fontWeight: 'bold' }}>Cancelled</span>
                        ) : (
                          <button
                            onClick={() => handleCancelBooking(booking.booking_id)}
                            style={{
                              background: 'none',
                              border: '1px solid red',
                              color: 'red',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookingHistory;
