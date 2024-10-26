// models/formDataSchema.js

const mongoose = require('mongoose');  // Make sure mongoose is imported

const formDataSchema = new mongoose.Schema({
    formName: { type: String, required: true },
    formVersion: { type: Number, required: true },
    formDate: { type: Date, required: true },
    dataName: { type: String, required: true },
    formDataVersion: { type: Number, default: 0 },
    formDataDate: { type: Date, default: Date.now },
    formData: { type: Object, required: true },
});

module.exports = mongoose.model('FormData', formDataSchema);
