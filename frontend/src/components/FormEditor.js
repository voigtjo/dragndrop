// components/FormEditor.js

import React, { useEffect, useState } from 'react';
import { Box, Grid, TextField, Checkbox, Button } from '@mui/material';
import axios from 'axios';

const FormEditor = ({ selectedForm }) => {
  const [formStructure, setFormStructure] = useState([]);

  // Load the form structure from the selectedForm
  useEffect(() => {
    if (selectedForm && selectedForm.formStructure) {
      setFormStructure(selectedForm.formStructure);
    }
  }, [selectedForm]);

  // Handle saving form data (entered by the user)
  const handleSaveFormData = async () => {
    const formData = formStructure.map((component) => ({
      id: component.id,
      type: component.type,
      value: component.value || '', // Capture entered values
    }));
  
    // Log the request payload
    console.log('Sending form data:', {
      formName: selectedForm.formName,
      formVersion: selectedForm.formVersion,
      formData,
    });
  
    try {
      const response = await axios.post('/api/formdata/save', {
        formName: selectedForm.formName,
        formVersion: selectedForm.formVersion,
        formData,
        formDate: selectedForm.formDate, // Make sure formDate is sent if required
        dataName: 'DataName', // Ensure a valid dataName is provided
      });
  
      // Log the response
      console.log('Form data saved successfully:', response.data);
      alert('Form data saved successfully!');
    } catch (error) {
      // Log the error for better debugging
      console.error('Error saving form data:', error.response ? error.response.data : error.message);
      alert('Error saving form data');
    }
  };

  // Handle input change for form elements
  const handleInputChange = (id, value) => {
    const updatedFormStructure = formStructure.map((component) => {
      if (component.id === id) {
        return { ...component, value };
      }
      return component;
    });
    setFormStructure(updatedFormStructure);
  };

  // Render the form layout based on the structure
  const renderComponent = (component) => {
    switch (component.type) {
      case 'text':
        return (
          <TextField
            key={component.id}
            label={component.label}
            value={component.value || ''}
            onChange={(e) => handleInputChange(component.id, e.target.value)}
            fullWidth
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            key={component.id}
            checked={component.value || false}
            onChange={(e) => handleInputChange(component.id, e.target.checked)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Grid container spacing={2}>
        {formStructure.map((component) => (
          <Grid key={component.id} item xs={3}>
            {renderComponent(component)}
          </Grid>
        ))}
      </Grid>

      <Button variant="contained" color="primary" onClick={handleSaveFormData} sx={{ marginTop: 2 }}>
        Save Form Data
      </Button>
    </Box>
  );
};

export default FormEditor;
