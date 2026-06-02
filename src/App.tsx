import { Grid, Box, Paper, Typography } from '@mui/material';
import HeaderUI from './Components/HeaderUI';
import AlertUI from './Components/AlertUI';
import './App.css';

function App() {
  return (
    <Box className="ufc-dashboard-container">
      <Grid container spacing={5} sx={{ justifyContent: "center", alignItems: "center" }}>
        
        {/* Encabezado */}
        <Grid size={{ xs: 12, md: 12 }}>
          <HeaderUI />
        </Grid>

        {/* Alertas */}
        <Grid size={{ xs: 12, md: 12 }} container sx={{ justifyContent: "center", alignItems: "center" }}>
          <AlertUI description="Alerta: Confirmado combate por el título mundial de peso Ligero en el próximo evento." />
        </Grid>

        {/* Selector */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box className="ufc-skeleton-box">
            Elemento: Selector de Divisiones y Peleadores
          </Box>
        </Grid>

        {/* Indicadores */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Box className="ufc-skeleton-box">
            Elemento: Indicadores de Rendimiento (Combates, KOs, Derribos, Golpes)
          </Box>
        </Grid>

        {/* Gráfico */}
        <Grid 
          size={{ xs: 12, md: 6 }} 
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Box className="ufc-skeleton-box">
            Elemento: Gráfico de Distribución (Métodos de Victoria)
          </Box>
        </Grid>

        {/* Tabla */}
        <Grid 
          size={{ xs: 12, md: 6 }} 
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Box className="ufc-skeleton-box">
            Elemento: Tabla de Historial de Combates Recientes
          </Box>
        </Grid>

        {/* Información adicional */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Paper className="ufc-info-paper" sx={{ boxShadow: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
              Elemento: Información Adicional
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              Glosario estadístico y detalles sobre las métricas físicas y de desempeño de los peleadores de UFC.
            </Typography>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}

export default App;
