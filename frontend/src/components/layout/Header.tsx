import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WorkIcon from '@mui/icons-material/Work';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Jobs', icon: <WorkIcon />, path: '/jobs' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  if (user && (user.role === 'teacher' || user.role === 'superadmin')) {
    menuItems.push({ text: 'Create Job', icon: <AddIcon />, path: '/jobs/create' });
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { md: 'none' } }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo/Title */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            College Placement Portal
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {user && menuItems.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* User Menu (Right Side) */}
          {user ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user.name} src={user.imageUrl || ''}>
                    {user.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex' }}>
              <Button
                component={RouterLink}
                to="/login"
                sx={{ color: 'white', display: 'block' }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                sx={{ color: 'white', display: 'block' }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {user && menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={RouterLink}
                to={item.path}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          
          {user && (
            <>
              <Divider />
              <List>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </List>
            </>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header; 