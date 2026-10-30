import { useEffect, useState } from 'react';
import { Alert, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { getActivities } from '../../api/activities';
import { getDashboardSummary } from '../../api/dashboard';
import { getProjects } from '../../api/projects';
import { getUsers } from '../../api/users';
import { ActivityTable } from '../../components/ActivityTable';
import { LoadState } from '../../components/LoadState';
import { PageHeading } from '../../components/PageHeading';
import { StatCard } from '../../components/StatCard';
import type { Activity, ActivityPage, DashboardSummary, Project, User } from '../../types/domain';

const recentFilters = {
  page: 1,
  pageSize: 5,
  sortBy: 'timestamp' as const,
  sortDirection: 'desc' as const,
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export function DashboardPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [activities, setActivities] = useState<ActivityPage | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [errors, setErrors] = useState<{
    users: string | null;
    projects: string | null;
    activities: string | null;
    summary: string | null;
  }>({
    users: null,
    projects: null,
    activities: null,
    summary: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    void Promise.allSettled([
      getDashboardSummary(),
      getUsers(),
      getProjects(),
      getActivities(recentFilters),
    ]).then(([summaryResult, usersResult, projectsResult, activitiesResult]) => {
      if (!active) {
        return;
      }

      setSummary(summaryResult.status === 'fulfilled' ? summaryResult.value : null);
      setUsers(usersResult.status === 'fulfilled' ? usersResult.value : null);
      setProjects(projectsResult.status === 'fulfilled' ? projectsResult.value : null);
      setActivities(activitiesResult.status === 'fulfilled' ? activitiesResult.value : null);
      setErrors({
        summary: summaryResult.status === 'rejected' ? getErrorMessage(summaryResult.reason) : null,
        users: usersResult.status === 'rejected' ? getErrorMessage(usersResult.reason) : null,
        projects:
          projectsResult.status === 'rejected' ? getErrorMessage(projectsResult.reason) : null,
        activities:
          activitiesResult.status === 'rejected' ? getErrorMessage(activitiesResult.reason) : null,
      });
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const recentActivities: Activity[] = activities?.data ?? [];

  return (
    <Stack spacing={3}>
      <PageHeading
        title="Engagement overview"
        description="A snapshot of your project engagement workspace."
      />
      {Object.values(errors).some(Boolean) ? (
        <Alert severity="info">
          Some dashboard information is unavailable until the corresponding backend endpoints are
          implemented.
        </Alert>
      ) : null}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            label="Total users"
            value={summary?.totalUsers ?? null}
            detail={errors.users ?? 'Registered workspace users'}
            monogram="U"
            color="#eaf0ff"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            label="Total activities"
            value={summary?.totalActivities ?? null}
            detail={errors.activities ?? 'Recorded engagement events'}
            monogram="A"
            color="#e8f5ef"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            label="Active projects"
            value={summary?.activeProjects ?? null}
            detail={errors.projects ?? 'Projects currently in progress'}
            monogram="P"
            color="#fff4e5"
          />
        </Grid>
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Activity statistics
          </Typography>
          {errors.summary ? (
            <LoadState loading={false} error={errors.summary} />
          ) : (
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {summary ? (
                Object.entries(summary.activitiesByType).map(([type, count]) => (
                  <Chip key={type} label={`${type.replaceAll('_', ' ')}: ${count}`} />
                ))
              ) : loading ? (
                <LoadState loading error={null} />
              ) : null}
            </Stack>
          )}
        </Paper>
      </Grid>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <div>
            <Typography variant="h6" fontWeight={700}>
              Recent activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The latest recorded project events
            </Typography>
          </div>
        </Stack>
        {errors.activities ? (
          <LoadState loading={false} error={errors.activities} />
        ) : (
          <>
            <LoadState
              loading={loading}
              error={null}
              empty={!loading && recentActivities.length === 0}
              emptyMessage="No activity has been recorded yet."
            />
            {!loading && recentActivities.length > 0 ? (
              <ActivityTable
                activities={recentActivities}
                users={users ?? []}
                projects={projects ?? []}
              />
            ) : null}
          </>
        )}
      </Paper>
    </Stack>
  );
}
