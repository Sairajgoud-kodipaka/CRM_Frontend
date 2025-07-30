'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { customersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  FileDownload as FileDownloadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { businessAdminTheme } from '@/lib/theme';

export default function CustomerImportExport() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check if user has access
  if (!loading && (!user || !['business_admin', 'manager'].includes(user.role))) {
    router.replace('/login');
    return null;
  }

  if (loading) {
    return (
      <ThemeProvider theme={businessAdminTheme}>
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
          <LinearProgress sx={{ width: '200px' }} />
        </Box>
      </ThemeProvider>
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
    <ThemeProvider theme={businessAdminTheme}>
      <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h4" gutterBottom>
              Customer Import/Export
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Import and export customer data in CSV or JSON format
            </Typography>
          </Box>

      {/* Export Section */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Export Customers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Export all customers from your database to CSV or JSON format.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              disabled={isExporting}
                  sx={{ minWidth: 150 }}
            >
              {isExporting ? 'Exporting...' : 'Export as CSV'}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<DownloadIcon />}
              onClick={handleExportJSON}
              disabled={isExporting}
                  sx={{ minWidth: 150 }}
            >
              {isExporting ? 'Exporting...' : 'Export as JSON'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

      {/* Import Section */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Import Customers
              </Typography>
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
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
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
                      sx={{ mb: 1 }}
                    >
                      Choose File
                    </Button>
                  </label>
              {selectedFile && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        icon={<DescriptionIcon />}
                        label={`${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                onClick={handleImportCSV}
                disabled={!selectedFile || isImporting || !selectedFile.name.endsWith('.csv')}
                    sx={{ minWidth: 150 }}
              >
                {isImporting ? 'Importing...' : 'Import CSV'}
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<UploadIcon />}
                onClick={handleImportJSON}
                disabled={!selectedFile || isImporting || !selectedFile.name.endsWith('.json')}
                    sx={{ minWidth: 150 }}
              >
                {isImporting ? 'Importing...' : 'Import JSON'}
                  </Button>
                </Stack>
              </Stack>

          {/* Import Results */}
          {importResults && (
                <Paper sx={{ p: 2, mt: 3, backgroundColor: 'background.default' }}>
                  <Typography variant="h6" gutterBottom>
                    Import Results
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {importResults.message}
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <AlertTitle>Success</AlertTitle>
                Successfully imported: {importResults.imported_count} customers
                  </Alert>
              {importResults.errors && importResults.errors.length > 0 && (
                    <Alert severity="error">
                      <AlertTitle>Errors</AlertTitle>
                      <List dense>
                    {importResults.errors.map((error: string, index: number) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemText primary={error} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}
                </Paper>
              )}
            </CardContent>
          </Card>

      {/* Instructions */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Instructions
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
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
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="h6" gutterBottom>
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
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Required Fields:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    email (required), first_name, last_name, phone, customer_type, address, city, state, country, postal_code, date_of_birth, anniversary_date, preferred_metal, preferred_stone, ring_size, budget_range, lead_source, notes, community, mother_tongue, reason_for_visit, age_of_end_user, saving_scheme, catchment_area, next_follow_up, summary_notes, status, tags
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </ThemeProvider>
  );
} 