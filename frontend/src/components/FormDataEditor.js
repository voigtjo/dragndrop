import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Checkbox, FormControlLabel, Button } from '@mui/material';

const FormDataEditor = () => {
  const { docID, subjectID, mode } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        if (subjectID === 'new') {
          // Fetch the form structure for the given docID
          const formResponse = await axios.get(`/api/forms/load/${docID}`);
          if (formResponse.data && formResponse.data.formStructure) {
            setDataset({
              docID,
              subject: '', // New dataset requires user to input a subject
              formVersion: formResponse.data.formVersion || 1,
              formData: formResponse.data.formStructure.map((field) => ({
                id: field.id,
                type: field.type,
                label: field.label || '',
                value: '', // Initialize new fields with empty values
              })),
              formDate: new Date(),
            });
          } else {
            console.error('No form structure found for the provided docID');
          }
        } else {
          // Fetch existing dataset
          const response = await axios.get(`/api/formdata/dataset`, {
            params: { docID, subject: subjectID },
          });
          if (response.data) {
            setDataset(response.data);
          } else {
            console.error('No existing dataset found for the provided subject.');
          }
        }
      } catch (err) {
        console.error('Error fetching dataset or form structure:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, [docID, subjectID]);

  const handleSave = async () => {
    try {
      const saveData = dataset.formData.map((field) => ({
        id: field.id,
        type: field.type,
        label: field.label || '',
        value: field.value || '',
      }));

      const payload = {
        docID: dataset.docID,
        subject: dataset.subject,
        formVersion: dataset.formVersion,
        formData: saveData,
        formDate: dataset.formDate || new Date(),
      };

      if (dataset._id) {
        await axios.put(`/api/formdata/${dataset._id}`, payload);
        alert('Dataset updated successfully!');
      } else {
        const response = await axios.post(`/api/formdata/save`, payload);
        alert('New dataset created successfully!');
        navigate(`/formData/docID/${docID}/list`);
      }
    } catch (err) {
      console.error('Error saving dataset:', err);
      alert('Error saving dataset');
    }
  };

  const handleInputChange = (id, value) => {
    setDataset((prevDataset) => ({
      ...prevDataset,
      formData: prevDataset.formData.map((field) =>
        field.id === id ? { ...field, value } : field
      ),
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (!dataset) return <p>No form structure available. Please check the form setup.</p>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {mode === 'view' ? 'View' : 'Edit'} Dataset
      </Typography>

      <TextField
        label="Subject"
        value={dataset.subject}
        onChange={(e) => setDataset({ ...dataset, subject: e.target.value })}
        disabled={mode === 'view'}
        fullWidth
        sx={{ marginBottom: 3 }}
      />

      <Box sx={{ marginTop: 3 }}>
        {dataset.formData.map((field) => (
          <Box key={field.id} sx={{ marginBottom: 2 }}>
            {field.type === 'text' ? (
              <TextField
                label={field.label || 'Text Field'}
                value={field.value || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                fullWidth
                variant="outlined"
                disabled={mode === 'view'}
              />
            ) : field.type === 'checkbox' ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value || false}
                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                    disabled={mode === 'view'}
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

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={mode === 'view'}
        sx={{ marginTop: 3 }}
      >
        Save Dataset
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => navigate(`/formData/docID/${docID}/list`)}
        sx={{ marginTop: 3, marginLeft: 2 }}
      >
        Back to List
      </Button>
    </Box>
  );
};

export default FormDataEditor;
