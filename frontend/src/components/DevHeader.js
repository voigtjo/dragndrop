import React from 'react';
import { Button } from '@mui/material';

function DevHeader({ isAdmin, setIsAdmin, formName, formVersion, docID }) {

  // Function to open the form data list in a new tab
  const handleShowData = () => {
    if (docID) {
      window.open(`/formData/docID/${docID}/list`, '_blank'); // Show form data list based on docID
    } else {
      alert('Please ensure the form has a valid Document ID (docID).');
    }
  };

  return (
    <header
      style={{
        backgroundColor: 'lightpink',
        padding: '10px',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >

      <Button
        variant="contained"
        color="secondary"
        onClick={handleShowData} // Opens the form data list in a new tab
      >
        Show Data
      </Button>
      <Button onClick={() => window.open('/prod', '_blank')}>Switch to PROD</Button>
    </header>
  );
}

export default DevHeader;
