import React, { useState, useMemo } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  Grid, 
  Tabs, 
  Tab, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress, 
  TextField, 
  Autocomplete, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TablePagination, 
  Chip, 
  Avatar, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Collapse,
  IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import useFetchData from './hooks/useFetchData';
import DivisionSelector from './Components/DivisionSelector';
import ufcTheme from './theme/ufcTheme';
import HeaderUI from './Components/HeaderUI';
import AlertUI from './Components/AlertUI';
import { getFighterFlagUrl } from './utils/ufcFlags';

function App() {
  const { fights, loading, error, refetch } = useFetchData();
  const [tabValue, setTabValue] = useState<number>(0);

  // Tab 2 (Combates) State
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDivision, setFilterDivision] = useState<string>('');
  const [filterTitleFight, setFilterTitleFight] = useState<string>('');
  const [expandedFightId, setExpandedFightId] = useState<string | null>(null);

  // Tab 3 (Peleadores) State
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null);

  // Pre-calculate filter parameters
  const divisions = useMemo(() => {
    const set = new Set<string>();
    fights.forEach(f => {
      if (f.weight_class) set.add(f.weight_class);
    });
    return Array.from(set).sort();
  }, [fights]);

  // Unique fighters list for Autocomplete
  const uniqueFighters = useMemo(() => {
    const set = new Set<string>();
    fights.forEach(f => {
      if (f.fighter_1) set.add(f.fighter_1);
      if (f.fighter_2) set.add(f.fighter_2);
    });
    return Array.from(set).sort();
  }, [fights]);

  // Fighter profile details (Tab 3)
  const fighterProfile = useMemo(() => {
    if (!selectedFighter) return null;

    const fighterFights = fights.filter(f => f.fighter_1 === selectedFighter || f.fighter_2 === selectedFighter);
    
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let height = 0;
    let weight = 0;
    let reach = 0;
    let stance = 'Orthodox';
    let dob = '';

    fighterFights.forEach(f => {
      // Find latest stats
      if (f.fighter_1 === selectedFighter) {
        if (f.f1_Height_cm) height = f.f1_Height_cm;
        if (f.f1_Weight_kg) weight = f.f1_Weight_kg;
        if (f.f1_Reach_cm) reach = f.f1_Reach_cm;
        if (f.f1_Stance) stance = f.f1_Stance;
        if (f.f1_DOB) dob = f.f1_DOB;
      } else {
        if (f.f2_Height_cm) height = f.f2_Height_cm;
        if (f.f2_Weight_kg) weight = f.f2_Weight_kg;
        if (f.f2_Reach_cm) reach = f.f2_Reach_cm;
        if (f.f2_Stance) stance = f.f2_Stance;
        if (f.f2_DOB) dob = f.f2_DOB;
      }

      // Record
      if (f.winner === selectedFighter) {
        wins++;
      } else if (f.winner === 'Draw' || f.winner === 'No Contest' || f.winner === '') {
        draws++;
      } else {
        losses++;
      }
    });

    return {
      name: selectedFighter,
      record: `${wins}-${losses}-${draws}`,
      height,
      weight,
      reach,
      stance,
      dob,
      totalFights: fighterFights.length,
      history: fighterFights
    };
  }, [selectedFighter, fights]);

  // Tab 1 (Resumen) Calculations
  const stats = useMemo(() => {
    if (fights.length === 0) return null;

    const totalFights = fights.length;
    const titleFights = fights.filter(f => f.is_title_fight).length;
    
    // Victory Methods
    const methods: Record<string, number> = {};
    fights.forEach(f => {
      const m = f.method || 'Otros';
      methods[m] = (methods[m] || 0) + 1;
    });

    const pieData = Object.keys(methods).map(key => ({
      name: key,
      value: methods[key]
    })).sort((a, b) => b.value - a.value);

    // Divisions
    const divs: Record<string, number> = {};
    fights.forEach(f => {
      const d = f.weight_class || 'Otros';
      divs[d] = (divs[d] || 0) + 1;
    });

    const barData = Object.keys(divs).map(key => ({
      name: key,
      value: divs[key]
    })).sort((a, b) => b.value - a.value).slice(0, 8); // Top 8 active divisions

    const koCount = fights.filter(f => f.method?.includes('KO/TKO')).length;
    const subCount = fights.filter(f => f.method?.includes('Submission')).length;
    const decCount = fights.filter(f => f.method?.includes('Decision') || f.method?.includes('Decisión')).length;

    return {
      totalFights,
      titleFights,
      koPercent: ((koCount / totalFights) * 100).toFixed(1),
      subPercent: ((subCount / totalFights) * 100).toFixed(1),
      decPercent: ((decCount / totalFights) * 100).toFixed(1),
      pieData,
      barData
    };
  }, [fights]);

  // Tab 2 Filters logic
  const filteredFights = useMemo(() => {
    return fights.filter(f => {
      const matchesSearch = 
        f.fighter_1.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.fighter_2.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.event_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDivision = filterDivision ? f.weight_class === filterDivision : true;
      const matchesTitle = filterTitleFight === 'yes' ? f.is_title_fight : (filterTitleFight === 'no' ? !f.is_title_fight : true);

      return matchesSearch && matchesDivision && matchesTitle;
    });
  }, [fights, searchQuery, filterDivision, filterTitleFight]);

  // Handle pagination change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const COLORS = ['#d32f2f', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#aaa'];

  return (
    <ThemeProvider theme={ufcTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
        
        {/* Header */}
        <Box sx={{ borderBottom: '1px solid #222222', p: 2 }}>
          <HeaderUI />
        </Box>

        {/* Loading and Error States */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: 3 }}>
            <CircularProgress color="primary" size={60} />
            <Typography variant="h6" color="text.secondary">
              Cargando datos históricos de la UFC desde Firestore...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, flexGrow: 1, maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <AlertUI description={error} />
            <Typography variant="body1" sx={{ mt: 3, color: 'text.secondary' }}>
              Asegúrate de que:
              <br />1. Creaste y configuraste el archivo <code>firebase-key.json</code> en la raíz.
              <br />2. Creaste la base de datos de <strong>Firestore Database</strong> en tu consola de Firebase.
              <br />3. Corriste el comando: <code>node scripts/seedFirestore.cjs</code> en tu terminal para poblar los datos.
            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={refetch}>
              Reintentar Conexión
            </Button>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, p: 3 }}>
            
            {/* Tabs Selector */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={(_e, v) => setTabValue(v)} 
                textColor="primary" 
                indicatorColor="primary" 
                centered
              >
                <Tab label="Resumen y Estadísticas" sx={{ fontWeight: 'bold', fontSize: '15px' }} />
                <Tab label="Combates Históricos" sx={{ fontWeight: 'bold', fontSize: '15px' }} />
                <Tab label="Perfiles de Peleadores" sx={{ fontWeight: 'bold', fontSize: '15px' }} />
              </Tabs>
            </Box>

            {/* TAB 1: RESUMEN Y ESTADISTICAS */}
            {tabValue === 0 && stats && (
              <Box>
                {/* Metrics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderLeft: '4px solid #ffffff' }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                          Total de Peleas
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                          {stats.totalFights}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Combates en base de datos
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderLeft: '4px solid #d32f2f' }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                          % KO / TKO
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: '#d32f2f' }}>
                          {stats.koPercent}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Victorias por la vía rápida
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderLeft: '4px solid #388e3c' }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                          % Sumisión
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: '#388e3c' }}>
                          {stats.subPercent}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Victorias por llave/rendición
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderLeft: '4px solid #f57c00' }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                          Peleas de Título
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: '#f57c00' }}>
                          {stats.titleFights}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Combates de campeonato mundial
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Recharts Graphics */}
                <Grid container spacing={4}>
                  {/* Pie Chart Methods */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2, height: '400px' }}>
                      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Distribución de Métodos de Victoria (Donut Chart)
                      </Typography>
                      <ResponsiveContainer width="100%" height="88%">
                        <PieChart>
                          <Pie
                            data={stats.pieData.slice(0, 5)} // Top 5 methods
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${percent !== undefined ? (percent * 100).toFixed(0) : 0}%)`}
                          >
                            {stats.pieData.slice(0, 5).map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', color: '#fff' }} 
                            formatter={(value) => [`${value} combates`, 'Frecuencia']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Grid>

                  {/* Bar Chart Weight Classes */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2, height: '400px' }}>
                      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Top 8 Divisiones de Peso más Activas (Bar Chart)
                      </Typography>
                      <ResponsiveContainer width="100%" height="88%">
                        <BarChart
                          data={stats.barData}
                          margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                          <XAxis dataKey="name" stroke="#ffffff" tick={{ fill: '#ffffff', fontSize: 11 }} />
                          <YAxis stroke="#ffffff" tick={{ fill: '#ffffff', fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', color: '#fff' }} 
                            formatter={(value) => [`${value} combates`, 'Peleas registradas']}
                          />
                          <Bar dataKey="value" fill="#d32f2f">
                            {stats.barData.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#d32f2f' : '#b71c1c'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* TAB 2: COMBATES HISTORICOS */}
            {tabValue === 1 && (
              <Box>
                {/* Search & Filters */}
                <Card sx={{ p: 3, mb: 3 }}>
                  <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Buscar por peleador o evento"
                        placeholder="Ej. Jon Jones..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(0);
                        }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DivisionSelector 
                        value={filterDivision} 
                        divisions={divisions} 
                        onOptionSelect={(val) => {
                          setFilterDivision(val);
                          setPage(0);
                        }} 
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="title-filter-label">Pelea de Título</InputLabel>
                        <Select
                          labelId="title-filter-label"
                          id="title-filter"
                          value={filterTitleFight}
                          label="Pelea de Título"
                          onChange={(e) => {
                            setFilterTitleFight(e.target.value);
                            setPage(0);
                          }}
                        >
                          <MenuItem value=""><em>Todos los combates</em></MenuItem>
                          <MenuItem value="yes">Sólo peleas de campeonato</MenuItem>
                          <MenuItem value="no">Sin peleas de campeonato</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Card>

                {/* Fights Table */}
                <TableContainer component={Paper}>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell sx={{ fontWeight: 'bold' }}>Evento</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Peleador 1</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Peleador 2</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Ganador</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Método</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Asalto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredFights
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((fight) => {
                          const isExpanded = expandedFightId === fight.id;
                          return (
                            <React.Fragment key={fight.id}>
                              <TableRow hover sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer' }} onClick={() => setExpandedFightId(isExpanded ? null : fight.id)}>
                                <TableCell>
                                  <IconButton size="small">
                                    {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                  </IconButton>
                                </TableCell>
                                <TableCell sx={{ fontWeight: fight.is_title_fight ? 'bold' : 'normal' }}>
                                  {fight.event_name}
                                  {fight.is_title_fight && (
                                    <Chip label="Cinturón" size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: '10px', fontWeight: 'bold' }} />
                                  )}
                                </TableCell>
                                <TableCell>{fight.event_date}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <img src={getFighterFlagUrl(fight.fighter_1, fight.event_location)} width="18" alt="flag" style={{ border: '1px solid #333' }} />
                                    {fight.fighter_1}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <img src={getFighterFlagUrl(fight.fighter_2, fight.event_location)} width="18" alt="flag" style={{ border: '1px solid #333' }} />
                                    {fight.fighter_2}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                  {fight.winner === 'Draw' ? 'Empate' : (fight.winner === 'No Contest' ? 'Sin resultado' : fight.winner)}
                                </TableCell>
                                <TableCell>
                                  <Chip label={fight.method} size="small" variant="outlined" color="primary" sx={{ fontSize: '11px' }} />
                                </TableCell>
                                <TableCell>{fight.round_num}</TableCell>
                              </TableRow>

                              {/* Expanded Row Details */}
                              <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ margin: 2, p: 2, backgroundColor: '#16171d', borderRadius: 1 }}>
                                      <Typography variant="h6" gutterBottom component="div" sx={{ color: 'primary.main', fontSize: '15px' }}>
                                        Estadísticas y Detalles del Combate
                                      </Typography>
                                      
                                      <Grid container spacing={3} sx={{ mt: 1 }}>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                          <Card variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                              {fight.fighter_1}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                              <strong>Guardia:</strong> {fight.f1_Stance || 'Orthodox'}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Física:</strong> Altura {fight.f1_Height_cm} cm | Peso {fight.f1_Weight_kg} kg | Alcance {fight.f1_Reach_cm} cm
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                              <strong>Golpes Conectados:</strong> {fight.f1_Sig_str_landed} / {fight.f1_Sig_str_attempted}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Derribos:</strong> {fight.f1_Td_landed} / {fight.f1_Td_attempted}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Tiempo Control:</strong> {fight.f1_Ctrl}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Knockdowns (KD):</strong> {fight.f1_KD}
                                            </Typography>
                                          </Card>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 4 }}>
                                          <Card variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                              {fight.fighter_2}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                              <strong>Guardia:</strong> {fight.f2_Stance || 'Orthodox'}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Física:</strong> Altura {fight.f2_Height_cm} cm | Peso {fight.f2_Weight_kg} kg | Alcance {fight.f2_Reach_cm} cm
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                              <strong>Golpes Conectados:</strong> {fight.f2_Sig_str_landed} / {fight.f2_Sig_str_attempted}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Derribos:</strong> {fight.f2_Td_landed} / {fight.f2_Td_attempted}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Tiempo Control:</strong> {fight.f2_Ctrl}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Knockdowns (KD):</strong> {fight.f2_KD}
                                            </Typography>
                                          </Card>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 4 }}>
                                          <Card variant="outlined" sx={{ p: 2, backgroundColor: 'background.default', height: '100%' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                              Detalles de Finalización
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                              <strong>Método Oficial:</strong> {fight.method}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Ronda Final:</strong> Ronda {fight.round_num} de {fight.round_num > 3 ? 5 : 3}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Tiempo del Final:</strong> {fight.time} en asalto {fight.round_num}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                              <strong>Ubicación del Evento:</strong> {fight.event_location}
                                            </Typography>
                                          </Card>
                                        </Grid>
                                      </Grid>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={filteredFights.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                />
              </Box>
            )}

            {/* TAB 3: PERFILES DE PELEADORES */}
            {tabValue === 2 && (
              <Box>
                {/* Autocomplete Selector */}
                <Card sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Búsqueda Detallada de Peleadores (Fichas Técnicas)
                  </Typography>
                  <Autocomplete
                    options={uniqueFighters}
                    value={selectedFighter}
                    onChange={(_event, newValue) => setSelectedFighter(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Ingresa el nombre del peleador" variant="outlined" placeholder="Ej. Alex Pereira" />
                    )}
                    fullWidth
                  />
                </Card>

                {/* Profile Card */}
                {fighterProfile ? (
                  <Grid container spacing={4}>
                    {/* Left details panel */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                        <Avatar
                          sx={{ 
                            width: 100, 
                            height: 100, 
                            margin: '0 auto', 
                            fontSize: '40px', 
                            fontWeight: 'bold', 
                            backgroundColor: 'primary.main', 
                            color: '#fff',
                            mb: 2 
                          }}
                        >
                          {fighterProfile.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        
                        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <img src={getFighterFlagUrl(fighterProfile.name)} width="24" alt="flag" style={{ border: '1px solid #333' }} />
                          {fighterProfile.name}
                        </Typography>

                        <Chip 
                          label={`Récord: ${fighterProfile.record}`} 
                          color="primary" 
                          sx={{ mt: 1.5, fontWeight: 'bold', fontSize: '14px', px: 1 }} 
                        />

                        <Box sx={{ mt: 4, textAlign: 'left', borderTop: '1px solid #222222', pt: 3 }}>
                          <Typography variant="body1" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Altura:</strong>
                            <span>{fighterProfile.height ? `${fighterProfile.height} cm` : 'N/A'}</span>
                          </Typography>
                          <Typography variant="body1" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Peso:</strong>
                            <span>{fighterProfile.weight ? `${fighterProfile.weight} kg` : 'N/A'}</span>
                          </Typography>
                          <Typography variant="body1" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Alcance:</strong>
                            <span>{fighterProfile.reach ? `${fighterProfile.reach} cm` : 'N/A'}</span>
                          </Typography>
                          <Typography variant="body1" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Guardia:</strong>
                            <span>{fighterProfile.stance}</span>
                          </Typography>
                          <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Nacimiento (DOB):</strong>
                            <span>{fighterProfile.dob || 'N/A'}</span>
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>

                    {/* Right history panel */}
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                            Historial de Peleas ({fighterProfile.totalFights})
                          </Typography>

                          <TableContainer component={Paper} sx={{ maxHeight: 380, border: '1px solid #222222', boxShadow: 'none' }}>
                            <Table stickyHeader size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Resultado</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Oponente</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Evento</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Método</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Asalto</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {fighterProfile.history.map((fight, index) => {
                                  const isF1 = fight.fighter_1 === fighterProfile.name;
                                  const opponent = isF1 ? fight.fighter_2 : fight.fighter_1;
                                  const isWinner = fight.winner === fighterProfile.name;
                                  const isDraw = fight.winner === 'Draw' || fight.winner === 'No Contest' || fight.winner === '';
                                  
                                  return (
                                    <TableRow key={index} hover>
                                      <TableCell>
                                        {isDraw ? (
                                          <Chip label="D / NC" size="small" sx={{ fontWeight: 'bold', fontSize: '10px' }} />
                                        ) : isWinner ? (
                                          <Chip label="Victoria" size="small" color="success" sx={{ fontWeight: 'bold', fontSize: '10px' }} />
                                        ) : (
                                          <Chip label="Derrota" size="small" color="error" sx={{ fontWeight: 'bold', fontSize: '10px' }} />
                                        )}
                                      </TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>{opponent}</TableCell>
                                      <TableCell>{fight.event_name}</TableCell>
                                      <TableCell>{fight.method}</TableCell>
                                      <TableCell align="center">{fight.round_num}</TableCell>
                                      <TableCell>{fight.event_date}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#121212', borderRadius: 2, border: '1px dashed #333' }}>
                    <Typography variant="body1" color="text.secondary">
                      Selecciona un peleador arriba en el buscador para visualizar su ficha técnica y récord de victorias/derrotas.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Caching / Refresh Indicator Footer */}
            <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Datos cargados desde Firebase Firestore. Caché activa localmente en navegador.
              </Typography>
              <Button variant="outlined" color="primary" size="small" onClick={refetch}>
                Sincronizar / Refrescar Datos
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
