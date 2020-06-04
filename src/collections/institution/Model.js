const mongoose = require('mongoose')
require('mongoose-type-email')
const bcrypt = require('bcrypt')
const Joi = require('@hapi/joi')

const institutionMerchantSchema = new mongoose.Schema({
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

const allFeeRules = new mongoose.Schema({
  institution_code_emoney: {
    type: String
  },
  institution_code_topup: {
    type: String
  }
})

const institutionSchema = new mongoose.Schema({
  institution_id: {
    type: String,
    unique: true
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    unique: true
  },
  fullname: {
    type: String,
    min: 6,
    max: 40
  },
  business_name: {
    type: String,
    min: 3,
    max: 20
  },
  password: {
    type: String,
    min: 4,
    max: 15
  },
  device_id: {
    type: String,
    min: 2
  },
  address: {
    type: String,
    min: 6,
    max: 50,
    default: null
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  },
  merchant: {
    type: [institutionMerchantSchema],
    default: null
  },
  feeRules: {
    type: allFeeRules,
    default: null
  }
})

institutionSchema.pre('save', function (next) {
  const user = this
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err)
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

institutionSchema.statics.validation = (args) => {
  var regex = /^[a-z][a-z.\s-]{1,255}$/i
  var addRegex = /^[a-zA-Z0-9,.:/ ]*$/

  const schema = Joi.object({
    fullname: Joi.string().min(6).max(40).pattern(new RegExp(regex)),
    email: Joi.string().email(),
    deviceID: Joi.string().min(2),
    businessName: Joi.string().min(3).max(20),
    address: Joi.string().min(6).max(50).pattern(new RegExp(addRegex, 'm')),
    password: Joi.string()
  })

  return schema.validate(args)
}

institutionSchema.methods.comparedPassword = function (candidatePassword) {
  const user = this
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject('Invalid password')
      }

      if (!isMatch) {
        return reject('Invalid password')
      }

      resolve(true)
    })
  })
}

module.exports = mongoose.model('Institution', institutionSchema)
