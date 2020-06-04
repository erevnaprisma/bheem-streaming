const mongoose = require('mongoose')
const Joi = require('@hapi/joi')

const feeSchema = new mongoose.Schema({
  fee_id: {
    type: String,
    unique: true
  },
  fix_fee_amount: {
    type: Number
  },
  action_to: {
    type: String,
    enum: ['operator', 'institution', 'merchant']
  },
  percentage_fee_amount: {
    type: Number
  },
  transaction_method: {
    type: String,
    enum: ['Top-up', 'E-money'],
    default: 'E-money'
  },
  fee_master_code: {
    type: String
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  }
})

// settlementSchema.statics.validation = (args) => {
//   const schema = Joi.object({
//     user_id: Joi.string().required(),
//     saldo: Joi.number().required()
//   })

//   return schema.validate(args)
// }

module.exports = mongoose.model('Fee', feeSchema)
