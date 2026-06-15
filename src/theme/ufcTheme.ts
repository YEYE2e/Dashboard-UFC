import { createTheme } from '@mui/material/styles';

const ufcTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d32f2f', // UFC Red
    },
    background: {
      default: '#0a0a0a', // Solid Black
      paper: '#121212', // Dark Grey for Cards/Containers
    },
    text: {
      primary: '#ffffff',
      secondary: '#aaaaaa',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    h3: {
      fontWeight: 900,
      letterSpacing: '1px',
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #222222',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default ufcTheme;
