import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Paper } from '@mui/material';

const FormList = ({ onSelectForm, onFormSaved }) => {
  const [forms, setForms] = useState([]);

  // Fetch form list
  const fetchForms = async () => {
    try {
      const response = await axios.get('/api/forms/list');
      setForms(response.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      alert('Error fetching forms');
    }
  };

  // Fetch form by formName when the "Edit" button is clicked
  const fetchFormByName = async (formName) => {
    try {
      const response = await axios.get(`/api/forms/getByName/${formName}`);
      onSelectForm(response.data); // Pass the full form data (including formStructure) to the parent
    } catch (error) {
      console.error('Error fetching form by name:', error);
      alert('Error fetching form by name');
    }
  };

  useEffect(() => {
    fetchForms(); // Load forms on component mount
  }, []);

  useEffect(() => {
    if (onFormSaved) {
      fetchForms(); // Reload forms when a form is saved
    }
  }, [onFormSaved]);

  return (
    <Paper sx={{ padding: 3, marginTop: 3 }}>
      <h2>Forms List</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Form Name</TableCell>
            <TableCell>Version</TableCell>
            <TableCell>Dev Version</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form._id}>
              <TableCell>{form.formName}</TableCell>
              <TableCell>{form.formVersion}</TableCell>
              <TableCell>{form.devVersion}</TableCell>
              <TableCell>{new Date(form.formDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => fetchFormByName(form.formName)} // Fetch the form by formName
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default FormList;
