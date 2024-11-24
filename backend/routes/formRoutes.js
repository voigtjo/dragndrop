// routes/formRoutes.js
const express = require('express');
const router = express.Router();
const Form = require('../models/formSchema');

// Route to load a form by docID
router.get('/load/:docID', async (req, res) => {
  const { docID } = req.params;

  try {
    const form = await Form.findOne({ docID });
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }
    res.status(200).json(form);
  } catch (err) {
    console.error('Error fetching form structure:', err);
    res.status(500).json({ message: 'Error fetching form structure.', error: err });
  }
});

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
  const { docID, formName, formStructure } = req.body;

  console.log('Incoming form save request:', { docID, formName, formStructure });

  if (!docID) {
    return res.status(400).json({ message: 'docID is required' });
  }

  if (!formName || !formStructure) {
    console.error('Form name or structure missing');
    return res.status(400).json({ message: 'Form name and structure are required' });
  }

  try {
    // Check if a form with the same formName exists
    let form = await Form.findOne({ formName });

    if (form) {
      if (form.published) {
        console.error(`Attempt to save a published form with formName: ${formName}`);
        return res.status(400).json({ message: 'Cannot save a published form' });
      }
      // Update the existing form
      console.log(`Updating existing form: ${formName}`);
      form.docID = docID;
      form.formStructure = formStructure;
      form.formDate = Date.now();
      form.devVersion += 1; // Increment the dev version
      form.published = false; // Reset published status
    } else {
      // Create a new form
      console.log(`Creating new form: ${formName}`);
      form = new Form({ docID, formName, formStructure });
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
router.get('/list', async (req, res) => {
  try {
    // Include docID in the fields to be returned
    const forms = await Form.find({}, 'docID formName formVersion devVersion formDate');
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


