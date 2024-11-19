import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, TextField, Checkbox, FormControlLabel, Button } from '@mui/material';

const DEFAULT_FORM_STRUCTURE = [
  { id: 'text1', type: 'text', label: 'Default Text Field', value: '' },
  { id: 'checkbox1', type: 'checkbox', label: 'Default Checkbox Field', value: false },
];

const FormDataViewer = () => {
  const { formName, formVersion } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('/api/formdata', {
          params: { formName, formVersion },
        });

        console.log('Fetched Data:', response.data);

        // Check if formData exists
        if (response.data.formData && response.data.formData.length > 0) {
          setFormData(response.data);
        } else {
          console.log('No existing form data found. Returning default structure.');
          setFormData({
            formName,
            formVersion,
            formData: DEFAULT_FORM_STRUCTURE,
          });
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.log('No data found. Initializing with default structure.');
          setFormData({
            formName,
            formVersion,
            formData: DEFAULT_FORM_STRUCTURE,
          });
        } else {
          setError('Error loading form data');
          console.error('Error fetching form data:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [formName, formVersion]);

  const handleSaveFormData = async () => {
    try {
      const saveData = formData.formData.map((field) => ({
        id: field.id,
        type: field.type,
        value: field.value || '',
      }));

      if (formData._id) {
        await axios.put(`/api/formdata/${formData._id}`, {
          formName,
          formVersion,
          formData: saveData,
          formDate: formData.formDate,
          dataName: formData.dataName || 'DefaultDataName',
        });
        alert('Form data updated successfully!');
      } else {
        await axios.post('/api/formdata/save', {
          formName,
          formVersion,
          formData: saveData,
          formDate: new Date(),
          dataName: 'NewDataEntry',
        });
        alert('Form data saved successfully!');
      }
    } catch (error) {
      console.error('Error saving form data:', error);
      alert('Error saving form data');
    }
  };

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
  if (!formData || !formData.formData) return <p>No form data available.</p>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Form Data for {formData.formName} (Version: {formData.formVersion})
      </Typography>

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
                label={field.label || 'Text Field'}
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
                label={field.label || 'Checkbox Field'}
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
