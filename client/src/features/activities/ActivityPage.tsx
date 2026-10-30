import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Snackbar,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TablePagination,
  TextField,
} from '@mui/material';
import { getActivities } from '../../api/activities';
import { getProjects } from '../../api/projects';
import { getUsers } from '../../api/users';
import { ActivityTable } from '../../components/ActivityTable';
import { LoadState } from '../../components/LoadState';
import { PageHeading } from '../../components/PageHeading';
import { RecordActivityDialog } from './RecordActivityDialog';
import {
  activityTypes,
  type ActivityFilters,
  type ActivityPage,
  type Project,
  type User,
} from '../../types/domain';

const defaultFilters: ActivityFilters = {
  page: 1,
  pageSize: 10,
  sortBy: 'timestamp',
  sortDirection: 'desc',
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export function ActivityPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>(defaultFilters);
  const [userId, setUserId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [activityType, setActivityType] = useState('');
  const [sortBy, setSortBy] = useState<ActivityFilters['sortBy']>('timestamp');
  const [sortDirection, setSortDirection] = useState<ActivityFilters['sortDirection']>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<ActivityPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLookupsLoading(true);
    void Promise.allSettled([getUsers(), getProjects()]).then(([usersResult, projectsResult]) => {
      if (!active) {
        return;
      }
      const failures = [usersResult, projectsResult]
        .filter((entry) => entry.status === 'rejected')
        .map((entry) => (entry.status === 'rejected' ? getErrorMessage(entry.reason) : ''));
      setUsers(usersResult.status === 'fulfilled' ? usersResult.value : []);
      setProjects(projectsResult.status === 'fulfilled' ? projectsResult.value : []);
      setLookupError(failures.length > 0 ? failures.join(' ') : null);
      setLookupsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void getActivities(filters)
      .then((page) => {
        if (active) {
          setResult(page);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(getErrorMessage(reason));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [filters]);

  const applyFilters = () => {
    setFilters({
      ...defaultFilters,
      sortBy,
      sortDirection,
      userId: userId || undefined,
      projectId: projectId || undefined,
      activityType: activityTypes.find((type) => type === activityType),
      startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined,
      endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined,
    });
  };

  const clearFilters = () => {
    setUserId('');
    setProjectId('');
    setActivityType('');
    setSortBy('timestamp');
    setSortDirection('desc');
    setStartDate('');
    setEndDate('');
    setFilters(defaultFilters);
  };

  const validDateRange = !startDate || !endDate || startDate <= endDate;

  return (
    <Stack spacing={2.5}>
      <PageHeading
        title="Activity history"
        description="Review and filter immutable project engagement records."
        action={
          <Button variant="contained" onClick={() => setRecordDialogOpen(true)}>
            Record activity
          </Button>
        }
      />
      {lookupError ? (
        <Alert severity="warning">
          User and project filters may be incomplete because the lookup API is unavailable.{' '}
          {lookupError}
        </Alert>
      ) : null}
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="activity-user-label">User</InputLabel>
              <Select
                labelId="activity-user-label"
                label="User"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              >
                <MenuItem value="">All users</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="activity-project-label">Project</InputLabel>
              <Select
                labelId="activity-project-label"
                label="Project"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
              >
                <MenuItem value="">All projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="activity-type-label">Activity type</InputLabel>
              <Select
                labelId="activity-type-label"
                label="Activity type"
                value={activityType}
                onChange={(event) => setActivityType(event.target.value)}
              >
                <MenuItem value="">All types</MenuItem>
                {activityTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replaceAll('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="To"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="activity-sort-label">Sort by</InputLabel>
              <Select
                labelId="activity-sort-label"
                label="Sort by"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value === 'activityType' ? 'activityType' : 'timestamp')
                }
              >
                <MenuItem value="timestamp">Date and time</MenuItem>
                <MenuItem value="activityType">Activity type</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="activity-direction-label">Direction</InputLabel>
              <Select
                labelId="activity-direction-label"
                label="Direction"
                value={sortDirection}
                onChange={(event) =>
                  setSortDirection(event.target.value === 'asc' ? 'asc' : 'desc')
                }
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={clearFilters}>Clear</Button>
              <Button
                variant="contained"
                onClick={applyFilters}
                disabled={!validDateRange || lookupsLoading}
              >
                Apply filters
              </Button>
            </Stack>
            {!validDateRange ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                The start date must be on or before the end date.
              </Alert>
            ) : null}
          </Grid>
        </Grid>
      </Paper>
      {error ? (
        <LoadState loading={false} error={error} />
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <LoadState
            loading={loading || lookupsLoading}
            error={null}
            empty={!loading && result?.data.length === 0}
            emptyMessage="No activities match these filters."
          />
          {!loading && result && result.data.length > 0 ? (
            <>
              <ActivityTable activities={result.data} users={users} projects={projects} />
              <TablePagination
                component="div"
                count={result.total}
                page={Math.max(result.page - 1, 0)}
                onPageChange={(_event, nextPage) =>
                  setFilters((current) => ({ ...current, page: nextPage + 1 }))
                }
                rowsPerPage={result.pageSize}
                onRowsPerPageChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    page: 1,
                    pageSize: Number(event.target.value),
                  }))
                }
                rowsPerPageOptions={[10, 25, 50]}
              />
            </>
          ) : null}
        </Paper>
      )}
      <RecordActivityDialog
        open={recordDialogOpen}
        users={users}
        projects={projects}
        onClose={() => setRecordDialogOpen(false)}
        onCreated={() => {
          setRecordDialogOpen(false);
          setNotice('Activity recorded.');
          setFilters((current) => ({ ...current, page: 1 }));
        }}
      />
      <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice(null)}>
        <Alert severity="success" onClose={() => setNotice(null)} variant="filled">
          {notice}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
