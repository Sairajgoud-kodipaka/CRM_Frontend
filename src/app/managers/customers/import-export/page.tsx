'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { customersAPI } from '@/lib/api';
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
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  FileDownload as FileDownloadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

// Create a theme for import/export page
const importExportTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
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
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

export default function ManagerCustomerImportExport() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check if user has access
  if (!loading && (!user || !['business_admin', 'manager'].includes(user.role))) {
    router.replace('/manager/import-export');
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResults(null);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
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
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
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
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    setIsImporting(true);
    try {
      const result = await customersAPI.importCustomersCSV(selectedFile);
      setImportResults(result);
      toast.success(`Import completed! ${result.imported_count} customers imported successfully.`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to import CSV file';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportJSON = async () => {
    if (!selectedFile) {
      toast.error('Please select a JSON file first');
      return;
    }

    setIsImporting(true);
    try {
      const result = await customersAPI.importCustomersJSON(selectedFile);
      setImportResults(result);
      toast.success(`Import completed! ${result.imported_count} customers imported successfully.`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to import JSON file';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await customersAPI.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customer_import_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  return (
    <ThemeProvider theme={importExportTheme}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
            Customer Import/Export
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Import and export customer data in CSV or JSON format
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Export Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CloudDownloadIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Export Customers
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Export all customers from your database to CSV or JSON format.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    sx={{ minWidth: 'fit-content' }}
                  >
                    {isExporting ? 'Exporting...' : 'Export as CSV'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportJSON}
                    disabled={isExporting}
                    color="success"
                    sx={{ minWidth: 'fit-content' }}
                  >
                    {isExporting ? 'Exporting...' : 'Export as JSON'}
                  </Button>
                </Box>
                {isExporting && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Import Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CloudUploadIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Import Customers
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Import customers from a CSV or JSON file. Make sure your file follows the correct format.
                </Typography>
                
                {/* Template Download */}
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleDownloadTemplate}
                    sx={{ mb: 1 }}
                  >
                    Download CSV Template
                  </Button>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Use this template to ensure your CSV file has the correct format
                  </Typography>
                </Box>

                {/* File Upload */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Select File
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Choose File
                    </Button>
                  </label>
                  {selectedFile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Import Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={handleImportCSV}
                    disabled={!selectedFile || isImporting || !selectedFile.name.endsWith('.csv')}
                    sx={{ minWidth: 'fit-content' }}
                  >
                    {isImporting ? 'Importing...' : 'Import CSV'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={handleImportJSON}
                    disabled={!selectedFile || isImporting || !selectedFile.name.endsWith('.json')}
                    color="success"
                    sx={{ minWidth: 'fit-content' }}
                  >
                    {isImporting ? 'Importing...' : 'Import JSON'}
                  </Button>
                </Box>
                {isImporting && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Import Results */}
          {importResults && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Import Results
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {importResults.message}
                  </Alert>
                  <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                    Successfully imported: {importResults.imported_count} customers
                  </Typography>
                  {importResults.errors && importResults.errors.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="error" sx={{ fontWeight: 600, mb: 1 }}>
                        Errors:
                      </Typography>
                      <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                        {importResults.errors.map((error: string, index: number) => (
                          <Typography key={index} variant="body2" color="error" sx={{ mb: 0.5 }}>
                            • {error}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Instructions */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'info.50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <InfoIcon sx={{ mr: 2, color: 'info.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                    Instructions
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'info.main' }}>
                      Export:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="CSV format includes all customer fields in a spreadsheet format"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="JSON format includes all customer data in structured format"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Files are automatically downloaded to your device"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'info.main' }}>
                      Import:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Download the CSV template to see the required format"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Email field is required for all customers"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Duplicate emails will be skipped"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Date fields should be in YYYY-MM-DD format"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Tags should be comma-separated values"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
                  Required Fields:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  email (required), first_name, last_name, phone, customer_type, address, city, state, country, postal_code, date_of_birth, anniversary_date, preferred_metal, preferred_stone, ring_size, budget_range, lead_source, notes, community, mother_tongue, reason_for_visit, age_of_end_user, saving_scheme, catchment_area, next_follow_up, summary_notes, status, tags
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
} 