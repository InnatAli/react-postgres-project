import React, { useState, useEffect } from 'react';
import './BookingModal.css';

const BookingModal = ({ item_type, item_id, onClose, onSuccess }) => {
  const user_name = localStorage.getItem('userName');
  const [startDate, setStartDate] = useState('');
  const [name, setName] = useState('');
  const [stdId, setStdId] = useState('');
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingID, setBookingID] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!item_type || !item_id) {
      console.warn("🚫 Missing item_type or item_id:", { item_type, item_id });
    }
  }, [item_type, item_id]);

  const isFormComplete = () => startDate && name && stdId && email;

  const handleSubmit = async () => {
    if (!isFormComplete()) return alert('Tafadhali jaza taarifa zote za safari.');

    try {
      const response = await fetch('http://localhost:5000/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name,
          name,
          std_id: stdId,
          email,
          item_type,
          item_id,
          booking_date: startDate
        })
      });

      const result = await response.json();

      if (response.ok) {
        const generatedID = `TSP${Math.floor(100000 + Math.random() * 900000)}`;
        setBookingID(generatedID);
        setShowSuccess(true);

        // 🔑 Notify parent (UserDashboard) so UI updates immediately
        if (onSuccess) onSuccess(item_id);

        setTimeout(() => onClose(), 4000);
      } else {
        setErrorMessage(result.message || 'Tatizo la booking.');
      }
    } catch (err) {
      console.error('Booking haikufanikiwa:', err);
      setErrorMessage('Tatizo limetokea wakati wa kutuma booking.');
    }
  };

  if (showSuccess) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <h3>✅ Booking yako imefanikiwa!</h3>
          <p><strong>Booking ID:</strong> {bookingID}</p>
          <p>Asante kwa kuchagua huduma yetu.</p>
          <button onClick={onClose}>Funga</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Weka Taarifa za Safari</h3>
        {errorMessage && <p style={{ color: 'red' }}>⚠ {errorMessage}</p>}

        <label>Enter your Name:</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />

        <label>Enter your Registration ID:</label>
        <input type="text" value={stdId} onChange={e => setStdId(e.target.value)} />

        <label>Enter Email:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />

        <label>Choose Date of Booking:</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />

        <button onClick={handleSubmit} disabled={!isFormComplete()}>Confirm Booking</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default BookingModal;
