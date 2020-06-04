const mongoose = require('mongoose')
const Joi = require('@hapi/joi')

const billSchema = new mongoose.Schema({
  bill_id: {
    type: String,
    unique: true
  },
  amount: {
    type: Number,
    default: null
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
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
  merchant_id: {
    type: String,
    ref: 'Merchant',
    default: null
  },
  merchant_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Merchant',
    default: null
  }
})

billSchema.statics.validation = (args) => {
  const schema = Joi.object({
    user_id: Joi.string(),
    amount: Joi.number().required().greater(0)
  })

  return schema.validate(args)
}

module.exports = mongoose.model('Billing', billSchema)
