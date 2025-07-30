'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { customersAPI, usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Container,
  ThemeProvider,
  createTheme,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Feedback as FeedbackIcon,
  ImportExport as ImportExportIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  History as AuditIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Create a theme for manager customer DB
const customerDBTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
    },
  },
});

export default function ManagersCustomerDB() {
  const { user, loading } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomerForAudit, setSelectedCustomerForAudit] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  // Add Customer form state (copied from inhouse-sales add-customer)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    customer_type: 'individual',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    date_of_birth: '',
    anniversary_date: '',
    notes: '',
    preferred_metal: '',
    preferred_stone: '',
    ring_size: '',
    budget_range: '',
    assigned_to: '',
    community: '',
    leadSource: 'Walk-in', // Default value to prevent null
    reasonForVisit: 'Self-purchase', // Default value to prevent null
    ageOfEndUser: '18-25', // Default value to prevent null
    nextFollowUp: new Date().toISOString().slice(0, 10), // Default to today
    summaryNotes: '',
    catchment_area: '',
    mother_tongue: '',
    saving_scheme: '',
  });

  // Customer Interests state
  const [customerInterests, setCustomerInterests] = useState([
    {
      id: 1,
      mainCategory: '',
      designSelected: false,
      wantsMoreDiscount: false,
      checkingOtherJewellers: false,
      feltLessVariety: false,
      otherPreferences: '',
    }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleQuickExportCSV = async () => {
    try {
      const blob = await customersAPI.exportCustomersCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('CSV export completed successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV file');
    }
  };

  const handleQuickExportJSON = async () => {
    try {
      const blob = await customersAPI.exportCustomersJSON();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('JSON export completed successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export JSON file');
    }
  };

  const fetchData = async () => {
    setDataLoading(true);
    try {
      // Fetch customers for the manager's store
      const customersData = await customersAPI.getCustomers();
      setCustomers(Array.isArray(customersData) ? customersData : (customersData && Array.isArray(customersData.results) ? customersData.results : []));
      
      // Fetch team members for the manager's store
      const teamData = await usersAPI.getUsers();
      const teamMembersData = Array.isArray(teamData) ? teamData : (teamData && Array.isArray(teamData.results) ? teamData.results : []);
      setTeamMembers(teamMembersData);
      
      // Fetch users for assigned_to dropdown
      setUsers(teamMembersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setCustomers([]);
      setTeamMembers([]);
      setUsers([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Wait for AuthContext to finish loading
  if (loading) {
    return <div className="p-8 text-blue-600 font-semibold">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8 text-red-600 font-semibold">You must be logged in to view this page.</div>;
  }

  // Form validation (reuse logic)
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Customer name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle customer interests
  const addInterest = () => {
    const newId = Math.max(...customerInterests.map(interest => interest.id)) + 1;
    setCustomerInterests([
      ...customerInterests,
      {
        id: newId,
        mainCategory: '',
        designSelected: false,
        wantsMoreDiscount: false,
        checkingOtherJewellers: false,
        feltLessVariety: false,
        otherPreferences: '',
      }
    ]);
  };

  const removeInterest = (id: number) => {
    if (customerInterests.length > 1) {
      setCustomerInterests(customerInterests.filter(interest => interest.id !== id));
    }
  };

  const updateInterest = (id: number, field: string, value: any) => {
    setCustomerInterests(customerInterests.map(interest => 
      interest.id === id ? { ...interest, [field]: value } : interest
    ));
  };

  // Handle audit logs
  const viewAuditLogs = async (customer: any) => {
    setSelectedCustomerForAudit(customer);
    setShowAuditModal(true);
    setAuditLoading(true);
    try {
      const logs = await customersAPI.getAuditLogsForCustomer(customer.id);
      setAuditLogs(Array.isArray(logs) ? logs : (logs && Array.isArray(logs.results) ? logs.results : []));
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setAuditLogs([]);
      toast.error('Failed to fetch audit logs');
    } finally {
      setAuditLoading(false);
    }
  };

  const formatAuditData = (data: any) => {
    if (!data) return 'No data';
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (typeof parsed === 'object') {
        const changedKeys = Object.keys(parsed);
        return (
          <div className="space-y-2">
            {changedKeys.map(key => (
              <div key={key} className="text-sm">
                <span className="font-medium">{key}:</span> {String(parsed[key])}
              </div>
            ))}
          </div>
        );
      }
      return String(parsed);
    } catch {
      return String(data);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormSubmitting(true);
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => {
          // Ensure required fields are never null
          if (['leadSource', 'reasonForVisit', 'ageOfEndUser', 'nextFollowUp'].includes(key)) {
            return [key, value || (key === 'leadSource' ? 'Walk-in' : key === 'reasonForVisit' ? 'Self-purchase' : key === 'ageOfEndUser' ? '18-25' : new Date().toISOString().slice(0, 10))];
          }
          return [key, value === '' ? null : value];
        })
      );
      
      // Add customer interests to the data
      const dataWithInterests = {
        ...cleanedData,
        customer_interests: customerInterests
      };
      
      await customersAPI.createCustomer(dataWithInterests);
      toast.success('Customer added successfully!');
      setShowAddModal(false);
      // Refresh customer list after add
      fetchData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to add customer. Please try again.';
      toast.error(errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

 
  return (
    <ThemeProvider theme={customerDBTheme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#333' }}>
            Customer DB (Manager View)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/managers/feedback-monitoring">
              <Button variant="contained" startIcon={<FeedbackIcon />} sx={{ backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' } }}>
                Feedback Monitoring
              </Button>
            </Link>
            <Link href="/managers/customers/import-export">
              <Button variant="contained" startIcon={<ImportExportIcon />} sx={{ backgroundColor: '#22c55e', '&:hover': { backgroundColor: '#06b6d4' } }}>
                Import/Export
              </Button>
            </Link>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowAddModal(true)} sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
              + Add Customer
            </Button>
          </Box>
        </Box>

        {/* Add Customer Modal */}
        {showAddModal && (
          <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add Customer (Manager)</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Customer Details */}
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Customer Details</Typography>
                  <Grid container spacing={2}>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Full Name *</Typography>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={e => setFormData(f => ({...f, name: e.target.value}))}
                        error={!!errors.name}
                        helperText={errors.name}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Phone Number *</Typography>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={e => setFormData(f => ({...f, phone: e.target.value}))}
                        error={!!errors.phone}
                        helperText={errors.phone}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Email *</Typography>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={e => setFormData(f => ({...f, email: e.target.value}))}
                        error={!!errors.email}
                        helperText={errors.email}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Assigned Salesperson *</Typography>
                      <Select
                        fullWidth
                        label="Assigned Salesperson"
                        name="assigned_to"
                        value={formData.assigned_to}
                        onChange={e => setFormData(f => ({...f, assigned_to: e.target.value}))}
                        disabled={usersLoading}
                      >
                        <MenuItem value="">Select salesperson</MenuItem>
                        {users.map((user: any) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.first_name || user.username} {user.last_name || ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Birth Date</Typography>
                      <TextField
                        fullWidth
                        label="Birth Date"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={e => setFormData(f => ({...f, date_of_birth: e.target.value}))}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Anniversary Date</Typography>
                      <TextField
                        fullWidth
                        label="Anniversary Date"
                        name="anniversary_date"
                        type="date"
                        value={formData.anniversary_date}
                        onChange={e => setFormData(f => ({...f, anniversary_date: e.target.value}))}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Customer Type</Typography>
                      <Select
                        fullWidth
                        label="Customer Type"
                        name="customer_type"
                        value={formData.customer_type}
                        onChange={e => setFormData(f => ({...f, customer_type: e.target.value}))}
                      >
                        <MenuItem value="individual">Individual</MenuItem>
                        <MenuItem value="business">Business</MenuItem>
                        <MenuItem value="wholesale">Wholesale</MenuItem>
                      </Select>
                    </Grid>
                  </Grid>
                </Box>

                {/* 2. Address */}
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Address</Typography>
                  <Grid container spacing={2}>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Street Address</Typography>
                      <TextField
                        fullWidth
                        label="Street Address"
                        name="address"
                        value={formData.address}
                        onChange={e => setFormData(f => ({...f, address: e.target.value}))}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>City</Typography>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={e => setFormData(f => ({...f, city: e.target.value}))}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>State</Typography>
                      <TextField
                        fullWidth
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={e => setFormData(f => ({...f, state: e.target.value}))}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Country</Typography>
                      <TextField
                        fullWidth
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={e => setFormData(f => ({...f, country: e.target.value}))}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Catchment Area</Typography>
                      <TextField
                        fullWidth
                        label="Catchment Area"
                        name="catchment_area"
                        value={formData.catchment_area}
                        onChange={e => setFormData(f => ({...f, catchment_area: e.target.value}))}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* 3. Jewelry Preferences */}
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Jewelry Preferences</Typography>
                  <Grid container spacing={2}>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Preferred Metal</Typography>
                      <Select
                        fullWidth
                        label="Preferred Metal"
                        name="preferred_metal"
                        value={formData.preferred_metal}
                        onChange={e => setFormData(f => ({...f, preferred_metal: e.target.value}))}
                      >
                        <MenuItem value="">Select metal preference</MenuItem>
                        <MenuItem value="gold">Gold</MenuItem>
                        <MenuItem value="silver">Silver</MenuItem>
                        <MenuItem value="platinum">Platinum</MenuItem>
                        <MenuItem value="palladium">Palladium</MenuItem>
                        <MenuItem value="rose_gold">Rose Gold</MenuItem>
                        <MenuItem value="white_gold">White Gold</MenuItem>
                      </Select>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Preferred Stone</Typography>
                      <Select
                        fullWidth
                        label="Preferred Stone"
                        name="preferred_stone"
                        value={formData.preferred_stone}
                        onChange={e => setFormData(f => ({...f, preferred_stone: e.target.value}))}
                      >
                        <MenuItem value="">Select stone preference</MenuItem>
                        <MenuItem value="diamond">Diamond</MenuItem>
                        <MenuItem value="ruby">Ruby</MenuItem>
                        <MenuItem value="emerald">Emerald</MenuItem>
                        <MenuItem value="sapphire">Sapphire</MenuItem>
                        <MenuItem value="pearl">Pearl</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Ring Size</Typography>
                      <Select
                        fullWidth
                        label="Ring Size"
                        name="ring_size"
                        value={formData.ring_size}
                        onChange={e => setFormData(f => ({...f, ring_size: e.target.value}))}
                      >
                        <MenuItem value="">Select ring size</MenuItem>
                        <MenuItem value="3">3</MenuItem>
                        <MenuItem value="3.5">3.5</MenuItem>
                        <MenuItem value="4">4</MenuItem>
                        <MenuItem value="4.5">4.5</MenuItem>
                        <MenuItem value="5">5</MenuItem>
                        <MenuItem value="5.5">5.5</MenuItem>
                        <MenuItem value="6">6</MenuItem>
                        <MenuItem value="6.5">6.5</MenuItem>
                        <MenuItem value="7">7</MenuItem>
                        <MenuItem value="7.5">7.5</MenuItem>
                        <MenuItem value="8">8</MenuItem>
                        <MenuItem value="8.5">8.5</MenuItem>
                        <MenuItem value="9">9</MenuItem>
                        <MenuItem value="9.5">9.5</MenuItem>
                        <MenuItem value="10">10</MenuItem>
                        <MenuItem value="10.5">10.5</MenuItem>
                        <MenuItem value="11">11</MenuItem>
                        <MenuItem value="11.5">11.5</MenuItem>
                        <MenuItem value="12">12</MenuItem>
                      </Select>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Budget Range</Typography>
                      <Select
                        fullWidth
                        label="Budget Range"
                        name="budget_range"
                        value={formData.budget_range}
                        onChange={e => setFormData(f => ({...f, budget_range: e.target.value}))}
                      >
                        <MenuItem value="">Select budget range</MenuItem>
                        <MenuItem value="under_1000">Under $1,000</MenuItem>
                        <MenuItem value="1000_5000">$1,000 - $5,000</MenuItem>
                        <MenuItem value="5000_10000">$5,000 - $10,000</MenuItem>
                        <MenuItem value="10000_25000">$10,000 - $25,000</MenuItem>
                        <MenuItem value="25000_50000">$25,000 - $50,000</MenuItem>
                        <MenuItem value="over_50000">Over $50,000</MenuItem>
                      </Select>
                    </Grid>
                  </Grid>
                </Box>

                {/* 4. Demographics & Visit */}
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Demographics & Visit</Typography>
                  <Grid container spacing={2}>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Community</Typography>
                      <Select
                        fullWidth
                        label="Community"
                        name="community"
                        value={formData.community}
                        onChange={e => setFormData(f => ({...f, community: e.target.value}))}
                      >
                        <MenuItem value="">Select Community</MenuItem>
                        <MenuItem value="Hindu">Hindu</MenuItem>
                        <MenuItem value="Muslim">Muslim</MenuItem>
                        <MenuItem value="Jain">Jain</MenuItem>
                        <MenuItem value="Parsi">Parsi</MenuItem>
                        <MenuItem value="Buddhist">Buddhist</MenuItem>
                        <MenuItem value="Cross Community">Cross Community</MenuItem>
                      </Select>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Mother Tongue / Sub-community</Typography>
                      <TextField
                        fullWidth
                        label="Mother Tongue / Sub-community"
                        name="mother_tongue"
                        value={formData.mother_tongue}
                        onChange={e => setFormData(f => ({...f, mother_tongue: e.target.value}))}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Reason for Visit</Typography>
                      <Select
                        fullWidth
                        label="Reason for Visit"
                        name="reasonForVisit"
                        value={formData.reasonForVisit}
                        onChange={e => setFormData(f => ({...f, reasonForVisit: e.target.value}))}
                      >
                        <MenuItem value="Self-purchase">Self-purchase</MenuItem>
                        <MenuItem value="Wedding">Wedding</MenuItem>
                        <MenuItem value="Gifting">Gifting</MenuItem>
                        <MenuItem value="Repair">Repair</MenuItem>
                        <MenuItem value="Browse">Browse</MenuItem>
                      </Select>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Lead Source</Typography>
                      <Select
                        fullWidth
                        label="Lead Source"
                        name="leadSource"
                        value={formData.leadSource}
                        onChange={e => setFormData(f => ({...f, leadSource: e.target.value}))}
                      >
                        <MenuItem value="Walk-in">Walk-in</MenuItem>
                        <MenuItem value="Instagram">Instagram</MenuItem>
                        <MenuItem value="Facebook">Facebook</MenuItem>
                        <MenuItem value="Google">Google</MenuItem>
                        <MenuItem value="Referral">Referral</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Age of End-User</Typography>
                      <Select
                        fullWidth
                        label="Age of End-User"
                        name="ageOfEndUser"
                        value={formData.ageOfEndUser}
                        onChange={e => setFormData(f => ({...f, ageOfEndUser: e.target.value}))}
                      >
                        <MenuItem value="18-25">18-25</MenuItem>
                        <MenuItem value="26-35">26-35</MenuItem>
                        <MenuItem value="36-45">36-45</MenuItem>
                        <MenuItem value="46-55">46-55</MenuItem>
                        <MenuItem value="56-65">56-65</MenuItem>
                        <MenuItem value="65+">65+</MenuItem>
                        <MenuItem value="All/Family">All/Family</MenuItem>
                      </Select>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Monthly Saving Scheme</Typography>
                      <Select
                        fullWidth
                        label="Monthly Saving Scheme"
                        name="saving_scheme"
                        value={formData.saving_scheme}
                        onChange={e => setFormData(f => ({...f, saving_scheme: e.target.value}))}
                      >
                        <MenuItem value="">Select Status</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                      </Select>
                    </Grid>
                  </Grid>
                </Box>

                {/* 5. Customer Interests */}
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Customer Interests</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={addInterest} sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
                      + Add Interest
                    </Button>
                  </Box>
                  {customerInterests.map((interest, index) => (
                    <Box key={interest.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, mb: 2, bgcolor: '#fff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4f4f4f' }}>Interest Item #{index + 1}</Typography>
                        {customerInterests.length > 1 && (
                          <Button variant="text" color="error" onClick={() => removeInterest(interest.id)} sx={{ fontWeight: 600 }}>
                            Remove
                          </Button>
                        )}
                      </Box>
                      <Grid container spacing={2}>
                        <Grid>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Main Category *</Typography>
                          <Select
                            fullWidth
                            label="Main Category"
                            value={interest.mainCategory}
                            onChange={(e) => updateInterest(interest.id, 'mainCategory', e.target.value)}
                          >
                            <MenuItem value="">Select Category</MenuItem>
                            <MenuItem value="Rings">Rings</MenuItem>
                            <MenuItem value="Necklaces">Necklaces</MenuItem>
                            <MenuItem value="Earrings">Earrings</MenuItem>
                            <MenuItem value="Bracelets">Bracelets</MenuItem>
                            <MenuItem value="Pendants">Pendants</MenuItem>
                            <MenuItem value="Bangles">Bangles</MenuItem>
                            <MenuItem value="Anklets">Anklets</MenuItem>
                            <MenuItem value="Nose Rings">Nose Rings</MenuItem>
                            <MenuItem value="Toe Rings">Toe Rings</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </Grid>
                      </Grid>
                      
                      {/* Customer Preference */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4f4f4f' }}>Customer Preference</Typography>
                        <Grid container spacing={2}>
                          <Grid>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={interest.designSelected}
                                  onChange={(e) => updateInterest(interest.id, 'designSelected', e.target.checked)}
                                  name={`designSelected-${interest.id}`}
                                  sx={{ color: '#1976d2' }}
                                />
                              }
                              label="Design Selected?"
                            />
                          </Grid>
                          <Grid>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={interest.wantsMoreDiscount}
                                  onChange={(e) => updateInterest(interest.id, 'wantsMoreDiscount', e.target.checked)}
                                  name={`wantsMoreDiscount-${interest.id}`}
                                  sx={{ color: '#1976d2' }}
                                />
                              }
                              label="Wants More Discount"
                            />
                          </Grid>
                          <Grid>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={interest.checkingOtherJewellers}
                                  onChange={(e) => updateInterest(interest.id, 'checkingOtherJewellers', e.target.checked)}
                                  name={`checkingOtherJewellers-${interest.id}`}
                                  sx={{ color: '#1976d2' }}
                                />
                              }
                              label="Checking Other Jewellers"
                            />
                          </Grid>
                          <Grid>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={interest.feltLessVariety}
                                  onChange={(e) => updateInterest(interest.id, 'feltLessVariety', e.target.checked)}
                                  name={`feltLessVariety-${interest.id}`}
                                  sx={{ color: '#1976d2' }}
                                />
                              }
                              label="Felt Less Variety"
                            />
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f4f4f' }}>Other Preferences (if any)</Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Other Preferences"
                            value={interest.otherPreferences}
                            onChange={(e) => updateInterest(interest.id, 'otherPreferences', e.target.value)}
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* 6. Follow-up & Summary */}
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Follow-up & Summary</Typography>
                  <Grid container spacing={2}>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Next Follow-up Date</Typography>
                      <TextField
                        fullWidth
                        label="Next Follow-up Date"
                        name="nextFollowUp"
                        type="date"
                        value={formData.nextFollowUp}
                        onChange={e => setFormData(f => ({...f, nextFollowUp: e.target.value}))}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Summary Notes of Visit</Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Summary Notes"
                        name="summaryNotes"
                        value={formData.summaryNotes}
                        onChange={e => setFormData(f => ({...f, summaryNotes: e.target.value}))}
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                  <Button variant="outlined" onClick={() => setShowAddModal(false)} sx={{ color: '#333', borderColor: '#e0e0e0' }}>Cancel</Button>
                  <Button variant="contained" type="submit" disabled={formSubmitting} sx={{ backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' } }}>
                    {formSubmitting ? 'Adding...' : 'Add Customer'}
                  </Button>
                </Box>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {/* Customer List and Team Members */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Customer List */}
          <Grid>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Customer List</Typography>
                  <Chip label={`${customers.length} customers`} sx={{ bgcolor: '#e0f2f7', color: '#007bff' }} />
                </Box>
                
                {dataLoading ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#1976d2' }} />
                    <Typography variant="body2" sx={{ color: '#6c757d' }}>Loading customers...</Typography>
                  </Box>
                ) : customers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body2" sx={{ color: '#6c757d' }}>No customers found</Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 384, overflowY: 'auto' }}>
                    {customers.map((customer) => (
                      <Box key={customer.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 1, '&:hover': { bgcolor: '#f5f5f5' } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>{customer.name || 'N/A'}</Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d' }}>{customer.email || 'No email'}</Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d' }}>{customer.phone || 'No phone'}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip label={customer.customer_type || 'Individual'} sx={{ bgcolor: '#e0f2f7', color: '#007bff' }} />
                              {customer.leadSource && (
                                <Chip label={customer.leadSource} sx={{ bgcolor: '#e0f2f7', color: '#28a745' }} />
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton onClick={() => viewAuditLogs(customer)} sx={{ color: '#6c757d' }}>
                              <AuditIcon />
                            </IconButton>
                            <Link href={`/inhouse-sales/customers/${customer.id}`}>
                              <IconButton sx={{ color: '#1976d2' }}>
                                <ViewIcon />
                              </IconButton>
                            </Link>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Team Members */}
          <Grid>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Team Members</Typography>
                  <Chip label={`${teamMembers.length} members`} sx={{ bgcolor: '#e0f2f7', color: '#007bff' }} />
                </Box>
                
                {dataLoading ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#1976d2' }} />
                    <Typography variant="body2" sx={{ color: '#6c757d' }}>Loading team members...</Typography>
                  </Box>
                ) : teamMembers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body2" sx={{ color: '#6c757d' }}>No team members found</Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 384, overflowY: 'auto' }}>
                    {teamMembers.map((member) => (
                      <Box key={member.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 1, '&:hover': { bgcolor: '#f5f5f5' } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                              {member.first_name || member.username} {member.last_name || ''}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d' }}>{member.email || 'No email'}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip label={member.role || 'User'} sx={{ bgcolor: '#e0f2f7', color: '#007bff' }} />
                              {member.is_active && (
                                <Chip label="Active" sx={{ bgcolor: '#e0f2f7', color: '#28a745' }} />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Audit Log Modal */}
        {showAuditModal && (
          <Dialog open={showAuditModal} onClose={() => setShowAuditModal(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              Audit Logs for {selectedCustomerForAudit?.name || 'Customer'}
              <IconButton onClick={() => setShowAuditModal(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {auditLoading ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#1976d2' }} />
                  <Typography variant="body2" sx={{ color: '#6c757d' }}>Loading audit logs...</Typography>
                </Box>
              ) : auditLogs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body2" sx={{ color: '#6c757d' }}>No audit logs found for this customer</Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 450, overflowY: 'auto' }}>
                  {auditLogs.map((log) => (
                    <Box key={log.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, mb: 2, bgcolor: '#f5f5f5' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Chip label={log.action} sx={{ bgcolor: '#e0f2f7', color: '#1976d2' }} />
                          <Typography variant="body2" sx={{ color: '#6c757d', ml: 1 }}>
                            by {log.user?.first_name || log.user?.username || 'Unknown User'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#6c757d' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        {log.before && (
                          <Grid>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4f4f4f' }}>Before</Typography>
                            <Paper sx={{ p: 2, bgcolor: '#fff', borderRadius: 1 }}>
                              <Typography variant="body2">{formatAuditData(log.before)}</Typography>
                            </Paper>
                          </Grid>
                        )}
                        {log.after && (
                          <Grid>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4f4f4f' }}>After</Typography>
                            <Paper sx={{ p: 2, bgcolor: '#fff', borderRadius: 1 }}>
                              <Typography variant="body2">{formatAuditData(log.after)}</Typography>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAuditModal(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </ThemeProvider>
  );
} 