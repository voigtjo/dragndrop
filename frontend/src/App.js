import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import FormBuilder from './components/FormBuilder';
import FormList from './components/FormList';
import FormEditor from './components/FormEditor';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formSaved, setFormSaved] = useState(false); // State to trigger form list reload

  // Handle form save, which will trigger a reload of the form list
  const handleFormSaved = () => {
    setFormSaved(!formSaved); // Toggle the state to reload form list after save
  };

  // Handle form selection (for editing or execution)
  const handleFormSelect = (form) => {
    setSelectedForm(form); // Pass the selected form to either FormBuilder or FormEditor
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ padding: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsAdmin(!isAdmin)}
          sx={{ marginBottom: 2 }}
        >
          Switch to {isAdmin ? 'Execution Mode' : 'Admin Mode'}
        </Button>

        {isAdmin ? (
          <>
            <FormBuilder 
              isAdmin={isAdmin} 
              selectedForm={selectedForm} // Pass selected form for editing
              onFormSaved={handleFormSaved} // Callback for reloading the form list after saving
            />
            <FormList 
              onSelectForm={handleFormSelect} // Select form for editing or execution
              onFormSaved={formSaved} // Trigger re-fetch when form is saved
            />
          </>
        ) : (
          selectedForm && <FormEditor selectedForm={selectedForm} />
        )}
      </Box>
    </DndProvider>
  );
};

export default App;
