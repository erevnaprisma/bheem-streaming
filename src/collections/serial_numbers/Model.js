const mongoose = require('mongoose')

const qrSchema = new mongoose.Schema({
  serial_id: {
    type: String,
    unique: true
  },
  serial_number: {
    type: String
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE']
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  }
})

module.exports = mongoose.model('Serial', qrSchema)
