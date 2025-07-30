'use client';

import { useRouter } from 'next/navigation';
import { FlexGrid } from '@/components/ui/FlexGrid';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Paper,
  useTheme,
  alpha,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AdminPanelSettings as PlatformAdminIcon,
  Store as BusinessAdminIcon,
  Group as ManagerIcon,
  Person as SalesIcon,
  Phone as TeleCallingIcon,
  Campaign as MarketingIcon
} from '@mui/icons-material';
import React from 'react';

const roles = [
  { 
    name: 'Platform Admin', 
    slug: 'platform_admin', 
    description: 'Deploy/manage CRMs, analytics, support',
    icon: <PlatformAdminIcon />,
    color: 'primary'
  },
  { 
    name: 'Business Admin', 
    slug: 'business_admin', 
    description: 'Store dashboard, team, catalogue, pipeline',
    icon: <BusinessAdminIcon />,
    color: 'secondary'
  },
  { 
    name: 'Manager', 
    slug: 'manager', 
    description: 'Team management, sales funnel, customer DB',
    icon: <ManagerIcon />,
    color: 'success'
  },
  { 
    name: 'In-house Sales', 
    slug: 'inhouse_sales', 
    description: 'Sales dashboard, add customer, announcements',
    icon: <SalesIcon />,
    color: 'info'
  },
  { 
    name: 'Tele-calling Team', 
    slug: 'tele_calling', 
    description: 'Tele-calling, sales funnel, dashboard',
    icon: <TeleCallingIcon />,
    color: 'warning'
  },
  { 
    name: 'Marketing Team', 
    slug: 'marketing', 
    description: 'Ecom, WhatsApp, dashboard',
    icon: <MarketingIcon />,
    color: 'error'
  },
];

const RoleCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  }
}));

const MainCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: theme.shadows[4],
}));

// Color mapping function to fix the error
const getColorValue = (colorName: string, theme: any) => {
  const colorMap: { [key: string]: string } = {
    'primary': theme.palette.primary.main,
    'secondary': theme.palette.secondary.main,
    'success': theme.palette.success.main,
    'info': theme.palette.info.main,
    'warning': theme.palette.warning.main,
    'error': theme.palette.error.main,
  };
  return colorMap[colorName] || theme.palette.primary.main;
};

export default function SelectRolePage() {
  const router = useRouter();
  const theme = useTheme();

  const handleSelect = (role: string) => {
    localStorage.setItem('selected_role', role);
    router.push(`/login?role=${role}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: alpha(theme.palette.primary.main, 0.05),
        py: 4,
        px: 2
      }}
    >
      <Container maxWidth="md">
        <Fade in={true} timeout={600}>
          <MainCard elevation={0}>
            <CardContent sx={{ p: 4 }}>
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main',
                    mb: 1
                  }}
                >
                  Select Your Role
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ opacity: 0.8 }}
                >
                  Choose your role to access the appropriate dashboard and features
                </Typography>
              </Box>
              
              {/* Role Cards Grid - 3x2 Layout */}
              <FlexGrid container spacing={3} justifyContent="center">
                {roles.map((role, index) => (
                  <FlexGrid xs={12} sm={6} md={4} key={role.slug}>
                    <RoleCard
                      onClick={() => handleSelect(role.slug)}
                      sx={{
                        p: 3,
                        height: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                    >
                      {/* Role Icon */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: '50%',
                            bgcolor: alpha(getColorValue(role.color, theme), 0.1),
                            color: getColorValue(role.color, theme),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 60,
                            height: 60
                          }}
                        >
                          {React.cloneElement(role.icon, { sx: { fontSize: 28 } })}
                        </Box>
                      </Box>

                      {/* Role Content */}
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="h3"
                          sx={{ 
                            fontWeight: 600,
                            color: 'primary.main',
                            mb: 1
                          }}
                        >
                          {role.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            lineHeight: 1.4,
                            opacity: 0.8
                          }}
                        >
                          {role.description}
                        </Typography>
                      </Box>
                    </RoleCard>
                  </FlexGrid>
                ))}
              </FlexGrid>
              
              {/* Footer */}
              <Fade in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ opacity: 0.6 }}
                  >
                    © {new Date().getFullYear()} Jewel OS CRM
                  </Typography>
                </Box>
              </Fade>
            </CardContent>
          </MainCard>
        </Fade>
      </Container>
    </Box>
  );
} 