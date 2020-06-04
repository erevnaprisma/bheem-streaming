const mongoose = require('mongoose')

const qrValue = new mongoose.Schema({
  merchant_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Merchant'
  },
  institution_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Institution'
  },
  merchant_id: {
    type: String,
    ref: 'Merchant'
  },
  merchant_name: {
    type: String,
    ref: 'Merchant'
  },
  qr_id: {
    type: String,
    unique: true
  },
  type: {
    type: String
  },
  institution_id: {
    type: String,
    ref: 'Institution'
  },
  serial_number: {
    type: String
  },
  serial_id: {
    type: String
  },
  serial_number_id_native: {
    type: String
  },
  amount: {
    type: Number
  },
  transaction_id: {
    type: String,
    ref: 'Transaction'
  },
  transaction_id_native: {
    type: String,
    ref: 'Transaction'
  }
})

const qrSchema = new mongoose.Schema({
  qr_id: {
    type: String
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
  type: {
    type: String,
    enum: ['DYNAMIC', 'STATIC', 'VOUCHER'],
    default: 'STATIC'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE']
  },
  merchant_id: {
    type: String,
    ref: 'Merchant'
  }
})

module.exports = mongoose.model('QrCode', qrSchema)
