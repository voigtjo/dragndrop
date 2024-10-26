// routes/formDataRoutes.js

const express = require('express');
const router = express.Router();
const FormData = require('../models/formDataSchema');

// Route to save form data
router.post('/save', async (req, res) => {
  // Log the incoming request payload
  console.log('Received form data:', req.body);

  const { formName, formVersion, formDate, dataName, formData } = req.body;

  try {
    // Log the form data before saving
    console.log('Saving form data:', { formName, formVersion, formDate, dataName, formData });

    let formDataEntry = new FormData({
      formName,
      formVersion,
      formDate,
      dataName: dataName || 'DefaultDataName', // Ensure a valid dataName is provided
      formData,
      formDataVersion: formVersion,
      formDataDate: Date.now(),
    });

    await formDataEntry.save();

    // Log the saved data
    console.log('Form data saved successfully:', formDataEntry);

    res.status(200).json(formDataEntry);
  } catch (err) {
    // Log the error
    console.error('Error saving form data:', err);
    res.status(500).json({ message: 'Error saving form data', error: err });
  }
});


// Route to load form data for a specific form
router.get('/:formName', async (req, res) => {
  const { formName } = req.params;
  try {
    const formData = await FormData.find({ formName });
    res.status(200).json(formData);
  } catch (err) {
    res.status(500).json({ message: 'Error loading form data', error: err });
  }
});

// Route to get form data by dataName (for editing)
router.get('/:formName/:dataName', async (req, res) => {
  const { formName, dataName } = req.params;
  try {
    const formDataEntry = await FormData.findOne({ formName, dataName });
    if (!formDataEntry) return res.status(404).json({ message: 'Form data not found' });
    res.status(200).json(formDataEntry);
  } catch (err) {
    res.status(500).json({ message: 'Error loading form data', error: err });
  }
});

module.exports = router;
