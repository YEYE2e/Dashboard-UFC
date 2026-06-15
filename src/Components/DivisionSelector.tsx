import { FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent } from '@mui/material';

interface DivisionSelectorProps {
  value: string;
  divisions: string[];
  onOptionSelect: (division: string) => void;
}

export default function DivisionSelector({ value, divisions, onOptionSelect }: DivisionSelectorProps) {
  const handleChange = (e: SelectChangeEvent<string>) => {
    onOptionSelect(e.target.value);
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="div-filter-label">División de Peso</InputLabel>
      <Select
        labelId="div-filter-label"
        id="div-filter"
        value={value}
        label="División de Peso"
        onChange={handleChange}
      >
        <MenuItem value=""><em>Todas las divisiones</em></MenuItem>
        {divisions.map((d, index) => (
          <MenuItem key={index} value={d}>{d}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
