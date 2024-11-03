// components/FormDataViewer.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, TextField, Checkbox, FormControlLabel, Button } from '@mui/material';

const FormDataViewer = () => {
  const { formName, formVersion } = useParams();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setError(null);
        setLoading(true);

        const response = await axios.get('/api/formdata', {
          params: { formName, formVersion },
        });
        setFormData(response.data);
      } catch (err) {
        setError('Error loading form data');
        console.error('Error fetching form data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [formName, formVersion]);

  // Handle saving form data
  const handleSaveFormData = async () => {
    try {
      const saveData = formData.formData.map((field) => ({
        id: field.id,
        type: field.type,
        value: field.value || '',
      }));

      // Check if the formData has an _id for update, otherwise create new
      if (formData._id) {
        // Update existing dataset
        await axios.put(`/api/formdata/${formData._id}`, {
          formName,
          formVersion,
          formData: saveData,
          formDate: formData.formDate,
          dataName: formData.dataName || 'DefaultDataName',
        });
        alert('Form data updated successfully!');
      } else {
        // Create new dataset
        await axios.post('/api/formdata/save', {
          formName,
          formVersion,
          formData: saveData,
          formDate: formData.formDate,
          dataName: formData.dataName || 'DefaultDataName',
        });
        alert('Form data saved successfully!');
      }
    } catch (error) {
      console.error('Error saving form data:', error);
      alert('Error saving form data');
    }
  };

  // Handle input change for text fields and checkboxes
  const handleInputChange = (id, value) => {
    setFormData((prevData) => ({
      ...prevData,
      formData: prevData.formData.map((field) =>
        field.id === id ? { ...field, value } : field
      ),
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!formData) return <p>No data available for this form.</p>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Form Data for {formData.formName} (Version: {formData.formVersion})
      </Typography>

      {/* Display ObjectId as a non-editable field */}
      {formData._id && (
        <TextField
          label="Dataset ID (ObjectId)"
          value={formData._id}
          fullWidth
          InputProps={{ readOnly: true }}
          variant="outlined"
          sx={{ marginBottom: 3 }}
        />
      )}

      <Box sx={{ marginTop: 3 }}>
        {formData.formData.map((field) => (
          <Box key={field.id} sx={{ marginBottom: 2 }}>
            {field.type === 'text' ? (
              <TextField
                label="Text Field"
                value={field.value || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                fullWidth
                variant="outlined"
              />
            ) : field.type === 'checkbox' ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value || false}
                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                  />
                }
                label="Checkbox Field"
              />
            ) : (
              <Typography>Unknown field type: {field.type}</Typography>
            )}
          </Box>
        ))}
      </Box>

      <Button variant="contained" color="primary" onClick={handleSaveFormData} sx={{ marginTop: 3 }}>
        Save Form Data
      </Button>
    </Box>
  );
};

export default FormDataViewer;
