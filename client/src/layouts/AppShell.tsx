import type { ReactNode } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import type { PageName } from '../types/navigation';

const drawerWidth = 256;
const pageTitles: Record<PageName, string> = {
  dashboard: 'Dashboard',
  users: 'User management',
  projects: 'Project management',
  activities: 'Activity history',
};
const pages: { name: PageName; monogram: string }[] = [
  { name: 'dashboard', monogram: 'D' },
  { name: 'users', monogram: 'U' },
  { name: 'projects', monogram: 'P' },
  { name: 'activities', monogram: 'A' },
];

interface AppShellProps {
  children: ReactNode;
  page: PageName;
  isMobile: boolean;
  mobileMenuOpen: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
  onNavigate: (page: PageName) => void;
}

export function AppShell({
  children,
  page,
  isMobile,
  mobileMenuOpen,
  onMenuOpen,
  onMenuClose,
  onNavigate,
}: AppShellProps) {
  const drawer = (
    <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5, px: 2.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', borderRadius: 2, fontWeight: 700 }}>T</Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            Engagement
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Project tracker
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2.5, pt: 2.5, pb: 1, fontWeight: 700 }}
      >
        Workspace
      </Typography>
      <List sx={{ px: 1.5 }}>
        {pages.map(({ name, monogram }) => (
          <ListItemButton
            key={name}
            selected={page === name}
            onClick={() => onNavigate(name)}
            sx={{ mb: 0.5, borderRadius: 2 }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 30,
                height: 30,
                mr: 1.5,
                fontSize: '0.8rem',
                fontWeight: 700,
                bgcolor: page === name ? 'primary.main' : 'action.hover',
                color: page === name ? 'primary.contrastText' : 'text.secondary',
              }}
            >
              {monogram}
            </Avatar>
            <ListItemText primary={pageTitles[name]} primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2.5 }}>
        <Typography variant="caption" color="text.secondary">
          Tax Project Engagement Tracker
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile ? (
            <IconButton
              edge="start"
              onClick={onMenuOpen}
              aria-label="Open navigation"
              sx={{ mr: 1 }}
            >
              <Typography component="span" fontSize="1.25rem">
                ☰
              </Typography>
            </IconButton>
          ) : null}
          <Typography variant="h6" component="div" fontWeight={700} sx={{ flexGrow: 1 }}>
            {pageTitles[page]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tax operations
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" aria-label="Main navigation">
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileMenuOpen}
            onClose={onMenuClose}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: 10,
          px: { xs: 2, sm: 3, lg: 4 },
          pb: 5,
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </>
  );
}
