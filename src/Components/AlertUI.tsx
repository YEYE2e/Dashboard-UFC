import Alert from '@mui/material/Alert';

interface AlertConfig {
  description: string;
}

export default function AlertUI(config: AlertConfig) {
  return (
    <Alert 
      variant="outlined" 
      severity="error"
      className="ufc-alert-custom"
    >
      {config.description}
    </Alert>
  );
}
