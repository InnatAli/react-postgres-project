import axios from 'axios';

const handleRegister = async () => {
  try {
    const res = await axios.post('http://localhost:5000/register', {
      name: 'Jina Lako',
      email: 'email@example.com',
      password: 'passwordyako'
    }, {
      withCredentials: true // ikiwa unatumia cookies au sessions
    });

    console.log(res.data); // Success message
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};
