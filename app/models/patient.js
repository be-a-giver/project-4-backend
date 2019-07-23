const mongoose = require('mongoose')

const patientSchema = new mongoose.Schema({
    patientName : {
    type: String,
    required: true
  },
    age: {
    type: String,
    required: true
  },
  city : {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  hospital: {
    type: String,
    required: true
  },
  fileNumber: {
    type: Number,
    required: true
  },
  medicalReport: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Patient', patientSchema)
