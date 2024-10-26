// routes/formRoutes.js
const express = require('express');
const router = express.Router();
const Form = require('../models/formSchema');

// Save or update a form
router.post('/save', async (req, res) => {
  const { formName, formStructure } = req.body;

  // Log the incoming request
  console.log('Incoming form save request:');
  console.log('Form Name:', formName);
  console.log('Form Structure:', formStructure);

  if (!formName || !formStructure) {
    console.error('Form name or structure missing');
    return res.status(400).json({ message: 'Form name and structure are required' });
  }

  try {
    let form = await Form.findOne({ formName });

    if (form) {
      // Update the form and increment the version
      console.log(`Updating existing form: ${formName}`);
      form.formVersion += 1;
      form.formStructure = formStructure;
      form.formDate = Date.now();
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

// Fetch all forms with formStructure included
router.get('/list', async (req, res) => {
  try {
    // Ensure formStructure is included in the response
    const forms = await Form.find({}, 'formName formVersion formDate formStructure');
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
