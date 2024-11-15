// models/formSchema.js
const mongoose = require('mongoose');

// Define the schema for each component in formStructure
const formComponentSchema = new mongoose.Schema({
  id: { type: String, required: true },       // Component ID
  type: { type: String, required: true },     // Component type (e.g., text, checkbox)
  position: { type: Number, required: true }, // Position in the grid (0-15 for a 4x4 grid)
  name: { type: String, required: true },     // Component name
  label: { type: String, required: true }     // Component label
}, { _id: false }); // _id: false disables automatic _id creation for embedded documents

// Define the main schema for the form
const formSchema = new mongoose.Schema({
  docID: { type: String, required: true, unique: true }, // Add docID as a unique and mandatory field
  formName: { type: String, required: true, unique: true },
  formStructure: { type: Array, required: true },
  formVersion: { type: Number, default: 0 },
  devVersion: { type: Number, default: 0 },
  formDate: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
});

module.exports = mongoose.model('Form', formSchema);
