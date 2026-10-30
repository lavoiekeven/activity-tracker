import { Stack, Typography } from '@mui/material';

interface PageHeadingProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeading({ title, description, action }: PageHeadingProps) {
  return (
    <Stack
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <div>
        <Typography component="h1" variant="h4" fontWeight={700}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      </div>
      {action}
    </Stack>
  );
}
