import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { AppShell } from './layouts/AppShell';
import { ActivityPage } from './features/activities/ActivityPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProjectsPage } from './features/projects/ProjectsPage';
import { UsersPage } from './features/users/UsersPage';
import type { PageName } from './types/navigation';

function App() {
  const [page, setPage] = useState<PageName>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = (nextPage: PageName) => {
    setPage(nextPage);
    setMobileMenuOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppShell
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        onMenuClose={() => setMobileMenuOpen(false)}
        onMenuOpen={() => setMobileMenuOpen(true)}
        onNavigate={navigate}
        page={page}
      >
        {page === 'dashboard' && <DashboardPage />}
        {page === 'users' && <UsersPage />}
        {page === 'projects' && <ProjectsPage />}
        {page === 'activities' && <ActivityPage />}
      </AppShell>
    </Box>
  );
}

export default App;
