const mongoose = require('mongoose')
const Joi = require('@hapi/joi')

const transactionSchema = new mongoose.Schema({
  merchant_id: {
    type: String,
    default: null
  },
  merchant_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Merchant',
    default: null
  },
  emoney_id: {
    type: String,
    ref: 'Emoney',
    default: null
  },
  emoney_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Emoney',
    default: null
  },
  qr_id: {
    type: String,
    ref: 'QrCode',
    default: null
  },
  qr_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'QrCode'
  },
  user_id: {
    type: String,
    ref: 'User',
    default: null
  },
  user_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    default: null,
    ref: 'User'
  },
  transaction_id: {
    type: String,
    unique: true,
    ref: 'Transaction'
  },
  transaction_method: {
    type: String,
    enum: ['Top-up', 'E-money'],
    default: 'E-money'
  },
  topup_method: {
    type: String,
    enum: ['Institution', 'Virtual Account', 'Merchant', null],
    default: null
  },
  transaction_amount: {
    type: Number,
    min: 1,
    default: null
  },
  billing_id: {
    type: String,
    default: null
  },
  billing_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    default: null,
    ref: 'Billing'
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  },
  status: {
    type: String,
    enum: ['PNDNG', 'SETLD', 'REJEC', 'CANCEL'],
    default: 'PNDNG'
  },
  institution_id: {
    type: String,
    ref: 'Institution',
    default: null
  },
  institution_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Institution',
    default: null
  },
  isSettlement: {
    type: String,
    enum: ['Y', 'N'],
    default: 'N'
  }
})

transactionSchema.statics.validation = (args) => {
  const schema = Joi.object({
    user_id: Joi.string().required(),
    billing_id: Joi.string().required()
  })

  return schema.validate(args)
}

module.exports = mongoose.model('Transaction', transactionSchema)
