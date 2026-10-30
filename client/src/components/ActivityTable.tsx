import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { Activity, Project, User } from '../types/domain';

interface ActivityTableProps {
  activities: Activity[];
  users: User[];
  projects: Project[];
}

const typeColors: Record<Activity['activityType'], 'primary' | 'success' | 'warning' | 'info'> = {
  LOGIN: 'success',
  LOGOUT: 'info',
  MEETING: 'primary',
  DOCUMENT_SUBMISSION: 'warning',
  DATA_CHANGE: 'primary',
};

export function ActivityTable({ activities, users, projects }: ActivityTableProps) {
  const userNames = new Map(users.map((user) => [user._id, `${user.firstName} ${user.lastName}`]));
  const projectNames = new Map(projects.map((project) => [project._id, project.name]));

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Activity</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Project</TableCell>
            <TableCell>Date and time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity._id} hover>
              <TableCell>
                <StackedActivity activity={activity} />
              </TableCell>
              <TableCell>{userNames.get(activity.userId) ?? 'Unknown user'}</TableCell>
              <TableCell>
                {activity.projectId
                  ? (projectNames.get(activity.projectId) ?? 'Unknown project')
                  : '—'}
              </TableCell>
              <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function StackedActivity({ activity }: { activity: Activity }) {
  return (
    <>
      <Chip
        color={typeColors[activity.activityType]}
        label={activity.activityType.replaceAll('_', ' ')}
        size="small"
        variant="outlined"
      />
      <Typography variant="body2" sx={{ mt: 0.75 }}>
        {activity.description}
      </Typography>
    </>
  );
}
