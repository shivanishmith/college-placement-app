//ProfileField.js
const mongoose = require('mongoose');

const ProfileFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
  },
  fieldType: {
    type: String,
    required: true,
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
});

const ProfileField = mongoose.model('ProfileField', ProfileFieldSchema);

module.exports = ProfileField;
