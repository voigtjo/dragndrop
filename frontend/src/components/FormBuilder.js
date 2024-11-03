import React, { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, Typography, Paper, Grid, Button, TextField, Checkbox, IconButton } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const COMPONENT_TYPES = {
  TEXT: 'text',
  CHECKBOX: 'checkbox',
};

// The draggable components
const DraggableComponent = ({ type, label, name, selectable }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'formElement',
    item: { type, label, name },
    canDrag: () => selectable, // Only allow dragging if selectable flag is true
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <Paper
      ref={selectable ? dragRef : null}
      sx={{ padding: 1, marginBottom: 1, opacity: isDragging ? 0.5 : 1, backgroundColor: selectable ? 'white' : 'lightgrey' }}
    >
      {label ? `${label} (${name})` : 'Form Element'}
    </Paper>
  );
};

// The grid cell where components are dropped
const GridCell = ({ index, component, onDrop, onDelete }) => {
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: 'formElement',
    drop: (item) => onDrop(index, item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const renderComponent = (component) => {
    if (!component) return 'Drop Here';

    return (
      <Box sx={{ padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography>
            {component.label ? `${component.label} (${component.name})` : 'Unnamed Component'}
          </Typography>
          {component.type === COMPONENT_TYPES.TEXT ? (
            <TextField label={component.label || 'Text'} fullWidth disabled />
          ) : (
            <Checkbox disabled />
          )}
        </Box>
        {!component.published && (
          <IconButton color="secondary" onClick={() => onDelete(index)}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    );
  };

  return (
    <Grid item xs={3}>
      <Paper
        ref={dropRef}
        sx={{
          height: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isOver ? 'lightgreen' : 'white',
        }}
      >
        {renderComponent(component)}
      </Paper>
    </Grid>
  );
};

const FormBuilder = ({ selectedForm, setSelectedForm, onFormSaved, setFormName, setFormVersion }) => { 
  const [grid, setGrid] = useState(Array(16).fill(null));
  const [formName, setLocalFormName] = useState('');
  const [lastVersion, setLastVersion] = useState(0);
  const [devVersion, setDevVersion] = useState(0);
  const [published, setPublished] = useState(false);
  const [components, setComponents] = useState([
    { type: COMPONENT_TYPES.TEXT, name: '', label: '', selectable: false },
    { type: COMPONENT_TYPES.CHECKBOX, name: '', label: '', selectable: false },
  ]);

  useEffect(() => {
    if (selectedForm && selectedForm.formStructure) {
      setLocalFormName(selectedForm.formName);
      setPublished(selectedForm.published || false);
      setLastVersion(selectedForm.formVersion || 0);
      setDevVersion(selectedForm.devVersion || 0);
      const updatedGrid = Array(16).fill(null);
      selectedForm.formStructure.forEach((component) => {
        updatedGrid[component.position] = component;
      });
      setGrid(updatedGrid);
    } else {
      setLocalFormName('');
      setPublished(false);
      setLastVersion(0);
      setDevVersion(0);
      setGrid(Array(16).fill(null));
    }
  }, [selectedForm]);

  // Update formName and formVersion in App whenever they change locally
  useEffect(() => {
    setFormName(formName);
    setFormVersion(lastVersion);
  }, [formName, lastVersion, setFormName, setFormVersion]);

  const handleComponentDetailsChange = (index, field, value) => {
    const updatedComponents = [...components];
    updatedComponents[index][field] = value;

    if (updatedComponents[index].name && updatedComponents[index].label) {
      updatedComponents[index].selectable = true;
    } else {
      updatedComponents[index].selectable = false;
    }

    setComponents(updatedComponents);
  };

  const handleDeleteComponent = (index) => {
    const updatedGrid = [...grid];
    updatedGrid[index] = null;
    setGrid(updatedGrid);
  };

  const handleDrop = (index, item) => {
    if (published) return;
    const newGrid = [...grid];
    newGrid[index] = {
      ...item,
      id: uuidv4(),
      position: index,
      name: item.name || 'Unnamed',
      label: item.label || 'Unlabeled',
    };
    setGrid(newGrid);
  };

  const handleSaveForm = async () => {
    if (!formName) {
      alert('Please enter a form name');
      return;
    }

    const formStructure = grid
      .filter((cell) => cell !== null)
      .map((cell) => ({
        id: cell.id,
        type: cell.type,
        position: cell.position,
        name: cell.name || '',
        label: cell.label || '',
      }));

    try {
      const response = await axios.post('/api/forms/save', {
        formName,
        formStructure,
      });
      setDevVersion(response.data.devVersion);
      setPublished(false);
      alert('Form saved successfully!');
      onFormSaved();
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form');
    }
  };

  const handlePublishForm = async () => {
    try {
      const response = await axios.post('/api/forms/publish', { formName });
      setPublished(true);
      setLastVersion(response.data.formVersion);
      setDevVersion(0);
      alert('Form published successfully!');
    } catch (error) {
      console.error('Error publishing form:', error);
      alert('Error publishing form');
    }
  };

  const handleClearForm = () => {
    setLocalFormName('');            // Clear form name
    setPublished(false);             // Reset published status
    setLastVersion(0);               // Reset version numbers
    setDevVersion(0);
    setGrid(Array(16).fill(null));   // Clear the grid
    setSelectedForm(null);           // Reset selected form
    alert('Form cleared successfully!');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Form Builder
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
          <Grid item xs={6}>
            <TextField
              label="Form Name"
              value={formName}
              onChange={(e) => setLocalFormName(e.target.value)}
              fullWidth
              sx={{ marginBottom: 3 }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1">Version: {lastVersion}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1">Dev Version: {devVersion}</Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {grid.map((component, index) => (
            <GridCell
              key={index}
              index={index}
              component={component}
              onDrop={handleDrop}
              onDelete={handleDeleteComponent}
            />
          ))}
        </Grid>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ marginBottom: 2 }}>
            Add Form Elements
          </Typography>
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            {components.map((component, index) => (
              <Grid key={index} container spacing={2}>
                <Grid item xs={3}>
                  <Typography>{component.type}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Component Name"
                    value={component.name}
                    onChange={(e) => handleComponentDetailsChange(index, 'name', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Component Label"
                    value={component.label}
                    onChange={(e) => handleComponentDetailsChange(index, 'label', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <DraggableComponent
                    type={component.type}
                    label={component.label}
                    name={component.name}
                    selectable={component.selectable}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button variant="contained" color="primary" onClick={handleSaveForm} disabled={published}>
              Save Form
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleClearForm}>
              Clear Form
            </Button>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="success"
              onClick={handlePublishForm}
              disabled={published || !selectedForm} // Disable if already published or no form is selected
            >
              Publish Form
            </Button>
          </Box>
        </Box>
      </Box>
    </DndProvider>
  );
};

export default FormBuilder;
