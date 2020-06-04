const mongoose = require('mongoose')
const Joi = require('joi')

const otpSchema = new mongoose.Schema({
  otp_id: {
    type: String,
    unique: true
  },
  otp_number: {
    type: String
  },
  otp_reference_number: {
    type: String,
    min: 5
  },
  new_email: {
    type: String
  },
  type: {
    type: String,
    enum: ['FORGET PASSWORD', 'CHANGE EMAIL'],
    default: 'CHANGE EMAIL'
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  },
  user_id: {
    type: String,
    default: null,
    ref: 'User'
  },
  user_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    default: null,
    ref: 'User'
  },
  merchant_id: {
    type: String,
    default: null,
    ref: 'Merchant'
  },
  merchant_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    default: null,
    ref: 'Merchant'
  },
  isValidLimit: {
    type: Number,
    max: 3,
    default: 0
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  institution_Id: {
    type: String,
    ref: 'Institution',
    default: null
  },
  institution_id_native: {
    type: mongoose.SchemaTypes.ObjectId,
    default: null,
    ref: 'Institution'
  }
})

otpSchema.statics.validation = (args) => {
  const schema = Joi.object({
    user_id: Joi.string(),
    email: Joi.string().email()
  })

  return schema.validate(args)
}

module.exports = mongoose.model('OTP', otpSchema)
