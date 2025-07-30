'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import Link from 'next/link';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  ThemeProvider,
  createTheme,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Phone as PhoneIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';

// Color scheme
const colors = {
  softWhite: '#F9FAFB',
  white: '#FFFFFF',
  softNavy: '#23395D',
  darkNavy: '#1B263B',
  softGrey: '#D0D6DD',
  gold: '#FFD700',
};

// Create a theme for login page
const loginTheme = createTheme({
  palette: {
    primary: {
      main: colors.softNavy,
      light: colors.softGrey,
      dark: colors.darkNavy,
    },
    secondary: {
      main: colors.gold,
      light: '#ffff52',
      dark: '#c7a500',
    },
    background: {
      default: colors.softWhite,
      paper: colors.white,
    },
    text: {
      primary: colors.darkNavy,
      secondary: colors.softNavy,
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: `0 8px 32px rgba(35, 57, 93, 0.1)`,
          backgroundColor: colors.white,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: colors.white,
            '& fieldset': {
              borderColor: colors.softGrey,
            },
            '&:hover fieldset': {
              borderColor: colors.softNavy,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.softNavy,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const roleDashboards: Record<string, string> = {
  'platform_admin': '/platform-admin/dashboard',
  'business_admin': '/business-admin/dashboard',
  'manager': '/managers/dashboard',
  'inhouse_sales': '/inhouse-sales/dashboard',
  'tele_calling': '/tele-calling/dashboard',
  'marketing': '/marketing/dashboard',
};

const roleLabels: Record<string, string> = {
  'platform_admin': 'Platform Admin',
  'business_admin': 'Business Admin',
  'manager': 'Manager',
  'inhouse_sales': 'In-house Sales',
  'tele_calling': 'Tele-calling Team',
  'marketing': 'Marketing Team',
};

const roleIcons: Record<string, React.ReactElement> = {
  'platform_admin': <AdminIcon />,
  'business_admin': <BusinessIcon />,
  'manager': <GroupIcon />,
  'inhouse_sales': <PersonIcon />,
  'tele_calling': <PhoneIcon />,
  'marketing': <CampaignIcon />,
};

interface FormData {
  username: string;
  password: string;
  role: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  role?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    role: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const qRole = searchParams.get('role');
    if (qRole) {
      setFormData(prev => ({ ...prev, role: qRole }));
      localStorage.setItem('selected_role', qRole);
    } else {
      const stored = localStorage.getItem('selected_role');
      if (stored) {
        setFormData(prev => ({ ...prev, role: stored }));
      }
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username or email is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear login error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setLoginError('');
    
    try {
      const result = await authAPI.login({ 
        username: formData.username, 
        password: formData.password 
      });
      
      // Store user info (tokens are already stored by authAPI.login)
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Redirect to dashboard for this role
      const dashboard = roleDashboards[formData.role] || '/';
      router.push(dashboard);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Login failed. Please check your credentials.';
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ThemeProvider theme={loginTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          backgroundColor: colors.softWhite,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: `0 8px 32px rgba(35, 57, 93, 0.1)`,
              backgroundColor: colors.white,
            }}
          >
            {/* Left Side - Branding */}
            <Box
              sx={{
                flex: 1,
                background: `linear-gradient(135deg, ${colors.softNavy} 0%, ${colors.darkNavy} 100%)`,
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 6,
                color: colors.white,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <LoginIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                  Jewelry CRM
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
                  Professional Customer Relationship Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 400 }}>
                  Streamline your jewelry business operations with our comprehensive CRM solution designed for modern retailers.
                </Typography>
              </Box>
            </Box>

            {/* Right Side - Login Form */}
            <Box
              sx={{
                flex: 1,
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: { xs: 'auto', md: '600px' },
              }}
            >
              {/* Mobile Header */}
              <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: colors.darkNavy, mb: 1 }}>
                  Jewelry CRM
                </Typography>
                <Typography variant="body2" sx={{ color: colors.softNavy }}>
                  Sign in to your account
                </Typography>
              </Box>

              {/* Desktop Header */}
              <Box sx={{ display: { xs: 'none', md: 'block' }, mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: colors.darkNavy, mb: 1 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" sx={{ color: colors.softNavy }}>
                  Sign in to access your jewelry CRM dashboard
                </Typography>
              </Box>

              {/* Role Display */}
              {formData.role && (
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Chip
                    icon={roleIcons[formData.role]}
                    label={roleLabels[formData.role]}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, px: 2, py: 1 }}
                  />
                </Box>
              )}

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Role Selection */}
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>Select Role *</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      label="Select Role *"
                      startAdornment={<AdminIcon sx={{ mr: 1, color: colors.softNavy }} />}
                      sx={{
                        backgroundColor: colors.white,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.softGrey,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.softNavy,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.softNavy,
                        },
                      }}
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {roleIcons[value]}
                            <Typography sx={{ ml: 1 }}>{label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.role}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Username/Email Field */}
                  <TextField
                    fullWidth
                    label="Username or Email *"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    error={!!errors.username}
                    helperText={errors.username}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: colors.softNavy }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Password Field */}
                  <TextField
                    fullWidth
                    label="Password *"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: colors.softNavy }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handlePasswordVisibility}
                            edge="end"
                            size="small"
                            sx={{ color: colors.softNavy }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Error Alert */}
                  {loginError && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {loginError}
                    </Alert>
                  )}

                  {/* Login Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${colors.softNavy} 0%, ${colors.darkNavy} 100%)`,
                      color: colors.white,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${colors.darkNavy} 0%, ${colors.softNavy} 100%)`,
                      },
                      '&:disabled': {
                        background: colors.softGrey,
                        color: colors.softNavy,
                      },
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Box>
              </Box>

              {/* Divider */}
              <Divider sx={{ width: '100%', my: 4, borderColor: colors.softGrey }} />

              {/* Links */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Link href="/select-role" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="text"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      color: colors.softNavy,
                      '&:hover': {
                        color: colors.darkNavy,
                        backgroundColor: `${colors.softGrey}20`,
                      },
                    }}
                  >
                    Change Role
                  </Button>
                </Link>
                <Link href={`/register?role=${formData.role}`} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="text"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      color: colors.softNavy,
                      '&:hover': {
                        color: colors.darkNavy,
                        backgroundColor: `${colors.softGrey}20`,
                      },
                    }}
                  >
                    Create Account
                  </Button>
                </Link>
              </Box>

              {/* Help Text */}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
                Need help? Contact your system administrator
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
} 