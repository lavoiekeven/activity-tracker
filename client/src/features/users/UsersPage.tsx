import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { createUser, getUser, getUsers, setUserStatus, updateUser } from '../../api/users';
import { LoadState } from '../../components/LoadState';
import { PageHeading } from '../../components/PageHeading';
import type { User } from '../../types/domain';
import type { UserInput } from '../../api/users';

const emptyInput: UserInput = { firstName: '', lastName: '', email: '', role: '' };

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [input, setInput] = useState<UserInput>(emptyInput);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setUsers(await getUsers());
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const openCreateDialog = () => {
    setEditingUser(null);
    setInput(emptyInput);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setInput({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const openDetails = async (user: User) => {
    setViewingUser(user);
    setViewLoading(true);
    setViewError(null);
    try {
      setViewingUser(await getUser(user._id));
    } catch (error) {
      setViewError(getErrorMessage(error));
    } finally {
      setViewLoading(false);
    }
  };

  const closeDialog = () => {
    if (!saving) {
      setDialogOpen(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingUser) {
        await updateUser(editingUser._id, input);
        setNotice('User details updated.');
      } else {
        await createUser(input);
        setNotice('User created.');
      }
      setDialogOpen(false);
      await loadUsers();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      await setUserStatus(user._id, !user.isActive);
      setNotice(`User ${user.isActive ? 'deactivated' : 'activated'}.`);
      await loadUsers();
    } catch (error) {
      setLoadError(getErrorMessage(error));
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <Stack spacing={2.5}>
      <PageHeading
        title="User management"
        description="Manage workspace access and user profiles."
        action={
          <Button variant="contained" onClick={openCreateDialog}>
            Add user
          </Button>
        }
      />
      {loadError ? (
        <LoadState loading={false} error={loadError} />
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Stack
            alignItems={{ xs: 'stretch', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ p: 2 }}
          >
            <div>
              <Typography variant="h6" fontWeight={700}>
                Team members
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {users.length} {users.length === 1 ? 'user' : 'users'}
              </Typography>
            </div>
            <TextField
              label="Search users"
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ width: { xs: '100%', sm: 280 } }}
            />
          </Stack>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Added</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <LoadState loading error={null} />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        {search ? 'No users match your search.' : 'No users have been added yet.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </Avatar>
                          <div>
                            <Typography fontWeight={600}>
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </div>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Chip
                          color={user.isActive ? 'success' : 'default'}
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => void openDetails(user)}>
                          View
                        </Button>
                        <Tooltip title="Edit user">
                          <IconButton
                            aria-label={`Edit ${user.firstName} ${user.lastName}`}
                            onClick={() => openEditDialog(user)}
                            size="small"
                          >
                            <Typography component="span" variant="caption" fontWeight={700}>
                              Edit
                            </Typography>
                          </IconButton>
                        </Tooltip>
                        <Button
                          size="small"
                          onClick={() => void handleStatusToggle(user)}
                          color={user.isActive ? 'warning' : 'success'}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingUser ? 'Edit user' : 'Add user'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {formError ? <Alert severity="error">{formError}</Alert> : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  autoFocus
                  required
                  fullWidth
                  label="First name"
                  value={input.firstName}
                  onChange={(event) => setInput({ ...input, firstName: event.target.value })}
                />
                <TextField
                  required
                  fullWidth
                  label="Last name"
                  value={input.lastName}
                  onChange={(event) => setInput({ ...input, lastName: event.target.value })}
                />
              </Stack>
              <TextField
                required
                fullWidth
                type="email"
                label="Email"
                value={input.email}
                onChange={(event) => setInput({ ...input, email: event.target.value })}
              />
              <TextField
                required
                fullWidth
                label="Role"
                value={input.role}
                onChange={(event) => setInput({ ...input, role: event.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving…' : editingUser ? 'Save changes' : 'Create user'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={viewingUser !== null}
        onClose={() => {
          setViewingUser(null);
          setViewError(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {viewingUser ? `${viewingUser.firstName} ${viewingUser.lastName}` : 'User details'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {viewError ? <Alert severity="error">{viewError}</Alert> : null}
            {viewLoading ? (
              <LoadState loading error={null} />
            ) : viewingUser ? (
              <>
                <Typography>
                  <strong>Email:</strong> {viewingUser.email}
                </Typography>
                <Typography>
                  <strong>Role:</strong> {viewingUser.role}
                </Typography>
                <Typography>
                  <strong>Status:</strong> {viewingUser.isActive ? 'Active' : 'Inactive'}
                </Typography>
                <Typography>
                  <strong>Created:</strong> {new Date(viewingUser.createdAt).toLocaleString()}
                </Typography>
                <Typography>
                  <strong>Last updated:</strong> {new Date(viewingUser.updatedAt).toLocaleString()}
                </Typography>
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setViewingUser(null);
              setViewError(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice(null)}>
        <Alert severity="success" onClose={() => setNotice(null)} variant="filled">
          {notice}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
