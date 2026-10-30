import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
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
import { createProject, getProjects, updateProject, type ProjectInput } from '../../api/projects';
import { LoadState } from '../../components/LoadState';
import { PageHeading } from '../../components/PageHeading';
import type { Project } from '../../types/domain';

const emptyInput: ProjectInput = {
  name: '',
  description: '',
  status: 'Active',
  startDate: '',
  endDate: '',
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

function toDateInput(value: string | undefined): string {
  return value ? value.slice(0, 10) : '';
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [input, setInput] = useState<ProjectInput>(emptyInput);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setProjects(await getProjects());
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const openCreateDialog = () => {
    setEditingProject(null);
    setInput(emptyInput);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setInput({
      name: project.name,
      description: project.description ?? '',
      status: project.status,
      startDate: toDateInput(project.startDate),
      endDate: toDateInput(project.endDate),
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (input.endDate && input.endDate < input.startDate) {
      setFormError('The end date must be on or after the start date.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        ...input,
        description: input.description?.trim() || undefined,
        endDate: input.endDate || undefined,
      };
      if (editingProject) {
        await updateProject(editingProject._id, payload);
        setNotice('Project updated.');
      } else {
        await createProject(payload);
        setNotice('Project created.');
      }
      setDialogOpen(false);
      await loadProjects();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    `${project.name} ${project.description ?? ''} ${project.status}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <Stack spacing={2.5}>
      <PageHeading
        title="Project management"
        description="Track project details, timelines, and status."
        action={
          <Button variant="contained" onClick={openCreateDialog}>
            Add project
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
                Projects
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </Typography>
            </div>
            <TextField
              label="Search projects"
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
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start date</TableCell>
                  <TableCell>End date</TableCell>
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
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        {search
                          ? 'No projects match your search.'
                          : 'No projects have been added yet.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project._id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{project.name}</Typography>
                        {project.description ? (
                          <Typography variant="body2" color="text.secondary">
                            {project.description}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={project.status.toLowerCase() === 'active' ? 'success' : 'default'}
                          label={project.status}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit project">
                          <IconButton
                            aria-label={`Edit ${project.name}`}
                            onClick={() => openEditDialog(project)}
                            size="small"
                          >
                            <Typography component="span" variant="caption" fontWeight={700}>
                              Edit
                            </Typography>
                          </IconButton>
                        </Tooltip>
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
          <DialogTitle>{editingProject ? 'Edit project' : 'Add project'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {formError ? <Alert severity="error">{formError}</Alert> : null}
              <TextField
                autoFocus
                required
                fullWidth
                label="Project name"
                value={input.name}
                onChange={(event) => setInput({ ...input, name: event.target.value })}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Description"
                value={input.description}
                onChange={(event) => setInput({ ...input, description: event.target.value })}
              />
              <TextField
                select
                required
                fullWidth
                label="Status"
                value={input.status}
                onChange={(event) => setInput({ ...input, status: event.target.value })}
                slotProps={{ select: { native: true } }}
              >
                <option value="Active">Active</option>
                <option value="On hold">On hold</option>
                <option value="Completed">Completed</option>
              </TextField>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Start date"
                  value={input.startDate}
                  onChange={(event) => setInput({ ...input, startDate: event.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="End date"
                  value={input.endDate}
                  onChange={(event) => setInput({ ...input, endDate: event.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving…' : editingProject ? 'Save changes' : 'Create project'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice(null)}>
        <Alert severity="success" onClose={() => setNotice(null)} variant="filled">
          {notice}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
