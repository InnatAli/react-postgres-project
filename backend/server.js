// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const port = 5000;
const jwt = require('jsonwebtoken');

const app = express();
const events = [];
app.use(cors());

// ✅ CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// ✅ Body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Uploads folder
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ PostgreSQL setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'college_event_management',
  password: 'mypg123',
  port: 5432,
});

// ✅ LOGIN endpoint
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const checkQuery = 'SELECT * FROM public.users WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [email]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO public.users (name, email, password)
      VALUES ($1, $2, $3)
    `;
    await pool.query(insertQuery, [name, email, hashedPassword]);

    return res.status(201).json({ message: 'Registration successful' });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});
// LOGIN
// ==========================
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ name: user.name, role: 'user' }, 'your_jwt_secret');
      return res.status(200).json({
        message: 'Login successful',
        userType: 'user',
        name: user.name,
        token
      });
    }
    const adminResult = await pool.query('SELECT * FROM public.admin WHERE email = $1', [email]);
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ name: admin.name, role: 'admin' }, 'your_jwt_secret');
      return res.status(200).json({
        message: 'Login successful',
        userType: 'admin',
        name: admin.name,
        token
      });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});
// ✅ Test route
app.get('/', (req, res) => {
  res.send('Server is working!');
});

// ========== events ROUTES ==========

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.events ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error getting events:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ View Pending Events
app.get('/api/events/pending', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events WHERE status = 'pending'");
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pending events:', err);
    res.status(500).json({ message: 'Tatizo la kupata events pending.' });
  }
});
// ✅ View Approved Events
app.get('/api/events/approved', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events WHERE status = 'approved'");
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching approved events:', err);
    res.status(500).json({ message: 'Tatizo la kupata events approved.' });
  }
});

// Get single events
app.get('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM public.events WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error getting Event:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event
app.post('/api/events', upload.single('image'), async (req, res) => {
  const { title, location, description, date, organame, price } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await pool.query(
  'INSERT INTO public.events (title, location, description, date, organame, price, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
  [title, location, description, date, organame, price, imagePath]
);
    res.status(201).json({ message: 'event created' });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update events
app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, location, description, date, organame , price} = req.body;
  try {
   await pool.query(
  'UPDATE public.events SET title = $1, location = $2, description = $3, date = $4, organame = $5, price = $6 WHERE id = $7',
  [title, location, description, date, organame, price, id]
);
    res.status(200).json({ message: 'event updated' });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete events
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM public.events WHERE id = $1', [id]);
    res.status(200).json({ message: 'event deleted' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
///change-password
app.post('/api/change-password', async (req, res) => {
  const { userName, currentPassword, newPassword } = req.body;

  if (!userName || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE name = $1', [userName]);

    if (userResult.rowCount === 0) {
      const adminResult = await pool.query('SELECT * FROM admin WHERE name = $1', [userName]);

      if (adminResult.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const admin = adminResult.rows[0];
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE admin SET password = $1 WHERE name = $2', [hashedPassword, userName]);

      return res.json({ message: 'Password updated successfully (admin)' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE name = $2', [hashedPassword, userName]);

    res.json({ message: 'Password updated successfully (users)' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json({ users: result.rows });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

app.post('/api/admin/users/add', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check for duplicate email
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email tayari imesajiliwa' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );

    res.json({ message: 'User ameongezwa kikamilifu' });
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).json({ message: 'Kuna hitilafu ya kuongeza user' });
  }
});

app.post('/api/admin/users/:id/delete', async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query('INSERT INTO deleted_users (user_id) VALUES ($1)', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

app.put('/api/admin/users/:id/update', async (req, res) => {
  const userId = req.params.id;
  const { name, email, password } = req.body;

  try {
    if (email) {
      const exists = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ message: 'Email already used!' });
      }
    }
    const fields = [];
    const values = [];
    if (name) {
      fields.push('name');
      values.push(name);
    }
    if (email) {
      fields.push('email');
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push('password');
      values.push(hashedPassword);
    }
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No changes!' });
    }
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    values.push(userId);
    await pool.query(`UPDATE users SET ${setClause} WHERE id = $${values.length}`, values);
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Hitilafu wakati wa kuupdate user' });
  }
});

app.get('/api/admin/deleted-users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT users.* FROM users
      INNER JOIN deleted_users ON users.id = deleted_users.user_id
    `);
    res.json({ deleted: result.rows });
  } catch (err) {
    console.error('Error fetching deleted users:', err);
    res.status(500).json({ message: 'Server error fetching deleted users' });
  }
});

app.post('/api/admin/users/add', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check for duplicate email
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email tayari imesajiliwa' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );

    res.json({ message: 'User ameongezwa kikamilifu' });
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).json({ message: 'Kuna hitilafu ya kuongeza user' });
  }
});

app.post('/api/admin/users/:id/delete', async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query('INSERT INTO deleted_users (user_id) VALUES ($1)', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// POST /api/users/:id/change-password
app.post('/api/users/:id/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!valid) return res.status(401).json({ message: 'Old password sio sahihi' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, id]);

    res.json({ message: 'Password imebadilishwa kikamilifu' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error ya kubadilisha password' });
  }
});
// ✅ GET BOOKINGS FOR USER
app.get('/api/user/booking/:user_name', async (req, res) => {
  const user_name = req.params.user_name;

   const query = `
    SELECT 
      booking.id AS booking_id,
      booking.item_type,
      booking.item_id,
      booking.name,
      booking.email,
      booking.booking_date,
      COALESCE(e.title, '') AS item_name
    FROM public.booking
    LEFT JOIN public.events e ON booking.item_type = 'events' AND booking.item_id = e.id
    WHERE booking.user_name = $1
    ORDER BY booking.booking_date DESC
  `;

  try {
    const result = await pool.query(query, [user_name]);
    res.status(200).json({ bookings: result.rows });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ message: 'Tatizo upande wa server.' });
  }
});

app.post('/api/booking', async (req, res) => {
  const { user_name, name, std_id, email, item_type, item_id, booking_date } = req.body;

  if (!user_name || !item_type || !item_id || !name || !std_id || !email || !booking_date) {
    return res.status(400).json({ message: 'Taarifa zimekosekana.' });
  }

  try {
    const insertQuery = `
      INSERT INTO public.booking 
      (user_name, name, std_id, email, item_type, item_id, booking_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await pool.query(insertQuery, [
      user_name,
      name,
      std_id,
      email,
      item_type,
      item_id,
      booking_date
    ]);

    res.status(201).json({ message: 'Booking successful' });
  } catch (err) {
    console.error('Error inserting booking:', err);
    res.status(500).json({ message: 'Tatizo la kuhifadhi booking.' });
  }
});
// ✅ Get ONLY EVENT bookings for a user
app.get('/api/user/eventsbooking/:userName', async (req, res) => {
  const { userName } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM booking WHERE user_name = $1 AND item_type = $2',
      [userName, 'events']
    );

    res.json({ booking: result.rows });
  } catch (error) {
    console.error('Error fetching event bookings:', error);
    res.status(500).json({ message: 'Error fetching event bookings' });
  }
});
// ✅ CANCEL A BOOKING
app.post('/api/booking/:id/cancel', async (req, res) => {
  const bookingId = req.params.id;
  const { user_name } = req.body;

  try {
    const checkBooking = await pool.query(
      'SELECT * FROM booking WHERE id = $1 AND user_name = $2',
      [bookingId, user_name]
    );

    if (checkBooking.rows.length === 0) {
      return res.status(403).json({ message: 'Huna ruhusa ya kufuta hii booking.' });
    }
    const existing = await pool.query(
      'SELECT * FROM cancelled_bookings WHERE booking_id = $1 AND user_name = $2',
      [bookingId, user_name]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Booking tayari imefutwa.' });
    }
    // Insert into cancelled_bookings
    await pool.query(
      'INSERT INTO cancelled_bookings (booking_id, user_name) VALUES ($1, $2)',
      [bookingId, user_name]
    );
    res.status(200).json({ message: 'Booking imefutwa kikamilifu.' });
  } catch (err) {
    console.error('Cancel Booking Error:', err);
    res.status(500).json({ message: 'Tatizo upande wa server.' });
  }
});

// ✅ GET CANCELLED BOOKINGS FOR USER
app.get('/api/user/cancelled_bookings/:user_name', async (req, res) => {
  const user_name = req.params.user_name;

  try {
    const result = await pool.query(
      'SELECT booking_id FROM cancelled_bookings WHERE user_name = $1',
      [user_name]
    );
    res.status(200).json({ cancelled: result.rows });
  } catch (err) {
    console.error('Error fetching cancelled bookings:', err);
    res.status(500).json({ message: 'Tatizo upande wa server.' });
  }
});

// GET all bookings (includes confirmed and cancelled)
app.get('/api/admin/booking', async (req, res) => {
  const query = `
   SELECT 
      booking.id AS booking_id,
      booking.item_type,
      booking.item_id,
      booking.name,
      booking.email,
      booking.booking_date,
      COALESCE(e.title, '') AS item_name
    FROM public.booking
    LEFT JOIN public.events e ON booking.item_type = 'events' AND booking.item_id = e.id
    WHERE booking.user_name = $1
    ORDER BY booking.booking_date DESC
  `;
  try {
    const result = await pool.query(query);
    res.status(200).json({ bookings: result.rows });
  } catch (err) {
    console.error('Error fetching all bookings:', err);
    res.status(500).json({ message: 'Tatizo kupata bookings.' });
  }
});

// GET cancelled bookings only
app.get('/api/admin/cancelled_bookings', async (req, res) => {
  const query = `
    SELECT 
      booking.id AS booking_id,
      booking.item_type,
      booking.item_id,
      booking.name,
      booking.email,
      booking.booking_date,
      COALESCE(e.title, '') AS item_name
    FROM public.cancelled_bookings
    LEFT JOIN public.events e ON booking.item_type = 'events' AND booking.item_id = e.id
    WHERE booking.user_name = $1
    ORDER BY booking.booking_date DESC
  `;

  try {
    const result = await pool.query(query);
    res.status(200).json({ cancelled: result.rows });
  } catch (err) {
    console.error('Error fetching cancelled bookings:', err);
    res.status(500).json({ message: 'Tatizo kupata cancelled bookings.' });
  }
});

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
