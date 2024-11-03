import React from 'react';
import { Button } from '@mui/material';

function DevHeader({ isAdmin, setIsAdmin }) {
  return (
    <header style={{ backgroundColor: 'lightpink', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsAdmin(!isAdmin)}
      >
        Switch to {isAdmin ? 'Execution Mode' : 'Admin Mode'}
      </Button>
      <Button onClick={() => window.open('/prod', '_blank')}>Switch to PROD</Button>
    </header>
  );
}

export default DevHeader;
