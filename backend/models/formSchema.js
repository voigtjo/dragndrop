const mongoose = require('mongoose');

const formComponentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: { type: Number, required: true },
  name: { type: String, required: true },
  label: { type: String, required: true }
}, { _id: false });

const formSchema = new mongoose.Schema({
  docID: { type: String, required: true }, // Unique with formVersion
  formName: { type: String, required: true },
  formStructure: { type: Array, required: true },
  formVersion: { type: Number, default: 0 },
  devVersion: { type: Number, default: 0 },
  formDate: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
});

// Create a compound index for docID and formVersion
formSchema.index({ docID: 1, formVersion: 1 }, { unique: true });

module.exports = mongoose.model('Form', formSchema);
