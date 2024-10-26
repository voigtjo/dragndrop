const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  formName: { type: String, required: true },
  formStructure: [
    {
      id: { type: String, required: true },       // Component ID
      type: { type: String, required: true },     // Component type (e.g., text, checkbox)
      position: { type: Number, required: true }, // Position in the grid (0-15 for a 4x4 grid)
      name: { type: String, required: true },     // Component name
      label: { type: String, required: true },    // Component label
    },
  ],
  formVersion: { type: Number, default: 0 },
  formDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Form', formSchema);
