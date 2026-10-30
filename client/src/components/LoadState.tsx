import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';

interface LoadStateProps {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  emptyMessage?: string;
}

export function LoadState({
  loading,
  error,
  empty = false,
  emptyMessage = 'Nothing to show yet.',
}: LoadStateProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'grid', minHeight: 180, placeItems: 'center' }}>
        <CircularProgress aria-label="Loading" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
        {error.includes('404') || error === 'Not Found' ? (
          <Typography component="div" variant="body2" sx={{ mt: 0.5 }}>
            The backend currently provides the health check only. This feature will be available
            when its API endpoints are implemented.
          </Typography>
        ) : null}
      </Alert>
    );
  }

  if (empty) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 180 }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Stack>
    );
  }

  return null;
}
