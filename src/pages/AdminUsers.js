import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Tabs, Tab, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [tab, setTab] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDeletedUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:5000/api/admin/users');
    const data = await res.json();
    setUsers(data.users || []);
  };

  const fetchDeletedUsers = async () => {
    const res = await fetch('http://localhost:5000/api/admin/deleted-users');
    const data = await res.json();
    setDeletedUsers(data.deleted || []);
  };

  const handleTabChange = (e, newValue) => setTab(newValue);

  const isDeleted = (userId) =>
    deletedUsers.some((du) => du.id === userId);

  const handleDelete = async (id) => {
    const confirm = window.confirm('Una uhakika unataka kufuta user huyu?');
    if (!confirm) return;

    const res = await fetch(`http://localhost:5000/api/admin/users/${id}/delete`, {
      method: 'POST',
    });
    const data = await res.json();
    alert(data.message);
    fetchUsers();
    fetchDeletedUsers();
  };

  const handleAddUser = async () => {
    if (!form.name || !form.email || (!form.password && !editMode)) {
      alert('Tafadhali jaza taarifa zote');
      return;
    }

    if (editMode) {
      const res = await fetch(`http://localhost:5000/api/admin/users/${editUserId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(data.message);
    } else {
      const res = await fetch('http://localhost:5000/api/admin/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(data.message);
    }

    setForm({ name: '', email: '', password: '' });
    setEditMode(false);
    setEditUserId(null);
    setShowForm(false);
    fetchUsers();
  };

  const handleEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '' });
    setEditMode(true);
    setEditUserId(user.id);
    setShowForm(true);
  };

  const activeUsers = users.filter((u) => !isDeleted(u.id));

  const renderTable = (data, showActions = false) => (
    <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{ backgroundColor: '#f7f7f7' }}>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          {showActions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={showActions ? 4 : 3} style={{ textAlign: 'center' }}>No users found.</td>
          </tr>
        ) : (
          data.map((u, i) => (
            <tr key={u.id}>
              <td>{i + 1}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              {showActions && !isDeleted(u.id) && (
                <td>
                  <Button variant="contained" color="error" size="small" onClick={() => handleDelete(u.id)}>
                    Delete
                  </Button>{' '}
                  <Button variant="contained" color="primary" size="small" onClick={() => handleEdit(u)}>
                    Edit
                  </Button>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
           <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="nav-links">
             <span onClick={() => navigate('/admindashboard')}>Dashboard</span>
            <span onClick={() => navigate('/dashboard')}>Events</span>
             <span onClick={() => navigate('/aboutus')}>About</span>
          </div>
        </div>
        <div className="admin-users" style={{ padding: '20px' }}>
          <h2>Manage Users</h2>
          <Button
            variant="contained"
            color={showForm ? 'secondary' : 'success'}
            style={{ marginBottom: 15 }}
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setForm({ name: '', email: '', password: '' });
                setEditMode(false);
              }
            }}
          >
            {showForm ? 'Cancel' : '+ Add User'}
            
          </Button>

          {showForm && (
            <div style={{ maxWidth: 400, marginBottom: 30 }}>
              <TextField
                label="Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                margin="normal"
              />
              <Button
                variant="contained"
                color={editMode ? 'secondary' : 'primary'}
                onClick={handleAddUser}
                style={{ marginTop: 10 }}
              >
                {editMode ? 'Update User' : 'Add User'}
              </Button>
            </div>
          )}

          <Tabs value={tab} onChange={handleTabChange}>
            <Tab label="All Users" />
            <Tab label="Active Users" />
            <Tab label="Deleted Users" />
          </Tabs>

          <div style={{ marginTop: 20 }}>
            {tab === 0 && renderTable(users, true)}
            {tab === 1 && renderTable(activeUsers, true)}
            {tab === 2 && renderTable(deletedUsers)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
