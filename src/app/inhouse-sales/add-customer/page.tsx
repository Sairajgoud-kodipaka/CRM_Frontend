'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { customersAPI, usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
  Divider,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Fade
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Diamond as DiamondIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { FlexGrid } from '@/components/ui/FlexGrid';

interface ProductEntry {
  product: string;
  revenue: string;
}
interface Interest {
  mainCategory: string;
  products: ProductEntry[];
  preferences: {
    designSelected: boolean;
    wantsDiscount: boolean;
    checkingOthers: boolean;
    lessVariety: boolean;
  };
  other: string;
}

export default function InhouseSalesAddCustomer() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    // Additional jewelry-specific fields
    preferred_metal: '',
    preferred_stone: '',
    ring_size: '',
    budget_range: '',
    assigned_to: '',
    // New fields for Demographics & Visit
    community: '',
    leadSource: '',
    reasonForVisit: '',
    ageOfEndUser: '',
    nextFollowUp: '',
    summaryNotes: '',
    catchment_area: '',
    mother_tongue: '',
    saving_scheme: '',
  });

  // Customer Interests state
  const [interests, setInterests] = useState<Interest[]>([
    {
      mainCategory: '',
      products: [],
      preferences: {
        designSelected: false,
        wantsDiscount: false,
        checkingOthers: false,
        lessVariety: false,
      },
      other: '',
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  interface ProductOption {
    id: number;
    name: string;
    category: number;
  }
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');

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

  useEffect(() => {
    const fetchData = async () => {
      setCategoriesLoading(true);
      setProductsLoading(true);
      
      const token = localStorage.getItem('access_token');
      
      try {
        // Fetch categories
        const categoriesResponse = await fetch('http://localhost:8000/api/products/categories/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!categoriesResponse.ok) {
          throw new Error(`Categories API failed: ${categoriesResponse.status}`);
        }
        
        const categoriesData = await categoriesResponse.json();
        const categoriesArray = Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || []);
        console.log('Categories loaded:', categoriesArray);
        setCategories(categoriesArray);
        
        // Fetch products
        const productsResponse = await fetch('http://localhost:8000/api/products/list/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!productsResponse.ok) {
          throw new Error(`Products API failed: ${productsResponse.status}`);
        }
        
        const productsData = await productsResponse.json();
        const productsArray = Array.isArray(productsData) ? productsData : (productsData.results || []);
        console.log('Products loaded:', productsArray);
        
        // Process products
        const processedProducts = productsArray.map((prod: any) => ({
          id: prod.id,
          name: prod.name,
          category: prod.category // This should now be the category ID directly
        }));
        console.log('Processed products:', processedProducts);
        setProducts(processedProducts);
        
        // Debug: Check for Gold category and products
        const goldCategory = categoriesArray.find((cat: any) => cat.name === 'Gold');
        console.log('Gold category found:', goldCategory);
        
        if (goldCategory) {
          const goldProducts = processedProducts.filter((prod: any) => prod.category === goldCategory.id);
          console.log('Gold products found:', goldProducts);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        setCategoriesError('Failed to load categories');
        setProductsError('Failed to load products');
      } finally {
        setCategoriesLoading(false);
        setProductsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Customer Interests handlers
  const handleInterestChange = (idx: number, field: string, value: string) => {
    setInterests((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, [field]: value }
          : item
      )
    );
  };
  const handleAddInterest = () => {
    setInterests((prev) => [
      ...prev,
      {
        mainCategory: '',
        products: [],
        preferences: {
          designSelected: false,
          wantsDiscount: false,
          checkingOthers: false,
          lessVariety: false,
        },
        other: '',
      },
    ]);
  };
  const handleRemoveInterest = (idx: number) => {
    setInterests((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handler to add a product entry to an interest
  const handleAddProductToInterest = (idx: number) => {
    setInterests(prev =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, products: [...(item.products || []), { product: '', revenue: '' }] }
          : item
      )
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== CUSTOMER FORM SUBMISSION START ===');
    console.log('Form validation result:', validateForm());
    
    if (validateForm()) {
      setLoading(true);
      try {
        // Prepare data with interests
        const customerData = {
          ...formData,
          customer_interests: interests
        };
        
        // Clean the data - remove empty strings and convert to null
        const cleanedData = Object.fromEntries(
          Object.entries(customerData).map(([key, value]) => [
            key, 
            value === '' ? null : value
          ])
        );
        
        console.log('Cleaned data:', cleanedData);
        
        console.log('=== FRONTEND DATA BEING SENT ===');
        console.log('Form Data:', formData);
        console.log('Interests:', interests);
        console.log('Combined Customer Data:', customerData);
        console.log('API Endpoint: /api/clients/clients/');
        console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');
        
        // Check authentication
        const token = localStorage.getItem('access_token');
        console.log('Auth token exists:', !!token);
        if (token) {
          console.log('Token preview:', token.substring(0, 50) + '...');
        }
        
        // Test if Django server is running
        try {
          const testResponse = await fetch('http://localhost:8000/api/');
          console.log('Django server test response:', testResponse.status);
        } catch (testError) {
          console.error('Django server test failed:', testError);
        }
        
        // Test the clients endpoint
        try {
          const testClientResponse = await fetch('http://localhost:8000/api/clients/clients/test/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({test: 'data'})
          });
          const testData = await testClientResponse.json();
          console.log('Test client endpoint response:', testData);
        } catch (testError) {
          console.error('Test client endpoint failed:', testError);
        }
        
        const response = await customersAPI.createCustomer(cleanedData);
        console.log('=== API RESPONSE SUCCESS ===');
        console.log('Response:', response);
        
        toast.success('Customer added successfully!');
        router.push('/inhouse-sales/customers');
      } catch (error: any) {
        console.log('=== API ERROR DETAILS ===');
        console.error('Error object:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           error.message || 
                           'Failed to add customer. Please try again.';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        console.log('=== CUSTOMER FORM SUBMISSION END ===');
      }
    } else {
      console.log('Form validation failed');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in={true} timeout={800}>
        <Box>
        {/* Header */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                  <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                    Add New Customer
                  </Typography>
                </Stack>
                <Typography variant="body1" color="text.secondary">
                  Create a comprehensive customer profile for jewelry sales
                </Typography>
              </Box>
              <Button
                component={Link}
              href="/inhouse-sales/customers"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{ minWidth: 150 }}
            >
              Back to Customers
              </Button>
            </Stack>
          </Paper>

        {/* Form */}
          <form onSubmit={handleSubmit}>
          {/* 1. Customer Details */}
            <Card sx={{ mb: 4 }}>
              <CardHeader 
                title="Customer Details" 
                avatar={<PersonIcon />}
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
              />
              <CardContent>
                <FlexGrid container spacing={3}>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      placeholder="Enter customer's full name"
                      required
                    />
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      placeholder="+91 98XXXXXXXX"
                      required
                    />
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      placeholder="e.g., priya.sharma@example.com"
                      required
                    />
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Assigned Salesperson *</InputLabel>
                      <Select
                  name="assigned_to"
                  value={formData.assigned_to}
                        onChange={handleSelectChange}
                        label="Assigned Salesperson *"
                  disabled={usersLoading}
                >
                        <MenuItem value="">
                          <em>Select salesperson</em>
                        </MenuItem>
                  {users.map((user: any) => (
                          <MenuItem key={user.id} value={user.id}>
                      {user.first_name || user.username} {user.last_name || ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Birth Date"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Anniversary Date"
                      name="anniversary_date"
                      type="date"
                      value={formData.anniversary_date}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Customer Type</InputLabel>
                      <Select
                        name="customer_type"
                        value={formData.customer_type}
                        onChange={handleSelectChange}
                        label="Customer Type"
                      >
                        <MenuItem value="individual">Individual</MenuItem>
                        <MenuItem value="business">Business</MenuItem>
                        <MenuItem value="wholesale">Wholesale</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                </FlexGrid>
              </CardContent>
            </Card>

          {/* 2. Address */}
            <Card sx={{ mb: 4 }}>
              <CardHeader 
                title="Address Information" 
                avatar={<HomeIcon />}
                sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
              />
              <CardContent>
                <FlexGrid container spacing={3}>
                  <FlexGrid xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g., 123, Diamond Lane"
                    />
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g., Mumbai"
                    />
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Select State"
                    />
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="India"
                    />
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Catchment Area"
                      name="catchment_area"
                      value={formData.catchment_area || ''}
                      onChange={handleChange}
                      placeholder="e.g., South Mumbai, Bandra West"
                    />
                  </FlexGrid>
                </FlexGrid>
              </CardContent>
            </Card>

            {/* 3. Jewelry Preferences */}
            <Card sx={{ mb: 4 }}>
              <CardHeader 
                title="Jewelry Preferences" 
                avatar={<DiamondIcon />}
                sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}
              />
              <CardContent>
                <FlexGrid container spacing={3}>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Preferred Metal</InputLabel>
                      <Select
                  name="preferred_metal"
                  value={formData.preferred_metal}
                        onChange={handleSelectChange}
                        label="Preferred Metal"
                      >
                        <MenuItem value="">
                          <em>Select metal preference</em>
                        </MenuItem>
                        <MenuItem value="gold">Gold</MenuItem>
                        <MenuItem value="silver">Silver</MenuItem>
                        <MenuItem value="platinum">Platinum</MenuItem>
                        <MenuItem value="palladium">Palladium</MenuItem>
                        <MenuItem value="rose_gold">Rose Gold</MenuItem>
                        <MenuItem value="white_gold">White Gold</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Preferred Stone</InputLabel>
                      <Select
                  name="preferred_stone"
                  value={formData.preferred_stone}
                        onChange={handleSelectChange}
                        label="Preferred Stone"
                      >
                        <MenuItem value="">
                          <em>Select stone preference</em>
                        </MenuItem>
                        <MenuItem value="diamond">Diamond</MenuItem>
                        <MenuItem value="ruby">Ruby</MenuItem>
                        <MenuItem value="emerald">Emerald</MenuItem>
                        <MenuItem value="sapphire">Sapphire</MenuItem>
                        <MenuItem value="pearl">Pearl</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Ring Size</InputLabel>
                      <Select
                  name="ring_size"
                  value={formData.ring_size}
                        onChange={handleSelectChange}
                        label="Ring Size"
                      >
                        <MenuItem value="">
                          <em>Select ring size</em>
                        </MenuItem>
                        {['3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'].map((size) => (
                          <MenuItem key={size} value={size}>{size}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Budget Range</InputLabel>
                      <Select
                  name="budget_range"
                  value={formData.budget_range}
                        onChange={handleSelectChange}
                        label="Budget Range"
                      >
                        <MenuItem value="">
                          <em>Select budget range</em>
                        </MenuItem>
                        <MenuItem value="under_1000">Under $1,000</MenuItem>
                        <MenuItem value="1000_5000">$1,000 - $5,000</MenuItem>
                        <MenuItem value="5000_10000">$5,000 - $10,000</MenuItem>
                        <MenuItem value="10000_25000">$10,000 - $25,000</MenuItem>
                        <MenuItem value="25000_50000">$25,000 - $50,000</MenuItem>
                        <MenuItem value="over_50000">Over $50,000</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                </FlexGrid>
              </CardContent>
            </Card>

            {/* 4. Demographics & Visit */}
            <Card sx={{ mb: 4 }}>
              <CardHeader 
                title="Demographics & Visit" 
                avatar={<PeopleIcon />}
                sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
              />
              <CardContent>
                <FlexGrid container spacing={3}>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Community</InputLabel>
                      <Select
                        name="community"
                        value={formData.community}
                        onChange={handleSelectChange}
                        label="Community"
                      >
                        <MenuItem value="">
                          <em>Select Community</em>
                        </MenuItem>
                        <MenuItem value="Hindu">Hindu</MenuItem>
                        <MenuItem value="Muslim">Muslim</MenuItem>
                        <MenuItem value="Jain">Jain</MenuItem>
                        <MenuItem value="Parsi">Parsi</MenuItem>
                        <MenuItem value="Buddhist">Buddhist</MenuItem>
                        <MenuItem value="Cross Community">Cross Community</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mother Tongue / Sub-community"
                      name="mother_tongue"
                      value={formData.mother_tongue || ''}
                  onChange={handleChange}
                      placeholder="e.g., Gujarati, Marwari Jain"
                    />
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Reason for Visit</InputLabel>
                      <Select
                        name="reasonForVisit"
                        value={formData.reasonForVisit}
                        onChange={handleSelectChange}
                        label="Reason for Visit"
                      >
                        <MenuItem value="">
                          <em>Select Reason</em>
                        </MenuItem>
                        <MenuItem value="Wedding">Wedding</MenuItem>
                        <MenuItem value="Gifting">Gifting</MenuItem>
                        <MenuItem value="Self-purchase">Self-purchase</MenuItem>
                        <MenuItem value="Repair">Repair</MenuItem>
                        <MenuItem value="Browse">Browse</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Lead Source</InputLabel>
                      <Select
                        name="leadSource"
                        value={formData.leadSource}
                        onChange={handleSelectChange}
                        label="Lead Source"
                      >
                        <MenuItem value="">
                          <em>Select Source</em>
                        </MenuItem>
                        <MenuItem value="Instagram">Instagram</MenuItem>
                        <MenuItem value="Facebook">Facebook</MenuItem>
                        <MenuItem value="Google">Google</MenuItem>
                        <MenuItem value="Referral">Referral</MenuItem>
                        <MenuItem value="Walk-in">Walk-in</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Age of End-User</InputLabel>
                      <Select
                        name="ageOfEndUser"
                        value={formData.ageOfEndUser}
                        onChange={handleSelectChange}
                        label="Age of End-User"
                      >
                        <MenuItem value="">
                          <em>Select Age Group</em>
                        </MenuItem>
                        <MenuItem value="Under 18">Under 18</MenuItem>
                        <MenuItem value="18-25">18-25</MenuItem>
                        <MenuItem value="26-35">26-35</MenuItem>
                        <MenuItem value="36-45">36-45</MenuItem>
                        <MenuItem value="46-55">46-55</MenuItem>
                        <MenuItem value="56-65">56-65</MenuItem>
                        <MenuItem value="65+">65+</MenuItem>
                        <MenuItem value="All/Family">All/Family</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Monthly Saving Scheme</InputLabel>
                      <Select
                        name="saving_scheme"
                        value={formData.saving_scheme || ''}
                        onChange={handleSelectChange}
                        label="Monthly Saving Scheme"
                      >
                        <MenuItem value="">
                          <em>Select Status</em>
                        </MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                </FlexGrid>
              </CardContent>
            </Card>

            {/* 5. Customer Interests */}
            <Card sx={{ mb: 4 }}>
              <CardHeader 
                title="Customer Interests" 
                avatar={<DiamondIcon />}
                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                action={
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                  onClick={() => {
                    console.log('=== DEBUG INFO ===');
                    console.log('Categories:', categories);
                    console.log('Products:', products);
                    console.log('Categories Loading:', categoriesLoading);
                    console.log('Products Loading:', productsLoading);
                    console.log('Categories Error:', categoriesError);
                    console.log('Products Error:', productsError);
                    
                    // Test Gold category specifically
                    const goldCat = categories.find(c => c.name === 'Gold');
                    console.log('Gold category:', goldCat);
                    if (goldCat) {
                      const goldProds = products.filter(p => Number(p.category) === Number(goldCat.id));
                      console.log('Gold products:', goldProds);
                    }
                  }} 
                >
                  Debug
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddInterest}
                      size="small"
                    >
                      Add Interest
                    </Button>
                  </Stack>
                }
              />
              <CardContent>
                {/* Debug display */}
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Categories loaded:</strong> {categories.length} | 
                    <strong> Products loaded:</strong> {products.length} | 
                    <strong> Gold category:</strong> {categories.find(c => c.name === 'Gold')?.id || 'Not found'} | 
                    <strong> Gold products:</strong> {products.filter(p => Number(p.category) === Number(categories.find(c => c.name === 'Gold')?.id || 0)).length}
                  </Typography>
                </Alert>
                <Divider sx={{ mb: 3 }} />
            {interests.map((item, idx) => (
                  <Paper key={idx} sx={{ p: 3, mb: 3, border: 1, borderColor: 'primary.light', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" color="primary.dark">
                        Interest Item #{idx + 1}
                      </Typography>
                      {interests.length > 1 && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveInterest(idx)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                    
                    <FlexGrid container spacing={2}>
                      <FlexGrid xs={12}>
                        <FormControl fullWidth required>
                          <InputLabel>Main Category</InputLabel>
                          <Select
                    value={item.mainCategory}
                    onChange={e => handleInterestChange(idx, 'mainCategory', e.target.value)}
                            label="Main Category"
                    disabled={categoriesLoading}
                  >
                            <MenuItem value="">
                              <em>{categoriesLoading ? 'Loading...' : 'Select Category'}</em>
                            </MenuItem>
                    {categories.map(cat => (
                              <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                            ))}
                          </Select>
                          {categoriesError && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                              {categoriesError}
                            </Alert>
                          )}
                        </FormControl>
                      </FlexGrid>
                      
                {item.mainCategory && (
                        <FlexGrid xs={12}>
                          <Stack spacing={2}>
                    {(item.products || []).map((prodEntry, prodIdx) => (
                              <FlexGrid container spacing={2} key={prodIdx}>
                                <FlexGrid xs={12} md={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Product</InputLabel>
                                    <Select
                            value={prodEntry.product}
                            onChange={e => {
                              const value = e.target.value;
                              setInterests(prev =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        products: it.products.map((p, pi) =>
                                          pi === prodIdx ? { ...p, product: value } : p
                                        ),
                                      }
                                    : it
                                )
                              );
                            }}
                                      label="Product"
                            disabled={productsLoading}
                          >
                                      <MenuItem value="">
                                        <em>{productsLoading ? 'Loading products...' : 'Select Product'}</em>
                                      </MenuItem>
                            {(() => {
                              if (productsLoading) {
                                          return <MenuItem value="">Loading...</MenuItem>;
                              }
                              
                              const cat = categories.find(c => c.name === item.mainCategory);
                                                          const filteredProducts = products.filter(prod => {
                              const productCategoryId = Number(prod.category);
                              const categoryId = Number(cat?.id);
                                          return cat && productCategoryId === categoryId;
                                        });
                                        
                                        if (filteredProducts.length === 0) {
                                          return [
                                            <MenuItem key="no-products" value="">No products found for "{item.mainCategory}"</MenuItem>,
                                            <MenuItem key="other" value="other">Other (not listed)</MenuItem>
                                          ];
                              }
                              
                              return filteredProducts.map(prod => (
                                          <MenuItem key={prod.id} value={prod.name}>{prod.name}</MenuItem>
                              ));
                            })()}
                                    </Select>
                                  </FormControl>
                                </FlexGrid>
                                <FlexGrid xs={12} md={6}>
                                  <TextField
                                    fullWidth
                                    label="Revenue Opportunity (₹)"
                            type="number"
                            value={prodEntry.revenue}
                            onChange={e => {
                              const value = e.target.value;
                              setInterests(prev =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        products: it.products.map((p, pi) =>
                                          pi === prodIdx ? { ...p, revenue: value } : p
                                        ),
                                      }
                                    : it
                                )
                              );
                            }}
                                    placeholder="Enter amount"
                          />
                                </FlexGrid>
                              </FlexGrid>
                    ))}
                            <Button
                              variant="text"
                              startIcon={<AddIcon />}
                      onClick={() => handleAddProductToInterest(idx)}
                              sx={{ alignSelf: 'flex-start' }}
                            >
                              Add Product to this Interest
                            </Button>
                          </Stack>
                        </FlexGrid>
                      )}
                      
                      <FlexGrid xs={12}>
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle1" fontWeight={600} mb={1}>
                            Customer Preferences
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Stack spacing={1}>
                            <FormControlLabel
                              control={
                                <Checkbox 
                                  checked={item.preferences.designSelected}
                                  onChange={e => handleInterestChange(idx, 'preferences.designSelected', e.target.checked ? 'true' : 'false')}
                                />
                              }
                              label="Design Selected?"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox 
                                  checked={item.preferences.wantsDiscount}
                                  onChange={e => handleInterestChange(idx, 'preferences.wantsDiscount', e.target.checked ? 'true' : 'false')}
                                />
                              }
                              label="Wants More Discount"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox 
                                  checked={item.preferences.checkingOthers}
                                  onChange={e => handleInterestChange(idx, 'preferences.checkingOthers', e.target.checked ? 'true' : 'false')}
                                />
                              }
                              label="Checking Other Jewellers"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox 
                                  checked={item.preferences.lessVariety}
                                  onChange={e => handleInterestChange(idx, 'preferences.lessVariety', e.target.checked ? 'true' : 'false')}
                                />
                              }
                              label="Felt Less Variety"
                            />
                          </Stack>
                          <TextField
                            fullWidth
                            label="Other Preferences (if any)"
                            value={item.other}
                            onChange={e => handleInterestChange(idx, 'other', e.target.value)}
                            placeholder="e.g., Specific customization request"
                            sx={{ mt: 2 }}
                          />
                        </Paper>
                      </FlexGrid>
                    </FlexGrid>
                  </Paper>
                ))}
              </CardContent>
            </Card>

            {/* 6. Follow-up & Summary */}
            <Card sx={{ mb: 4 }}>
              <CardHeader 
                title="Follow-up & Summary" 
                avatar={<AssignmentIcon />}
                sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
              />
              <CardContent>
                <FlexGrid container spacing={3}>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Next Follow-up Date"
                      name="nextFollowUp"
                      type="date"
                      value={formData.nextFollowUp || ''}
                      onChange={handleChange}
                      error={!!errors.nextFollowUp}
                      helperText={errors.nextFollowUp}
                      InputLabelProps={{ shrink: true }}
                    />
                  </FlexGrid>
                  <FlexGrid xs={12}>
                    <TextField
                      fullWidth
                      label="Summary Notes of Visit"
                      name="summaryNotes"
                      multiline
                      rows={4}
                      value={formData.summaryNotes || ''}
                      onChange={handleChange}
                      error={!!errors.summaryNotes}
                      helperText={errors.summaryNotes}
                      placeholder="Key discussion points, items shown, next steps..."
                    />
                  </FlexGrid>
                </FlexGrid>
              </CardContent>
            </Card>

          {/* Form Actions */}
            <Divider sx={{ my: 4 }} />
            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ pt: 2 }}>
              <Button
                component={Link}
                href="/inhouse-sales/customers"
                variant="outlined"
                size="large"
                sx={{ minWidth: 120 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ minWidth: 200 }}
              >
                {loading ? 'Adding Customer...' : 'Add Customer & Visit Log'}
              </Button>
            </Stack>
        </form>
        </Box>
      </Fade>
    </Container>
  );
} 