// routes/formDataRoutes.js

const express = require('express');
const router = express.Router();
const FormData = require('../models/formDataSchema');

// Route to save form data
router.post('/save', async (req, res) => {
  const { formName, formVersion, formDate, dataName, formData } = req.body;

  try {
    let formDataEntry = new FormData({
      formName,
      formVersion,
      formDate,
      dataName: dataName || 'DefaultDataName',
      formData,
      formDataVersion: formVersion,
      formDataDate: Date.now(),
    });

    await formDataEntry.save();
    res.status(200).json(formDataEntry);
  } catch (err) {
    console.error('Error saving form data:', err);
    res.status(500).json({ message: 'Error saving form data', error: err });
  }
});

// Update form data by _id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = await FormData.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedData);
  } catch (err) {
    res.status(500).json({ message: 'Error updating form data', error: err });
  }
});

// Route to load form data by formName and formVersion as query parameters
router.get('/', async (req, res) => {
  const { formName, formVersion } = req.query;
  console.log("Received request with formName:", formName, "and formVersion:", formVersion); // Debugging line

  try {
    const formData = await FormData.findOne({ formName, formVersion });

    if (!formData) {
      console.log("Form data not found for", formName, formVersion); // Debugging line

      // Send a response indicating no data is found
      return res.status(200).json({
        message: 'No existing form data found. Returning an empty structure.',
        formName,
        formVersion,
        formData: [], // Provide an empty data structure
      });
    }

    res.status(200).json(formData);
  } catch (err) {
    console.error("Error loading form data:", err);
    res.status(500).json({ message: 'Error loading form data', error: err });
  }
});


// Route to load all form data for a specific formName
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
