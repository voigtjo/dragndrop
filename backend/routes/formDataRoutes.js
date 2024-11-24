const express = require('express');
const router = express.Router();
const FormData = require('../models/formDataSchema');

// Route to fetch or initialize a single dataset by docID and subject
router.get('/dataset', async (req, res) => {
  const { docID, subject } = req.query;

  if (!docID || !subject) {
    return res.status(400).json({ message: 'docID and subject are required.' });
  }

  try {
    let dataset = await FormData.findOne({ docID, subject });
    if (!dataset) {
      // Initialize a new empty dataset if not found
      dataset = {
        docID,
        subject,
        formVersion: 0, // Default version
        formData: [], // Initialize with an empty structure
      };
      return res.status(200).json(dataset);
    }
    res.status(200).json(dataset);
  } catch (err) {
    console.error('Error fetching dataset:', err);
    res.status(500).json({ message: 'Error fetching dataset', error: err });
  }
});

router.post('/save', async (req, res) => {
  const { docID, formVersion, subject, formData } = req.body;

  if (!docID || !formVersion || !subject || !formData) {
    console.error('Missing required fields:', { docID, formVersion, subject, formData });
    return res.status(400).json({ message: 'docID, formVersion, subject, and formData are required.' });
  }

  try {
    // Check if dataset already exists
    const existingData = await FormData.findOne({ docID, subject });
    if (existingData) {
      console.error('Duplicate subject for the given docID:', { docID, subject });
      return res.status(400).json({ message: 'A dataset with this subject already exists for the given docID.' });
    }

    // Save new dataset
    const newDataset = new FormData({ docID, formVersion, subject, formData });
    const savedDataset = await newDataset.save();
    console.log('New dataset created successfully:', savedDataset);
    res.status(201).json(savedDataset);
  } catch (err) {
    console.error('Error saving dataset:', err);
    res.status(500).json({ message: 'Error saving dataset', error: err });
  }
});



// Route to update form data by _id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = await FormData.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedData) {
      return res.status(404).json({ message: 'Dataset not found.' });
    }
    res.status(200).json({ message: 'Dataset updated successfully.', dataset: updatedData });
  } catch (err) {
    console.error('Error updating dataset:', err);
    res.status(500).json({ message: 'Error updating dataset', error: err });
  }
});

// Route to fetch all datasets for a given docID
router.get('/', async (req, res) => {
  const { docID } = req.query;

  if (!docID) {
    return res.status(400).json({ message: 'docID is required.' });
  }

  try {
    const datasets = await FormData.find({ docID });
    res.status(200).json(datasets);
  } catch (err) {
    console.error('Error fetching datasets:', err);
    res.status(500).json({ message: 'Error fetching datasets', error: err });
  }
});

// Route to fetch or initialize a single dataset by docID and subject
router.get('/dataset', async (req, res) => {
  const { docID, subject } = req.query;

  if (!docID || !subject) {
    return res.status(400).json({ message: 'docID and subject are required.' });
  }

  try {
    let dataset = await FormData.findOne({ docID, subject });
    if (!dataset) {
      // Initialize a new empty dataset if not found
      dataset = {
        docID,
        subject,
        formVersion: 0, // Default version
        formData: [], // Initialize with an empty structure
      };
      return res.status(200).json(dataset);
    }
    res.status(200).json(dataset);
  } catch (err) {
    console.error('Error fetching dataset:', err);
    res.status(500).json({ message: 'Error fetching dataset', error: err });
  }
});

// Legacy Routes (for backward compatibility, if needed)
router.get('/:formName', async (req, res) => {
  const { formName } = req.params;

  try {
    const formData = await FormData.find({ formName });
    res.status(200).json(formData);
  } catch (err) {
    console.error('Error loading form data:', err);
    res.status(500).json({ message: 'Error loading form data', error: err });
  }
});

router.get('/:formName/:dataName', async (req, res) => {
  const { formName, dataName } = req.params;

  try {
    const formDataEntry = await FormData.findOne({ formName, dataName });
    if (!formDataEntry) {
      return res.status(404).json({ message: 'Form data not found.' });
    }
    res.status(200).json(formDataEntry);
  } catch (err) {
    console.error('Error loading form data:', err);
    res.status(500).json({ message: 'Error loading form data', error: err });
  }
});

module.exports = router;
