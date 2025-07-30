'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import Link from 'next/link';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';

const roleLabels: Record<string, string> = {
  'platform_admin': 'Platform Admin',
  'business_admin': 'Business Admin',
  'manager': 'Manager',
  'inhouse_sales': 'In-house Sales',
  'tele_calling': 'Tele-calling Team',
  'marketing': 'Marketing Team',
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const qRole = searchParams.get('role');
    if (qRole) {
      setRole(qRole);
      localStorage.setItem('selected_role', qRole);
    } else {
      const stored = localStorage.getItem('selected_role');
      if (stored) setRole(stored);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authAPI.register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
      });
      setSuccess('Registration successful! Please login.');
      setTimeout(() => {
        router.push(`/login?role=${role}`);
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
        py: 4,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Card 
          elevation={8}
          sx={{ 
            borderRadius: 4,
            overflow: 'visible',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 5 } }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  color: 'primary.main'
                }}
              >
                Register
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {roleLabels[role] || 'Select your role'}
              </Typography>
            </Box>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="outlined"
                />
                
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="First Name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    variant="outlined"
                  />
                </Stack>
                
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="outlined"
                />
                
                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert severity="success">
                    {success}
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: 2
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <Typography>Registering...</Typography>
                    </Box>
                  ) : (
                    'Register'
                  )}
                </Button>
              </Stack>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 3,
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <Typography 
                component={Link} 
                href="/select-role"
                variant="body2"
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Change Role
              </Typography>
              <Typography 
                component={Link} 
                href={`/login?role=${role}`}
                variant="body2"
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Login
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 