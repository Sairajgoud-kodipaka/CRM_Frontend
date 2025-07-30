'use client';

import { useState, useEffect } from 'react';
import { teamMembersAPI, storesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Work as WorkIcon,
  Store as StoreIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { FlexGrid } from '@/components/ui/FlexGrid';

// Create a theme for the modal
const modalTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          maxWidth: '800px',
          width: '100%',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TeamMemberData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  department: string;
  position: string;
  hire_date: string;
  sales_target: number;
  skills: string[];
  notes: string;
  store?: number;
}

const roleOptions = [
  { value: 'manager', label: 'Manager' },
  { value: 'inhouse_sales', label: 'In-house Sales' },
  { value: 'tele_calling', label: 'Tele-calling' },
  { value: 'marketing', label: 'Marketing' },
];

export default function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
  const [formData, setFormData] = useState<TeamMemberData>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'inhouse_sales',
    phone: '',
    department: '',
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    sales_target: 0,
    skills: [],
    notes: '',
  });
  
  const [errors, setErrors] = useState<Partial<TeamMemberData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await storesAPI.getStores();
        const storeList = Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []);
        setStores(storeList);
        // Auto-select the only available store if there is just one
        if (storeList.length === 1) {
          setFormData(prev => ({ ...prev, store: storeList[0].id }));
        }
      } catch {}
    };
    fetchStores();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<TeamMemberData> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await teamMembersAPI.createTeamMember(formData);
      toast.success('Team member added successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'inhouse_sales',
        phone: '',
        department: '',
        position: '',
        hire_date: new Date().toISOString().split('T')[0],
        sales_target: 0,
        skills: [],
        notes: '',
        store: undefined,
      });
      setErrors({});
    } catch (error: any) {
      toast.error('Failed to add team member');
      console.error('Error creating team member:', error);
      // Handle specific API errors
      if (error.response?.data) {
        const apiErrors = error.response.data;
        setErrors(apiErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof TeamMemberData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <ThemeProvider theme={modalTheme}>
      <Dialog 
        open={isOpen} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            overflow: 'auto'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add Team Member
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 0 }}>
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Personal Information
              </Typography>
              <FlexGrid container spacing={3}>
                <FlexGrid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </FlexGrid>
                <FlexGrid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name *"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </FlexGrid>
              </FlexGrid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Account Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Account Information
              </Typography>
              <FlexGrid container spacing={3}>
                <FlexGrid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username *"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    error={!!errors.username}
                    helperText={errors.username}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </FlexGrid>
                <FlexGrid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </FlexGrid>
                <FlexGrid xs={12}>
                  <TextField
                    fullWidth
                    label="Password *"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </FlexGrid>
              </FlexGrid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Work Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Work Information
              </Typography>
              <FlexGrid container spacing={3}>
                <FlexGrid xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>Role *</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      label="Role *"
                      startAdornment={<WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      {roleOptions.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.role}
                      </Typography>
                    )}
                  </FormControl>
                </FlexGrid>
                <FlexGrid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </FlexGrid>
                <FlexGrid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department *"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    error={!!errors.department}
                    helperText={errors.department}
                    InputProps={{
                      startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </FlexGrid>
                <FlexGrid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position *"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    error={!!errors.position}
                    helperText={errors.position}
                    InputProps={{
                      startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </FlexGrid>
                <FlexGrid xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Store</InputLabel>
                    <Select
                      value={formData.store ?? ''}
                      onChange={(e) => handleInputChange('store', e.target.value ? Number(e.target.value) : '')}
                      label="Store"
                      startAdornment={<StoreIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      <MenuItem value="">Select a store (optional)</MenuItem>
                      {stores.map(store => (
                        <MenuItem key={store.id} value={store.id}>
                          {store.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FlexGrid>
                <FlexGrid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hire Date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </FlexGrid>
                <FlexGrid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sales Target ($)"
                    type="number"
                    value={formData.sales_target}
                    onChange={(e) => handleInputChange('sales_target', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </FlexGrid>
                <FlexGrid xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes about the team member..."
                    InputProps={{
                      startAdornment: <NotesIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                    }}
                  />
                </FlexGrid>
              </FlexGrid>
            </Box>
          </form>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ px: 3, py: 1.5, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <PersonIcon />}
            sx={{ 
              px: 3, 
              py: 1.5, 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {isLoading ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
} 