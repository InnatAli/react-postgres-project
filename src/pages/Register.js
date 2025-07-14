import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/register', {
        name,
        email,
        password
      });

      setMessage('Registration successful!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setMessage(msg);
    }
  };

  return (
    <form onSubmit={handleRegister} className="register-form" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Create your account</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <button type="submit">Register</button>
     <p>Already have an account? <Link to="/">Login here</Link></p>

      {message && <p>{message}</p>}
    </form>
  );
}

export default Register;
