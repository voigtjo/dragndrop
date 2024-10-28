// routes/formRoutes.js
const express = require('express');
const router = express.Router();
const Form = require('../models/formSchema');

// Publish a form
router.post('/publish', async (req, res) => {
  const { formName } = req.body;

  try {
    const form = await Form.findOne({ formName });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    form.published = true;
    form.formVersion += 1; // Increment formVersion on publish
    form.devVersion = 0;   // Reset devVersion to 0
    await form.save();

    res.status(200).json({ message: `Form ${formName} published successfully`, form });
  } catch (error) {
    console.error('Error publishing form:', error);
    res.status(500).json({ message: 'Error publishing form', error });
  }
});


// Unpublish a form
router.post('/unpublish', async (req, res) => {
  const { formName } = req.body;

  try {
    const form = await Form.findOne({ formName });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    form.published = false;
    await form.save();

    res.status(200).json({ message: `Form ${formName} unpublished successfully`, form });
  } catch (error) {
    console.error('Error unpublishing form:', error);
    res.status(500).json({ message: 'Error unpublishing form', error });
  }
});

// Save or update a form
router.post('/save', async (req, res) => {
  const { formName, formStructure } = req.body;

  console.log('Incoming form save request:', formName, formStructure);

  if (!formName || !formStructure) {
    console.error('Form name or structure missing');
    return res.status(400).json({ message: 'Form name and structure are required' });
  }

  try {
    let form = await Form.findOne({ formName });

    if (form) {
      if (form.published) {
        return res.status(400).json({ message: 'Cannot save a published form' });
      }
      // Update the form and increment the devVersion
      console.log(`Updating existing form: ${formName}`);
      form.formStructure = formStructure;
      form.formDate = Date.now();
      form.devVersion += 1;    // Increment dev version
      form.published = false;   // Set published to false
    } else {
      // Create a new form
      console.log(`Creating new form: ${formName}`);
      form = new Form({ formName, formStructure });
    }

    await form.save();
    console.log(`Form saved successfully: ${formName}`);
    res.status(200).json(form);
  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).json({ message: 'Error saving form', error });
  }
});


// routes/formRoutes.js

// Fetch all forms with formStructure included
router.get('/list', async (req, res) => {
  try {
    // Ensure devVersion is included in the response along with formVersion, formDate, and formName
    const forms = await Form.find({}, 'formName formVersion devVersion formDate');
    res.status(200).json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ message: 'Error fetching forms', error });
  }
});


router.get('/getByName/:formName', async (req, res) => {
  try {
    const form = await Form.findOne({ formName: req.params.formName });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.status(200).json(form);
  } catch (error) {
    console.error('Error fetching form by name:', error);
    res.status(500).json({ message: 'Error fetching form by name', error });
  }
});


// Load form by name
router.get('/load/:formName', async (req, res) => {
  const { formName } = req.params;

  try {
    const form = await Form.findOne({ formName });
    if (!form) return res.status(404).json({ message: 'Form not found' });

    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error loading form', error });
  }
});

module.exports = router;

// Clear a form
router.post('/clear', async (req, res) => {
  const { formName } = req.body;

  try {
    const form = await Form.findOne({ formName });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Reset fields
    form.formStructure = [];   // Clear the structure by setting it to an empty array
    form.formVersion = 0;      // Reset formVersion
    form.devVersion = 0;       // Reset devVersion
    form.published = false;    // Set published to false
    await form.save();

    res.status(200).json({ message: `Form ${formName} cleared successfully`, form });
  } catch (error) {
    console.error('Error clearing form:', error);
    res.status(500).json({ message: 'Error clearing form', error });
  }
});
