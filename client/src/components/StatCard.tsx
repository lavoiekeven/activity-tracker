import { Avatar, Paper, Stack, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: number | null;
  detail: string;
  monogram: string;
  color: string;
}

export function StatCard({ label, value, detail, monogram, color }: StatCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <div>
          <Typography color="text.secondary" variant="body2" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
            {value === null ? '—' : value.toLocaleString()}
          </Typography>
        </div>
        <Avatar variant="rounded" sx={{ bgcolor: color, color: 'primary.main', fontWeight: 700 }}>
          {monogram}
        </Avatar>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        {detail}
      </Typography>
    </Paper>
  );
}
