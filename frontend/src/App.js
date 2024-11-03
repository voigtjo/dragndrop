import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import FormDataViewer from './components/FormDataViewer'; // Import FormDataViewer
import FormBuilder from './components/FormBuilder';
import FormList from './components/FormList';
import FormEditor from './components/FormEditor';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DevHeader from './components/DevHeader';
import ProdHeader from './components/ProdHeader';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import axios from 'axios';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formSaved, setFormSaved] = useState(false);
  const [formName, setFormName] = useState('');
  const [formVersion, setFormVersion] = useState(0);

  // Handle form save, which will trigger a reload of the form list
  const handleFormSaved = () => {
    setFormSaved(!formSaved);
  };

  // Handle form selection (for editing or execution)
  const handleFormSelect = (form) => {
    setSelectedForm(form);
  };

  // Load form data based on formName and formVersion
  const FormEditorLoader = () => {
    const { formName, formVersion } = useParams();
    const [formData, setFormData] = useState(null);

    useEffect(() => {
      // Fetch data from MongoDB using formName and formVersion
      const fetchFormData = async () => {
        try {
          const response = await axios.get(`/api/formdata`, {
            params: { formName, formVersion }
          });
          setFormData(response.data);
        } catch (error) {
          console.error("Error loading form data:", error);
        }
      };
      fetchFormData();
    }, [formName, formVersion]);

    return formData ? (
      <FormEditor selectedForm={formData} />
    ) : (
      <p>Loading form data...</p>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Dev environment route */}
        <Route
          path="/dev"
          element={
            <DndProvider backend={HTML5Backend}>
              <DevHeader
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
                formName={formName}
                formVersion={formVersion}
              />
              <Box sx={{ padding: 3 }}>
                {isAdmin ? (
                  <>
                    <FormBuilder
                      isAdmin={isAdmin}
                      selectedForm={selectedForm}
                      setSelectedForm={setSelectedForm}
                      onFormSaved={handleFormSaved}
                      setFormName={setFormName}
                      setFormVersion={setFormVersion}
                    />
                    <FormList
                      onSelectForm={handleFormSelect}
                      onFormSaved={formSaved}
                    />
                  </>
                ) : (
                  selectedForm ? (
                    <FormEditor selectedForm={selectedForm} />
                  ) : (
                    <p>Select a form from Admin mode to view it in Execution Mode.</p>
                  )
                )}
              </Box>
            </DndProvider>
          }
        />

        {/* Route to edit a specific form by name and version */}
        <Route path="/dev/:formName/:formVersion" element={<FormEditorLoader />} />

        {/* Prod environment route */}
        <Route path="/prod" element={<ProdHeader />} />

        {/* Default route redirects to /prod */}
        <Route path="/" element={<ProdHeader />} />
        <Route path="/view/:formName/:formVersion" element={<FormDataViewer />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
