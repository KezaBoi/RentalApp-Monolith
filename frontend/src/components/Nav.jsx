import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useAuth } from '../context/AuthContext';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';


function RenderUserMenu() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logoutUser();
  }

  return (
    <Box>
      <IconButton
        size='large'
        onClick={handleMenu}
      >
        <AccountCircle />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose} component={Link} to='/rated-properties'>Rated Properties</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  )
}

export default function Nav() {
  const { user } = useAuth();
  const loggedIn = Boolean(user);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Rental Search', path: '/rental-search' },
  ]

  if (!loggedIn) {
    navItems.push(
      { label: 'Login', path: '/login?mode=login' },
      { label: 'Register', path: '/login?mode=register' }
    )
  }

  return (
    <Stack direction={'row'}>
      {navItems.map((item) => (
        <Link to={item.path} key={item.label}>
          <Button color='secondary' sx={{ margin: 1, size: '4vw' }}>{item.label}</Button>
        </Link>
      ))}

      {loggedIn && <RenderUserMenu />}

    </Stack>
  )
}
