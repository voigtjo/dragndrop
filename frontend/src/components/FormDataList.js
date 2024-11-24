import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Typography } from '@mui/material';

const FormDataList = () => {
  const { docID } = useParams();
  const [datasets, setDatasets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/formdata?docID=${docID}`);
        setDatasets(response.data);
      } catch (err) {
        console.error('Error fetching datasets:', err);
      }
    };

    fetchData();
  }, [docID]);

  return (
    <div>
      <Typography variant="h4">Datasets for DocID: {docID}</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Subject</TableCell>
            <TableCell>Form Version</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {datasets.map((dataset) => (
            <TableRow key={dataset._id}>
              <TableCell>{dataset.subject}</TableCell>
              <TableCell>{dataset.formVersion}</TableCell>
              <TableCell>
                <Button onClick={() => navigate(`/formData/docID/${docID}/subject/${dataset.subject}/view`)}>View</Button>
                <Button onClick={() => navigate(`/formData/docID/${docID}/subject/${dataset.subject}/edit`)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => navigate(`/formData/docID/${docID}/subject/new/edit`)}>Add New</Button>
    </div>
  );
};

export default FormDataList;
