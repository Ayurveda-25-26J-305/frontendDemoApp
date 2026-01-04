'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  Box,
  useScrollTrigger,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Spa,
  Menu as MenuIcon,
  Close,
  LocalHospital,
  Restaurant,
  Help,
  Medication,
  Home,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const navItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Disease Prediction', path: '/prediction', icon: <LocalHospital /> },
    { label: 'Medicine', path: '/medicine', icon: <Medication /> },
    { label: 'Diet Planning', path: '/diet', icon: <Restaurant /> },
    { label: 'Q&A', path: '/qa', icon: <Help /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={trigger ? 4 : 0}
        sx={{
          background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
          transition: 'all 0.3s',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Spa sx={{ fontSize: 40, mr: 1.5, color: 'white' }} />
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1 }}>
                    Ayurvedic AI
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#c8e6c9' }}>
                    Healthcare System
                  </Typography>
                </Box>
              </Box>
            </Link>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  href={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: 'white',
                    bgcolor: pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#2d5016' }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Menu
            </Typography>
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem 
                key={item.path}
                component={Link}
                href={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  bgcolor: pathname === item.path ? 'rgba(45, 80, 22, 0.1)' : 'transparent',
                  color: pathname === item.path ? '#2d5016' : 'text.primary',
                  '&:hover': {
                    bgcolor: 'rgba(45, 80, 22, 0.05)',
                  },
                  borderLeft: pathname === item.path ? '4px solid #2d5016' : '4px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <ListItemIcon sx={{ color: pathname === item.path ? '#2d5016' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}