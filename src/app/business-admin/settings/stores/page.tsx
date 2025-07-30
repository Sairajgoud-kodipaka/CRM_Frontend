"use client";

import { useEffect, useState } from "react";
import { storesAPI } from "@/lib/api";
import { usersAPI } from "@/lib/api";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip
} from "@mui/material";
import { Edit as EditIcon, Block as BlockIcon } from "@mui/icons-material";

export default function SettingsStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editStore, setEditStore] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deactivateStore, setDeactivateStore] = useState<any | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await storesAPI.getStores();
      setStores(Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []));
    } catch (err: any) {
      setError("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, []);

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

  // Edit logic
  const openEdit = (store: any) => {
    setEditStore(store);
    setForm({ ...store });
    setFormError(null);
    setShowEditModal(true);
  };
  const closeEdit = () => {
    setShowEditModal(false);
    setEditStore(null);
    setForm({});
    setFormError(null);
  };
  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await storesAPI.updateStore(editStore.id, { ...editStore, ...form });
      closeEdit();
      fetchStores();
    } catch (err: any) {
      setFormError("Failed to update store");
    } finally {
      setSaving(false);
    }
  };

  // Deactivate logic
  const openDeactivate = (store: any) => {
    setDeactivateStore(store);
    setShowDeactivateConfirm(true);
  };
  const closeDeactivate = () => {
    setDeactivateStore(null);
    setShowDeactivateConfirm(false);
  };
  const handleDeactivate = async () => {
    if (!deactivateStore) return;
    setSaving(true);
    try {
      await storesAPI.updateStore(deactivateStore.id, { is_active: false });
      closeDeactivate();
      fetchStores();
    } catch (err: any) {
      setError("Failed to deactivate store");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        Store Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your stores/outlets, assign managers, and configure store details here.
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(stores) && stores.length > 0 ? (
                stores.map((store: any) => (
                  <TableRow key={store.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{store.name}</TableCell>
                    <TableCell>{store.code}</TableCell>
                    <TableCell>{store.city}</TableCell>
                    <TableCell>{store.state}</TableCell>
                    <TableCell>{store.manager || "-"}</TableCell>
                    <TableCell>
                      <Chip 
                        label={store.is_active ? "Yes" : "No"} 
                        color={store.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => openEdit(store)}
                          sx={{ minWidth: 'auto' }}
                        >
                          Edit
                        </Button>
                        {store.is_active && (
                          <Button
                            size="small"
                            startIcon={<BlockIcon />}
                            onClick={() => openDeactivate(store)}
                            color="error"
                            sx={{ minWidth: 'auto' }}
                          >
                            Deactivate
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No stores found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Store</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                name="name"
                label="Name"
                value={form.name || ''}
                onChange={handleEditChange}
                fullWidth
                required
              />
              <TextField
                name="code"
                label="Code"
                value={form.code || ''}
                onChange={handleEditChange}
                fullWidth
                required
              />
              <TextField
                name="address"
                label="Address"
                value={form.address || ''}
                onChange={handleEditChange}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                name="city"
                label="City"
                value={form.city || ''}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                name="state"
                label="State"
                value={form.state || ''}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                name="timezone"
                label="Timezone"
                value={form.timezone || 'Asia/Kolkata'}
                onChange={handleEditChange}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Select
                  name="manager"
                  value={form.manager || ''}
                  onChange={handleEditChange}
                  disabled={usersLoading}
                  label="Manager"
                >
                  <MenuItem value="">
                    <em>Select a manager</em>
                  </MenuItem>
                  {users.map((user: any) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.full_name || user.username} (ID: {user.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formError && (
                <Alert severity="error">
                  {formError}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEdit}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Deactivate Confirmation */}
      <Dialog open={showDeactivateConfirm} onClose={closeDeactivate} maxWidth="sm">
        <DialogTitle>Deactivate Store</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate <strong>{deactivateStore?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeactivate}>Cancel</Button>
          <Button 
            onClick={handleDeactivate} 
            disabled={saving} 
            variant="contained" 
            color="error"
          >
            {saving ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 