import { Box, Typography } from '@mui/material';

export default function HeaderUI() {
  return (
    <Box className="ufc-header-container">
      <Typography
        variant="h3"
        component="h1"
        className="ufc-header-title"
      >
        UFC <span className="ufc-header-title-red">Stats</span> Dashboard
      </Typography>
      <Typography 
        variant="subtitle1" 
        className="ufc-header-subtitle"
      >
        Estructura Inicial - Análisis de Luchadores, Combates y Rendimiento
      </Typography>
    </Box>
  );
}
