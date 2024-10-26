import React from 'react';
import { TableRow, TableCell, Button } from '@mui/material';

const FormRow = ({ form, onSelectForm }) => {
  const handleSelect = () => {
    onSelectForm(form);
  };

  return (
    <TableRow>
      <TableCell>{form.formName}</TableCell>
      <TableCell>{form.formVersion}</TableCell>
      <TableCell>{new Date(form.formDate).toLocaleDateString()}</TableCell>
      <TableCell>
        <Button variant="contained" color="secondary" onClick={handleSelect}>
          Edit
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default FormRow;
