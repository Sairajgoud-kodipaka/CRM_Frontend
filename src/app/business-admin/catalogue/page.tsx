'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Pagination,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  InputAdornment
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface Product {
  id: number;
  name: string;
  sku: string;
  category_name: string;
  selling_price: number;
  current_price: number;
  quantity: number;
  status: string;
  is_in_stock: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  product_count: number;
  is_active: boolean;
}

interface ProductStats {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
  total_value: number;
  category_count: number;
  recent_products: number;
}

export default function CatalogueManagement() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, debouncedSearchTerm, statusFilter, categoryFilter, stockFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setSearchLoading(true);
      setError('');
      
      console.log('Fetching catalogue data...');
      
      // Build query parameters
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      };
      
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (stockFilter) params.stock = stockFilter;
      
      // Fetch data individually to better handle errors
      const statsData = await productsAPI.getProductStats();
      console.log('Stats data:', statsData);
      setStats(statsData);
      
      const productsData = await productsAPI.getProducts(params);
      console.log('Products data:', productsData);
      console.log('Products data type:', typeof productsData);
      console.log('Products is array:', Array.isArray(productsData));
      
      // Handle different response structures
      let productsArray = [];
      let total = 0;
      
      if (Array.isArray(productsData)) {
        productsArray = productsData;
        total = productsData.length;
      } else if (productsData && Array.isArray(productsData.results)) {
        productsArray = productsData.results;
        total = productsData.count || productsData.results.length;
      } else if (productsData && Array.isArray(productsData.data)) {
        productsArray = productsData.data;
        total = productsData.total || productsData.data.length;
      } else {
        console.warn('Unexpected products response format:', productsData);
        productsArray = [];
        total = 0;
      }
      
      setProducts(productsArray);
      setTotalProducts(total);
      
      // Fetch categories if not already loaded
      if (categories.length === 0) {
        const categoriesData = await productsAPI.getCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
      
    } catch (err: any) {
      console.error('Error fetching catalogue data:', err);
      setError(err.response?.data?.detail || 'Failed to load catalogue data');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await productsAPI.deleteProduct(productId);
      // Refresh the data after deletion
      fetchData();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone and will affect all products in this category.')) {
      return;
    }

    try {
      await productsAPI.deleteCategory(categoryId);
      // Refresh the data after deletion
      fetchData();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'discontinued':
        return 'error';
      case 'out_of_stock':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStockColor = (quantity: number, isInStock: boolean) => {
    if (!isInStock || quantity === 0) {
      return 'error';
    }
    
    if (quantity <= 5) {
      return 'warning';
    }
    
    return 'success';
  };

  const getStockLabel = (quantity: number, isInStock: boolean) => {
    if (!isInStock || quantity === 0) {
      return 'Out of Stock';
    }
    
    if (quantity <= 5) {
      return `Low Stock (${quantity})`;
    }
    
    return `In Stock (${quantity})`;
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(event.target.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
    setStockFilter('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'primary' 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: `${color}.main` }}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                p: 1, 
                borderRadius: 2, 
                bgcolor: `${color}.light`, 
                color: `${color}.main`
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'grey.50' }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={64} />
          <Typography variant="h6" color="text.secondary">
            Loading catalogue...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Error loading catalogue data</Typography>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'grey.50',
      py: { xs: 2, md: 3 },
      px: { xs: 2, md: 3 }
    }}>
      <Container maxWidth="xl" disableGutters>
        {/* Header Section */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 3
          }}>
            <Box>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h1" 
                gutterBottom
                sx={{ fontWeight: 700, color: 'text.primary' }}
              >
                Catalogue Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your product catalog and inventory
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
              <Tooltip title="Refresh data">
                <IconButton onClick={fetchData} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/business-admin/catalogue/create')}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minWidth: 'fit-content'
                }}
              >
                Add Product
              </Button>
            </Stack>
          </Box>
          
          {/* Mobile Action Buttons */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => router.push('/business-admin/catalogue/create')}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {/* Catalogue Stats */}
        {stats && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Total Products"
                value={stats.total_products}
                subtitle={`${stats.active_products} active, ${stats.out_of_stock} out of stock`}
                icon={<InventoryIcon />}
                color="primary"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Active Listings"
                value={stats.active_products}
                subtitle={`${stats.recent_products} added this month`}
                icon={<TrendingUpIcon />}
                color="success"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Categories"
                value={stats.category_count}
                subtitle={`${stats.low_stock} products low on stock`}
                icon={<CategoryIcon />}
                color="info"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Total Value"
                value={formatCurrency(stats.total_value)}
                subtitle="Inventory value"
                icon={<MoneyIcon />}
                color="warning"
              />
            </Box>
          </Box>
        )}

        {/* Product Categories */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 3
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Product Categories
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/business-admin/catalogue/categories/create')}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minWidth: 'fit-content'
                }}
              >
                Add Category
              </Button>
            </Box>
            
            {categories.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {categories.map((category) => (
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }} key={category.id}>
                    <Fade in={true}>
                      <Card elevation={1} sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {category.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {category.description || 'No description'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                {category.product_count} products
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View category">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => router.push(`/business-admin/catalogue/categories/${category.id}`)}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit category">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => router.push(`/business-admin/catalogue/categories/${category.id}/edit`)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete category">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteCategory(category.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No product categories
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Create categories to organize your products
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* All Products */}
        <Card elevation={2}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 3
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                All Products ({totalProducts})
              </Typography>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => router.push('/business-admin/catalogue/create')}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minWidth: 'fit-content'
                }}
              >
                Add Product
              </Button>
            </Box>
            
            {/* Filters */}
            <Card elevation={0} sx={{ bgcolor: 'grey.50', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <TextField
                      fullWidth
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                        endAdornment: searchLoading && (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="discontinued">Discontinued</MenuItem>
                        <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={categoryFilter}
                        label="Category"
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <FormControl fullWidth>
                      <InputLabel>Stock</InputLabel>
                      <Select
                        value={stockFilter}
                        label="Stock"
                        onChange={(e) => setStockFilter(e.target.value)}
                      >
                        <MenuItem value="">All Stock</MenuItem>
                        <MenuItem value="low">Low Stock</MenuItem>
                        <MenuItem value="out">Out of Stock</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                {/* Active Filters */}
                {(searchTerm || statusFilter || categoryFilter || stockFilter) && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        Active filters:
                      </Typography>
                      {searchTerm && (
                        <Chip label={`Search: ${searchTerm}`} color="primary" size="small" />
                      )}
                      {statusFilter && (
                        <Chip label={`Status: ${statusFilter}`} color="success" size="small" />
                      )}
                      {categoryFilter && (
                        <Chip 
                          label={`Category: ${categories.find(c => c.id.toString() === categoryFilter)?.name || categoryFilter}`} 
                          color="secondary" 
                          size="small" 
                        />
                      )}
                      {stockFilter && (
                        <Chip label={`Stock: ${stockFilter}`} color="warning" size="small" />
                      )}
                    </Stack>
                    <Button onClick={clearFilters} size="small">
                      Clear all filters
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            {/* Products Table */}
            {searchLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading products...
                </Typography>
              </Box>
            ) : products.length > 0 ? (
              <>
                <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((product) => (
                        <Fade in={true} key={product.id}>
                          <TableRow hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {product.sku}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {product.category_name || 'Uncategorized'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatCurrency(product.current_price)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStockLabel(product.quantity, product.is_in_stock)}
                                color={getStockColor(product.quantity, product.is_in_stock) as any}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={product.status}
                                color={getStatusColor(product.status) as any}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="View product">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => router.push(`/business-admin/catalogue/${product.id}`)}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit product">
                                  <IconButton
                                    size="small"
                                    color="info"
                                    onClick={() => router.push(`/business-admin/catalogue/${product.id}/edit`)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete product">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        </Fade>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FormControl size="small">
                        <Select
                          value={pageSize}
                          onChange={handlePageSizeChange}
                          sx={{ minWidth: 80 }}
                        >
                          <MenuItem value={25}>25</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                          <MenuItem value={200}>200</MenuItem>
                        </Select>
                      </FormControl>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No products found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {searchTerm || statusFilter || categoryFilter || stockFilter 
                    ? 'Try adjusting your filters' 
                    : 'Add your first product to get started'
                  }
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 