'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await authAPI.login({
          username: formData.username,
          password: formData.password
        });
        
        // Store user data if available
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        toast.success('Login successful!');
        
        // Determine dashboard URL based on user role
        let dashboardUrl = '/platform-admin/dashboard'; // Default fallback
        
        if (response.user && response.user.role) {
          switch (response.user.role) {
            case 'platform_admin':
              dashboardUrl = '/platform-admin/dashboard';
              break;
            case 'business_admin':
              dashboardUrl = '/business-admin/dashboard';
              break;
            case 'manager':
              dashboardUrl = '/managers/dashboard';
              break;
            case 'inhouse_sales':
              dashboardUrl = '/inhouse-sales/dashboard';
              break;
            case 'tele_calling':
              dashboardUrl = '/tele-calling/dashboard';
              break;
            case 'marketing':
              dashboardUrl = '/marketing/dashboard';
              break;
            default:
              dashboardUrl = '/platform-admin/dashboard';
          }
        }
        
        // Redirect to appropriate dashboard
        router.push(dashboardUrl);
      } catch (error: any) {
        console.error('Login failed:', error);
        const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        py: { xs: 3, sm: 6 },
        px: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 3
        }}>
          {/* Logo and Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 2,
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              J
            </Avatar>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                color: 'text.primary'
              }}
            >
              Sign in to your account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Or{' '}
              <Typography 
                component={Link} 
                href="/auth/register" 
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'primary.dark',
                    textDecoration: 'underline'
                  }
                }}
              >
                create a new account
              </Typography>
            </Typography>
          </Box>
          
          {/* Login Form */}
          <Card 
            elevation={3}
            sx={{ 
              width: '100%',
              maxWidth: 400,
              borderRadius: 2
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box component="form" onSubmit={handleSubmit}>
                {/* General Error Alert */}
                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}
                
                <Stack spacing={3}>
                  {/* Username Field */}
                  <TextField
                    fullWidth
                    id="username"
                    name="username"
                    label="Username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    error={!!errors.username}
                    helperText={errors.username}
                    placeholder="Enter your username"
                    variant="outlined"
                  />
                  
                  {/* Password Field */}
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    placeholder="Enter your password"
                    variant="outlined"
                  />

                  {/* Remember Me & Forgot Password */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 }
                  }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="remember"
                          name="remember"
                          checked={formData.remember}
                          onChange={handleChange}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Remember me
                        </Typography>
                      }
                    />

                    <Typography 
                      component={Link} 
                      href="/auth/forgot-password" 
                      variant="body2"
                      sx={{ 
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          color: 'primary.dark',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Forgot your password?
                    </Typography>
                  </Box>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      mt: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      borderRadius: 2
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        <Typography>Signing in...</Typography>
                      </Box>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
} 