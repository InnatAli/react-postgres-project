import React, { useEffect, useState } from 'react';
import UserAvatar from '../components/Avatar';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { Tabs, Tab, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [deletedAdmins, setDeletedAdmins] = useState([]);
  const [tab, setTab] = useState(0);
 const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [editMode, setEditMode] = useState(false);
  const [editAdminId, setEditAdminId] = useState(null);
  const [showForm, setShowForm] = useState(false);
 const [showPasswordModal, setShowPasswordModal] = useState(false);
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    fetchAdmins();
    fetchDeletedAdmins();
  }, []);

  const fetchAdmins = async () => {
    const res = await fetch('http://localhost:5000/api/admin/admins');
    const data = await res.json();
    setAdmins(data.admins || []);
  };

  const fetchDeletedAdmins = async () => {
    const res = await fetch('http://localhost:5000/api/admin/deleted-admins');
    const data = await res.json();
    setDeletedAdmins(data.deleted || []);
  };

  const handleTabChange = (e, newValue) => setTab(newValue);

  const isDeleted = (adminId) =>
    deletedAdmins.some((du) => du.id === adminId);

  const handleDelete = async (id) => {
    const confirm = window.confirm('are you sure you want to delete this admin?');
    if (!confirm) return;

    const res = await fetch(`http://localhost:5000/api/admin/admins/${id}/delete`, {
      method: 'POST',
    });
    const data = await res.json();
    alert(data.message);
    fetchAdmins();
    fetchDeletedAdmins();
  };

  const handleAddAdmin = async () => {
    if (!form.name || !form.email || (!form.password && !editMode)) {
      alert('fill the blanks');
      return;
    }

    if (editMode) {
      const res = await fetch(`http://localhost:5000/api/admin/admins/${editAdminId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(data.message);
    } else {
      const res = await fetch('http://localhost:5000/api/admin/admins/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(data.message);
    }

    setForm({ name: '', email: '', password: '' });
    setEditMode(false);
    setEditAdminId(null);
    setShowForm(false);
    fetchAdmins();
  };

  const handleEdit = (admin) => {
    setForm({ name: admin.name, email: admin.email, password: '' });
    setEditMode(true);
    setEditAdminId(admin.id);
    setShowForm(true);
  };

  const activeAdmins = admins.filter((u) => !isDeleted(u.id));

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
            <td colSpan={showActions ? 4 : 3} style={{ textAlign: 'center' }}>No admins found.</td>
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

      <div className="main-content ">
           <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="nav-links">
             <span onClick={() => navigate('/admindashboard')}>Dashboard</span>
            <span onClick={() => navigate('/dashboard')}>Events</span>
            <span onClick={() => window.location.href='/events/new'}>Create New Event</span>  
          <span onClick={() => navigate('/adminusers')}>Manage Admins</span>
          <span onClick={() => navigate('/adminbookings')}>Manage Booking</span> 
            <span onClick={() => navigate('/aboutus')}>About</span>
             <span className="avatar-container"><UserAvatar onLogout={() => { localStorage.removeItem('token'); window.location.href = '/login';
  }}
  onChangePassword={() => setShowPasswordModal(true)}
/>
<ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} /></span> 
          </div>
        </div>
        <div className="admin-users" style={{ padding: '20px' }}>
          <h2>Manage Admins</h2>
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
            {showForm ? 'Cancel' : '+ Add Admin'}
            
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
                onClick={handleAddAdmin}
                style={{ marginTop: 10 }}
              >
                {editMode ? 'Update Admin' : 'Add Admin'}
              </Button>
            </div>
          )}

          <Tabs value={tab} onChange={handleTabChange}>
            <Tab label="All Admins" />
            <Tab label="Active Admins" />
            <Tab label="Deleted Admins" />
          </Tabs>

          <div style={{ marginTop: 20 }}>
            {tab === 0 && renderTable(admins, true)}
            {tab === 1 && renderTable(activeAdmins, true)}
            {tab === 2 && renderTable(deletedAdmins)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
