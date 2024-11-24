// models/formDataSchema.js

const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
  docID: { type: String, required: true },
  formVersion: { type: Number, required: true },
  subject: { type: String, required: true },
  formData: [
    {
      id: { type: String, required: true },
      type: { type: String, required: true },
      label: { type: String, required: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
    },
  ],
  formDate: { type: Date, required: true, default: Date.now },
});

formDataSchema.index({ docID: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('FormData', formDataSchema);
