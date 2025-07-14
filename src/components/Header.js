import { useNavigate } from 'react-router-dom';
import './Header.css';

const Navbar = () => {
   const navigate = useNavigate();
  return (
    <div>
   <h2><center>Events Management</center> </h2>
   </div>
  );
};

export default Navbar;
