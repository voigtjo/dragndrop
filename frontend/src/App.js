import React, { useState } from 'react';
import { Box } from '@mui/material';
import FormBuilder from './components/FormBuilder';
import FormList from './components/FormList';
import FormEditor from './components/FormEditor';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DevHeader from './components/DevHeader';
import ProdHeader from './components/ProdHeader';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formSaved, setFormSaved] = useState(false);

  // Handle form save, which will trigger a reload of the form list
  const handleFormSaved = () => {
    setFormSaved(!formSaved);
  };

  // Handle form selection (for editing or execution)
  const handleFormSelect = (form) => {
    setSelectedForm(form);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Dev environment route */}
        <Route
          path="/dev"
          element={
            <DndProvider backend={HTML5Backend}>
              <DevHeader isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
              <Box sx={{ padding: 3 }}>
                {isAdmin ? (
                  <>
                    <FormBuilder
                      isAdmin={isAdmin}
                      selectedForm={selectedForm}
                      setSelectedForm={setSelectedForm} // Pass setSelectedForm as a prop
                      onFormSaved={handleFormSaved}
                    />

                    <FormList
                      onSelectForm={handleFormSelect}
                      onFormSaved={formSaved}
                    />
                  </>
                ) : (
                  // Show FormEditor when in execution mode and a form is selected
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

        {/* Prod environment route */}
        <Route path="/prod" element={<ProdHeader />} />

        {/* Default route redirects to /prod */}
        <Route path="/" element={<ProdHeader />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
