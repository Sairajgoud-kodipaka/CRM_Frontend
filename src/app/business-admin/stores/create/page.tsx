"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storesAPI } from "@/lib/api";
import { usersAPI } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  ThemeProvider,
  createTheme,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Store as StoreIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
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

// Create theme for create store page
const createStoreTheme = createTheme({
  palette: {
    primary: {
      main: colors.softNavy,
      light: colors.softGrey,
      dark: colors.darkNavy,
    },
    secondary: {
      main: colors.gold,
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: `0 8px 32px rgba(35, 57, 93, 0.1)`,
          border: `1px solid ${colors.softGrey}`,
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
          padding: '12px 24px',
        },
      },
    },
  },
});

const initialForm = {
  name: "",
  code: "",
  address: "",
  city: "",
  state: "",
  timezone: "Asia/Kolkata",
  manager: "",
};

export default function StoreCreatePage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch users for manager dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const data = await usersAPI.getUsers();
        setUsers(Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []));
      } catch (err) {
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.code) errs.code = "Code is required";
    if (!form.city) errs.city = "City is required";
    if (!form.state) errs.state = "State is required";
    if (!form.address) errs.address = "Address is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await storesAPI.createStore(form);
      toast.success("Store created successfully!");
      router.push("/business-admin/stores");
    } catch (err: any) {
      toast.error("Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/business-admin/stores");
  };

  return (
    <ThemeProvider theme={createStoreTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: colors.softWhite,
        py: 4
      }}>
        <Container maxWidth="md">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Tooltip title="Back to Stores">
                <IconButton 
                  onClick={handleBack}
                  sx={{ 
                    mr: 2,
                    color: colors.softNavy,
                    '&:hover': {
                      backgroundColor: `${colors.softGrey}20`,
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StoreIcon sx={{ mr: 2, color: colors.softNavy, fontSize: 32 }} />
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    color: colors.darkNavy,
                    fontWeight: 700 
                  }}
                >
                  Create New Store
                </Typography>
              </Box>
            </Box>
            <Typography 
              variant="body1" 
              sx={{ 
                color: colors.softNavy,
                ml: 7 
              }}
            >
              Add a new store location to your jewelry business
            </Typography>
          </Box>

          {/* Form Card */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit}>
                {/* Store Information Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 3, 
                      color: colors.darkNavy,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <StoreIcon sx={{ mr: 1, color: colors.softNavy }} />
                    Store Information
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                    <TextField
                      fullWidth
                      label="Store Name *"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      placeholder="Enter store name"
                    />
                    
                    <TextField
                      fullWidth
                      label="Store Code *"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      error={!!errors.code}
                      helperText={errors.code}
                      placeholder="Enter unique store code"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 4, borderColor: colors.softGrey }} />

                {/* Location Information Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 3, 
                      color: colors.darkNavy,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <LocationIcon sx={{ mr: 1, color: colors.softNavy }} />
                    Location Information
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      fullWidth
                      label="Address *"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      error={!!errors.address}
                      helperText={errors.address}
                      multiline
                      rows={3}
                      placeholder="Enter complete store address"
                    />
                    
                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                      <TextField
                        fullWidth
                        label="City *"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        error={!!errors.city}
                        helperText={errors.city}
                        placeholder="Enter city"
                      />
                      
                      <TextField
                        fullWidth
                        label="State *"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        error={!!errors.state}
                        helperText={errors.state}
                        placeholder="Enter state"
                      />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 4, borderColor: colors.softGrey }} />

                {/* Management Information Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 3, 
                      color: colors.darkNavy,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <PersonIcon sx={{ mr: 1, color: colors.softNavy }} />
                    Management & Settings
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                    <TextField
                      fullWidth
                      label="Timezone"
                      name="timezone"
                      value={form.timezone}
                      onChange={handleChange}
                      placeholder="Asia/Kolkata"
                      InputProps={{
                        startAdornment: <ScheduleIcon sx={{ mr: 1, color: colors.softNavy }} />
                      }}
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>Store Manager</InputLabel>
                      <Select
                        name="manager"
                        value={form.manager}
                        onChange={handleChange}
                        label="Store Manager"
                        disabled={usersLoading}
                        startAdornment={<PersonIcon sx={{ mr: 1, color: colors.softNavy }} />}
                      >
                        <MenuItem value="">
                          <em>Select a manager (optional)</em>
                        </MenuItem>
                        {users.map((user: any) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.full_name || user.username} (ID: {user.id})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {usersLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Loading managers...
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: 'flex-end',
                  pt: 3,
                  borderTop: `1px solid ${colors.softGrey}`
                }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={loading}
                    sx={{
                      color: colors.softNavy,
                      borderColor: colors.softGrey,
                      '&:hover': {
                        borderColor: colors.softNavy,
                        backgroundColor: `${colors.softGrey}20`,
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} sx={{ color: colors.white }} />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    sx={{
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
                    {loading ? "Creating..." : "Create Store"}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
} 