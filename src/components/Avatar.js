import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

const UserAvatar = ({ onLogout, onChangePassword }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div style={{ position: 'absolute', top: 100, left: 5 }}>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          backgroundColor: '#007bff',
          color: 'white',
          '&:hover': {
            backgroundColor: '#28a745',
          },
          width: 30,
          height: 30,
          borderRadius: '50%',
        }}
      >
        <SettingsRoundedIcon fontSize="medium" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            onChangePassword();
          }}
        >
          Change Password
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onLogout();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
};

export default UserAvatar;
