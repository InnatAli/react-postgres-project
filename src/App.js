import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import Header from './components/Header';
import FormEvent from './components/FormEvent';
import BookingModal from './components/BookingModal';
import UserBookingHistory from './pages/UserBookingHistory';
import AdminBookings from './pages/AdminBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import About from './pages/About';
import Contact from './pages/Contact';
import UserBookingHistoryWrapper from './components/UserBookingHistoryWrapper';
import AboutUs from './pages/AboutUs';
import './index.css';
import './App.css';

function App() {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
         <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
       <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/events/new" element={<FormEvent />} />
        <Route path="/events/:id/edit" element={<FormEvent editMode />} />
         <Route path="/bookingmodal" element={<BookingModal />} />
         <Route path="/userbookinghistory" element={<UserBookingHistory />} />
         <Route path="/adminbookings" element={<AdminBookings />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
         <Route path="/adminusers" element={<AdminUsers />} />
           <Route path="/contact" element={<Contact />} />
        <Route path="/userbookinghistory/:user_id" element={<UserBookingHistoryWrapper />} />
        <Route path="/aboutus" element={<AboutUs />} />
         <Route path="/about" element={<About />} />
      </Routes>
      </div>
  );
}

export default App;



