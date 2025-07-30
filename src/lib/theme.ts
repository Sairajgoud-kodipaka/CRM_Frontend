import { createTheme } from '@mui/material/styles';

// Custom palette colors as specified in migration plan
const colors = {
  softWhite: '#F9FAFB',
  white: '#FFFFFF',
  softNavy: '#23395D',
  darkNavy: '#1B263B',
  softGrey: '#D0D6DD',
  gold: '#FFD700',
};

export const businessAdminTheme = createTheme({
  palette: {
    primary: {
      main: colors.softNavy,
      light: '#3A4F6B',
      dark: colors.darkNavy,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.gold,
      light: '#FFE44D',
      dark: '#E6C200',
      contrastText: colors.darkNavy,
    },
    background: {
      default: colors.softWhite,
      paper: colors.white,
    },
    text: {
      primary: colors.darkNavy,
      secondary: colors.softNavy,
    },
    divider: colors.softGrey,
    action: {
      hover: colors.softGrey,
      selected: colors.softGrey,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: colors.darkNavy,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: colors.darkNavy,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: colors.darkNavy,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: colors.darkNavy,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: colors.darkNavy,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: colors.darkNavy,
    },
    body1: {
      fontSize: '1rem',
      color: colors.softNavy,
    },
    body2: {
      fontSize: '0.875rem',
      color: colors.softNavy,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(35, 57, 93, 0.2)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export { colors };