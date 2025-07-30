'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  IconButton,
  Fade,
  Grow,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Store as StoreIcon
} from '@mui/icons-material';

// Custom Diamond SVG Component
const DiamondSVG = ({ size = 60, color = '#FFFFFF' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main diamond outline */}
    <path
      d="M50 5L25 25L15 45L50 95L85 45L75 25L50 5Z"
      fill={color}
      stroke="rgba(255, 255, 255, 0.3)"
      strokeWidth="1"
    />
    
    {/* Top facets */}
    <path
      d="M50 5L25 25L40 25L50 5Z"
      fill="rgba(255, 255, 255, 0.1)"
      stroke="rgba(255, 255, 255, 0.2)"
      strokeWidth="0.5"
    />
    <path
      d="M50 5L40 25L60 25L50 5Z"
      fill="rgba(255, 255, 255, 0.15)"
      stroke="rgba(255, 255, 255, 0.2)"
      strokeWidth="0.5"
    />
    <path
      d="M50 5L60 25L75 25L50 5Z"
      fill="rgba(255, 255, 255, 0.1)"
      stroke="rgba(255, 255, 255, 0.2)"
      strokeWidth="0.5"
    />
    
    {/* Middle facets */}
    <path
      d="M25 25L15 45L35 45L40 25L25 25Z"
      fill="rgba(255, 255, 255, 0.05)"
      stroke="rgba(255, 255, 255, 0.15)"
      strokeWidth="0.5"
    />
    <path
      d="M40 25L35 45L50 45L50 25L40 25Z"
      fill="rgba(255, 255, 255, 0.1)"
      stroke="rgba(255, 255, 255, 0.15)"
      strokeWidth="0.5"
    />
    <path
      d="M50 25L50 45L65 45L60 25L50 25Z"
      fill="rgba(255, 255, 255, 0.1)"
      stroke="rgba(255, 255, 255, 0.15)"
      strokeWidth="0.5"
    />
    <path
      d="M60 25L65 45L85 45L75 25L60 25Z"
      fill="rgba(255, 255, 255, 0.05)"
      stroke="rgba(255, 255, 255, 0.15)"
      strokeWidth="0.5"
    />
    
    {/* Bottom facets */}
    <path
      d="M15 45L35 45L50 95L15 45Z"
      fill="rgba(255, 255, 255, 0.03)"
      stroke="rgba(255, 255, 255, 0.1)"
      strokeWidth="0.5"
    />
    <path
      d="M35 45L50 45L50 95L35 45Z"
      fill="rgba(255, 255, 255, 0.08)"
      stroke="rgba(255, 255, 255, 0.1)"
      strokeWidth="0.5"
    />
    <path
      d="M50 45L65 45L50 95L50 45Z"
      fill="rgba(255, 255, 255, 0.08)"
      stroke="rgba(255, 255, 255, 0.1)"
      strokeWidth="0.5"
    />
    <path
      d="M65 45L85 45L50 95L65 45Z"
      fill="rgba(255, 255, 255, 0.03)"
      stroke="rgba(255, 255, 255, 0.1)"
      strokeWidth="0.5"
    />
    
    {/* Center lines for detail */}
    <line
      x1="50"
      y1="5"
      x2="50"
      y2="95"
      stroke="rgba(255, 255, 255, 0.2)"
      strokeWidth="0.5"
    />
    <line
      x1="15"
      y1="45"
      x2="85"
      y2="45"
      stroke="rgba(255, 255, 255, 0.2)"
      strokeWidth="0.5"
    />
  </svg>
);

// Color scheme
const colors = {
  softWhite: '#F9FAFB',
  white: '#FFFFFF',
  softNavy: '#23395D',
  darkNavy: '#1B263B',
  softGrey: '#D0D6DD',
  gold: '#FFD700',
};

// Create a premium theme with your color scheme
const premiumTheme = createTheme({
  palette: {
    primary: {
      main: colors.softNavy,
      light: colors.softGrey,
      dark: colors.darkNavy,
    },
    secondary: {
      main: colors.gold,
      light: '#ffff52',
      dark: '#c7a500',
    },
    background: {
      default: colors.softWhite,
      paper: colors.white,
    },
    text: {
      primary: colors.darkNavy,
      secondary: colors.softNavy,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1.1rem',
          padding: '14px 28px',
          boxShadow: `0 4px 14px 0 rgba(35, 57, 93, 0.2)`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px 0 rgba(35, 57, 93, 0.3)`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const features = [
  {
    icon: <PeopleIcon />,
    title: 'Team Management',
    description: 'Manage your jewelry business team efficiently',
  },
  {
    icon: <StoreIcon />,
    title: 'Multi-Store Support',
    description: 'Handle multiple store locations seamlessly',
  },
  {
    icon: <TrendingUpIcon />,
    title: 'Sales Analytics',
    description: 'Track performance with detailed insights',
  },
  {
    icon: <SecurityIcon />,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security for your data',
  },
];

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const isMobile = useMediaQuery(premiumTheme.breakpoints.down('md'));

  const handleGetStarted = () => {
    router.push('/select-role');
  };

  return (
    <ThemeProvider theme={premiumTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: colors.softWhite,
        }}
      >
        {/* Subtle Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${colors.softWhite} 0%, ${colors.white} 100%)`,
            zIndex: -2,
          }}
        />
        
        {/* Floating Geometric Shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 100,
            height: 100,
            background: `linear-gradient(45deg, ${colors.softNavy}, ${colors.darkNavy})`,
            borderRadius: '50%',
            opacity: 0.05,
            animation: 'float 6s ease-in-out infinite',
            zIndex: -1,
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' },
            },
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '5%',
            width: 60,
            height: 60,
            background: `linear-gradient(45deg, ${colors.softGrey}, ${colors.white})`,
            borderRadius: '20%',
            opacity: 0.1,
            animation: 'float 8s ease-in-out infinite reverse',
            zIndex: -1,
          }}
        />

        <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 4 }}>
          <Box sx={{ width: '100%' }}>
            {/* Main Hero Section */}
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: 8 }}>
                {/* Diamond Logo with Animation */}
                <Grow in timeout={1500}>
                  <Box 
                    sx={{ 
                      mb: 4,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)',
                        },
                      }}
                    >
                      <DiamondSVG size={isMobile ? 80 : 120} color={colors.softNavy} />
                    </Box>
                  </Box>
                </Grow>

                {/* Main Title */}
                <Fade in timeout={2000}>
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      mb: 2,
                      color: colors.darkNavy,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                    }}
                  >
                    JEWEL OS CRM
                  </Typography>
                </Fade>

                {/* Subtitle */}
                <Fade in timeout={2500}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 6,
                      color: colors.softNavy,
                      maxWidth: 600,
                      mx: 'auto',
                      fontSize: { xs: '1rem', md: '1.2rem' },
                    }}
                  >
                    Premium Multi-User CRM Solution for Modern Jewelry Businesses
                  </Typography>
                </Fade>

                {/* Get Started Button */}
                <Fade in timeout={3000}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    endIcon={
                      <ArrowForwardIcon
                        sx={{
                          transition: 'transform 0.3s ease-in-out',
                          transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                        }}
                      />
                    }
                    sx={{
                      background: `linear-gradient(135deg, ${colors.softNavy} 0%, ${colors.darkNavy} 100%)`,
                      px: 4,
                      py: 2,
                      fontSize: '1.2rem',
                      color: colors.white,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${colors.darkNavy} 0%, ${colors.softNavy} 100%)`,
                      },
                    }}
        >
          Get Started
                  </Button>
                </Fade>
              </Box>
            </Fade>

            {/* Features Section */}
            <Fade in timeout={3500}>
              <Box sx={{ mt: 8 }}>
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{
                    textAlign: 'center',
                    mb: 6,
                    color: colors.darkNavy,
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                  }}
                >
                  Why Choose Jewel OS CRM?
                </Typography>
                
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
                    gap: 3,
                  }}
                >
                  {features.map((feature, index) => (
                    <Grow in timeout={4000 + index * 200} key={index}>
                      <Card
                        sx={{
                          height: '100%',
                          transition: 'all 0.3s ease-in-out',
                          cursor: 'pointer',
                          backgroundColor: colors.white,
                          border: `1px solid ${colors.softGrey}`,
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: `0 15px 35px rgba(35, 57, 93, 0.15)`,
                            borderColor: colors.softNavy,
                          },
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Avatar
                            sx={{
                              width: 60,
                              height: 60,
                              mx: 'auto',
                              mb: 2,
                              background: `linear-gradient(135deg, ${colors.softNavy}, ${colors.darkNavy})`,
                            }}
                          >
                            {feature.icon}
                          </Avatar>
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            sx={{ 
                              mb: 1, 
                              fontWeight: 600,
                              color: colors.darkNavy,
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: colors.softNavy,
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grow>
                  ))}
                </Box>
              </Box>
            </Fade>
          </Box>
        </Container>

        {/* Footer */}
        <Fade in timeout={5000}>
          <Box
            component="footer"
            sx={{
              py: 3,
              textAlign: 'center',
              borderTop: `1px solid ${colors.softGrey}`,
              background: colors.white,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="body2" sx={{ color: colors.softNavy }}>
              &copy; {new Date().getFullYear()} Jewel OS CRM. All rights reserved.
            </Typography>
          </Box>
        </Fade>
      </Box>
    </ThemeProvider>
  );
} 