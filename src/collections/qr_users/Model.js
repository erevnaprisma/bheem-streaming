const mongoose = require('mongoose')

const qrValue = new mongoose.Schema({
  user_id: {
    type: String,
    ref: 'User'
  },
  user_id_native: {
    type: String,
    ref: 'User'
  }
})

const qrSchema = new mongoose.Schema({
  qr_id: {
    type: String,
    unique: true
  },
  qr_value: {
    type: qrValue
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE']
  }
})

module.exports = mongoose.model('QrCodeUser', qrSchema)
