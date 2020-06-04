const mongoose = require('mongoose')
const Joi = require('@hapi/joi')

const settlementSchema = new mongoose.Schema({
  settlement_id: {
    type: String,
    unique: true
  },
  merchant_id: {
    type: String,
    ref: 'Merchant'
  },
  merchant_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Merchant'
  },
  institution_id: {
    type: String,
    ref: 'Institution'
  },
  institution_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Institution'
  },
  transaction_id: {
    type: String,
    ref: 'Transaction'
  },
  transaction_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Transaction'
  },
  payment_date: {
    type: String
  },
  status: {
    type: String,
    enum: ['PNDNG', 'SETLD', 'REJEC', 'CANCEL'],
    default: 'PNDNG'
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  },
  transaction_amount: {
    type: Number,
    min: 1
  },
  action_to: {
    type: String,
    enum: ['operator', 'institution', 'merchant']
  },
  action_from: {
    type: String,
    enum: ['operator', 'institution', 'merchant']
  },
  percentage_fee: {
    type: Number
  },
  total_fee: {
    type: Number
  },
  settlement_amount: {
    type: Number
  },
  fix_fee: {
    type: Number
  }
})

// settlementSchema.statics.validation = (args) => {
//   const schema = Joi.object({
//     user_id: Joi.string().required(),
//     saldo: Joi.number().required()
//   })

//   return schema.validate(args)
// }

module.exports = mongoose.model('Settlement', settlementSchema)
