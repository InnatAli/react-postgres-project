import React, {useState} from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      if (res.data.userType === 'user') {
        localStorage.setItem('userName', res.data.name); 
        navigate('/userdashboard');
      } else if (res.data.userType === 'admin') {
        localStorage.setItem('userId', res.data.id); 
        navigate('/admindashboard'); 
      }
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
     <form onSubmit={handleLogin}>
      <div className="login-container">
        <div className="login-left">
          <h1>Join Events!!</h1>
          <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" alt="Illustration" />
        </div>
        <div className="login-right">
          <h2>Welcome to college event Management</h2>
          <p>If you already have an account, please sign in below.</p>

          <label>Email </label>
          <input type="text" placeholder="enter your email"  value={email} onChange={e => setEmail(e.target.value)} required/>
          
          <label>Password</label>
          <input type="password" placeholder="enter your password"  value={password} onChange={e => setPassword(e.target.value)} required />
          
          <button type="submit">Login</button>
          <p>Don't have an account? <a href="register">Sign up now</a></p>
        </div>
      </div>
     </form>
  );
}

export default Login;
