import React from 'react';
import { useParams } from 'react-router-dom';
import UserBookingHistory from '../pages/UserBookingHistory';

const UserBookingHistoryWrapper = () => {
  const { user_name: paramUser } = useParams();
  const userName = localStorage.getItem("userName");

  const finalUserName = paramUser || userName;

  if (!finalUserName) {
    return <div style={{ color: 'red', padding: '20px' }}>❌ No `user_name` taken!.</div>;
  }

  return <UserBookingHistory user_name={finalUserName} />;
};

export default UserBookingHistoryWrapper;
