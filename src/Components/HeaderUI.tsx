import { Box, Typography } from '@mui/material';

export default function HeaderUI() {
  return (
    <Box sx={{ py: 1, textAlign: 'center' }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: '#ffffff'
        }}
      >
        UFC <span style={{ color: '#d32f2f' }}>Stats</span> Dashboard
      </Typography>
      <Typography 
        variant="subtitle1" 
        color="text.secondary"
        sx={{ mt: 1, letterSpacing: '0.5px' }}
      >
        Análisis Histórico de Combates, Peleadores y Rendimiento
      </Typography>
    </Box>
  );
}
