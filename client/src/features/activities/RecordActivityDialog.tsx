import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { createActivity } from '../../api/activities';
import { activityTypes, type ActivityType, type Project, type User } from '../../types/domain';

interface RecordActivityDialogProps {
  open: boolean;
  users: User[];
  projects: Project[];
  onClose: () => void;
  onCreated: () => void;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

function getLocalDateTimeValue(date = new Date()): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function RecordActivityDialog({
  open,
  users,
  projects,
  onClose,
  onCreated,
}: RecordActivityDialogProps) {
  const [userId, setUserId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('MEETING');
  const [description, setDescription] = useState('');
  const [timestamp, setTimestamp] = useState(() => getLocalDateTimeValue());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setTimestamp(getLocalDateTimeValue());
  }, [open]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createActivity({
        userId,
        projectId: projectId || undefined,
        activityType,
        description,
        timestamp: new Date(timestamp).toISOString(),
      });
      setUserId('');
      setProjectId('');
      setActivityType('MEETING');
      setDescription('');
      setTimestamp(getLocalDateTimeValue());
      onCreated();
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={submit}>
        <DialogTitle>Record activity</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <FormControl required fullWidth>
              <InputLabel id="record-activity-user-label">User</InputLabel>
              <Select
                labelId="record-activity-user-label"
                label="User"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              >
                {users
                  .filter((user) => user.isActive)
                  .map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="record-activity-project-label">Project (optional)</InputLabel>
              <Select
                labelId="record-activity-project-label"
                label="Project (optional)"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
              >
                <MenuItem value="">No project</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl required fullWidth>
              <InputLabel id="record-activity-type-label">Activity type</InputLabel>
              <Select
                labelId="record-activity-type-label"
                label="Activity type"
                value={activityType}
                onChange={(event) =>
                  setActivityType(
                    activityTypes.find((type) => type === event.target.value) ?? 'MEETING',
                  )
                }
              >
                {activityTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replaceAll('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              required
              fullWidth
              type="datetime-local"
              label="Date and time"
              value={timestamp}
              onChange={(event) => setTimestamp(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              required
              fullWidth
              multiline
              minRows={2}
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving || users.length === 0}>
            {saving ? 'Saving…' : 'Record activity'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
