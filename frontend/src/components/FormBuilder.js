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
const GridCell = ({ index, component, onDrop, onDelete, onEdit }) => {
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

const FormBuilder = ({ isAdmin, selectedForm, onFormSaved }) => {
  const [grid, setGrid] = useState(Array(16).fill(null)); // 4x4 grid with 16 cells
  const [formName, setFormName] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Status label flag
  const [lastVersion, setLastVersion] = useState(0); // Track last version
  const [published, setPublished] = useState(false); // Published status
  const [components, setComponents] = useState([
    { type: COMPONENT_TYPES.TEXT, name: '', label: '', selectable: false },
    { type: COMPONENT_TYPES.CHECKBOX, name: '', label: '', selectable: false },
  ]);

  // When a form is selected, load its structure
  useEffect(() => {
    if (selectedForm && selectedForm.formStructure) {
      setFormName(selectedForm.formName);
      setIsEditing(true); // Set status to Edit mode
      setPublished(selectedForm.published || false); // Set published status
      setLastVersion(selectedForm.formVersion || 0); // Set last version
      const updatedGrid = Array(16).fill(null);
      selectedForm.formStructure.forEach((component) => {
        updatedGrid[component.position] = component;
      });
      setGrid(updatedGrid);
    } else {
      setFormName('');
      setIsEditing(false); // Set status to New mode
      setPublished(false); // New forms are not published
      setLastVersion(0); // New form starts with version 0
      setGrid(Array(16).fill(null)); // Reset the grid
    }
  }, [selectedForm]);

  // Handle changes to component name and label
  const handleComponentDetailsChange = (index, field, value) => {
    const updatedComponents = [...components];
    updatedComponents[index][field] = value;

    // Enable dragging only if both name and label are set
    if (updatedComponents[index].name && updatedComponents[index].label) {
      updatedComponents[index].selectable = true;
    } else {
      updatedComponents[index].selectable = false;
    }

    setComponents(updatedComponents);
  };

  // Handle editing form elements
  const handleEditComponent = (id, field, value) => {
    const updatedGrid = grid.map((component) => {
      if (component && component.id === id) {
        return { ...component, [field]: value };
      }
      return component;
    });
    setGrid(updatedGrid);
  };

  // Handle deleting a form element
  const handleDeleteComponent = (index) => {
    const updatedGrid = [...grid];
    updatedGrid[index] = null;
    setGrid(updatedGrid);
  };

  // Handle dropping a component into a cell
  const handleDrop = (index, item) => {
    if (published) return; // Don't allow drops if form is published
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

  // Save form to backend
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
        name: cell.name || '', // Save name field
        label: cell.label || '', // Save label field
      }));

    if (formStructure.length === 0) {
      alert('Please add components to the form before saving.');
      return;
    }

    try {
      const response = await axios.post('/api/forms/save', {
        formName,
        formStructure,
        formVersion: lastVersion, // Save current version
        published,
      });
      console.log('Form saved successfully:', response.data);
      alert('Form saved successfully!');

      // Trigger reload of form list after saving
      onFormSaved();
    } catch (error) {
      console.error('Error saving form:', error.response ? error.response.data : error.message);
      alert('Error saving form');
    }
  };

  // Publish form (increments version)
  const handlePublishForm = async () => {
    if (published) return; // Already published

    const newVersion = lastVersion + 1;
    const formStructure = grid.filter((cell) => cell !== null).map((cell) => ({
      id: cell.id,
      type: cell.type,
      position: cell.position,
      name: cell.name || '',
      label: cell.label || '',
    }));

    try {
      const response = await axios.post('/api/forms/publish', {
        formName,
        formStructure,
        formVersion: newVersion,
        published: true,
      });
      console.log('Form published successfully:', response.data);
      alert('Form published successfully!');

      setPublished(true); // Mark as published
      setLastVersion(newVersion); // Update version number
    } catch (error) {
      console.error('Error publishing form:', error.response ? error.response.data : error.message);
      alert('Error publishing form');
    }
  };

  // Unpublish form (allows editing)
  const handleUnpublishForm = async () => {
    if (!published) return; // If not published, there's nothing to unpublish

    try {
      const response = await axios.post('/api/forms/unpublish', {
        formName,
        published: false, // Set published to false
      });
      console.log('Form unpublished successfully:', response.data);
      alert('Form unpublished successfully!');

      setPublished(false); // Unmark as published
    } catch (error) {
      console.error('Error unpublishing form:', error.response ? error.response.data : error.message);
      alert('Error unpublishing form');
    }
  };

  // Clear the form (reset formName and grid)
  const handleClearForm = () => {
    if (published) return; // Can't clear if published
    setFormName('');
    setGrid(Array(16).fill(null));
    setIsEditing(false); // Reset status to New
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Form Builder (Admin Mode) - {isEditing ? 'Edit' : 'New'} Form
        </Typography>

        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
          <Grid item xs={9}>
            <TextField
              label="Form Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              sx={{ marginBottom: 3 }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1">
              Last Version: {lastVersion}
            </Typography>
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
              onEdit={handleEditComponent}
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
            <Button variant="contained" color="primary" onClick={handleSaveForm} sx={{ marginRight: 2 }}>
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
              disabled={published}
              sx={{ marginRight: 2 }}
            >
              Publish Form
            </Button>
            {published && (
              <Button variant="contained" color="warning" onClick={handleUnpublishForm}>
                Unpublish Form
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </DndProvider>
  );
};

export default FormBuilder;
