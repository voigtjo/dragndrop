import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'; // Add Navigate for redirection
import { Box } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DevHeader from './components/DevHeader';
import ProdHeader from './components/ProdHeader';
import FormBuilder from './components/FormBuilder';
import FormList from './components/FormList';
import FormEditor from './components/FormEditor';
import FormDataList from './components/FormDataList'; // Add new component
import FormDataEditor from './components/FormDataEditor'; // Add new component

const App = () => {
  const [isAdmin, setIsAdmin] = React.useState(true);
  const [selectedForm, setSelectedForm] = React.useState(null);
  const [formSaved, setFormSaved] = React.useState(false);
  const [formName, setFormName] = React.useState('');
  const [formVersion, setFormVersion] = React.useState(0);
  const [docID, setDocID] = React.useState(''); // Add docID state

  const handleFormSaved = () => setFormSaved(!formSaved);

  const handleFormSelect = (form) => {
    setSelectedForm(form);
    setFormName(form?.formName || '');
    setFormVersion(form?.formVersion || 0);
    setDocID(form?.docID || '');
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
                docID={docID} // Pass docID to DevHeader
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
                ) : selectedForm ? (
                  <FormEditor selectedForm={selectedForm} />
                ) : (
                  <p>Select a form from Admin mode to view it in Execution Mode.</p>
                )}
              </Box>
            </DndProvider>
          }
        />

        {/* Routes for form data list and editor */}
        <Route path="/formData/docID/:docID/list" element={<FormDataList />} />
        <Route
          path="/formData/docID/:docID/subject/:subjectID/:mode"
          element={<FormDataEditor />}
        />

        {/* Other routes */}
        <Route path="/prod" element={<ProdHeader />} />

        {/* Default route redirects to /dev */}
        <Route path="/" element={<Navigate to="/dev" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
