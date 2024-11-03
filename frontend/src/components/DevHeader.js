import React from 'react';
import { Button } from '@mui/material';

function DevHeader({ isAdmin, setIsAdmin, formName, formVersion }) {
  // Function to open the form editing in a new tab
  const handleSwitchToExecution = () => {
    if (formName && formVersion) {
      window.open(`/view/${formName}/${formVersion}`, '_blank');
    } else {
      alert('Please ensure both form name and version are set.');
    }
  };

  return (
    <header style={{ backgroundColor: 'lightpink', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSwitchToExecution} // Opens in a new tab
      >
        Switch to Execution Mode
      </Button>
      <Button onClick={() => window.open('/prod', '_blank')}>Switch to PROD</Button>
    </header>
  );
}

export default DevHeader;
