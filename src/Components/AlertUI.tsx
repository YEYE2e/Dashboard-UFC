import Alert from '@mui/material/Alert';

interface AlertConfig {
  description: string;
}

export default function AlertUI(config: AlertConfig) {
  return (
    <Alert 
      variant="outlined" 
      severity="info"
      sx={{ width: '100%' }}
    >
      {config.description}
    </Alert>
  );
}
