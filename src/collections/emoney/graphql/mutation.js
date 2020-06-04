const graphql = require('graphql')

const { EmoneyResponseType } = require('./type')
const { PaymentType } = require('./type')
const { addUserPayment } = require('../services')

const {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
} = graphql

const addPayment = {
  type: EmoneyResponseType,
  args: {
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    transaction_amount: { type: new GraphQLNonNull(GraphQLInt) },
    saldo: { type: new GraphQLNonNull(GraphQLInt) },
    type: { type: new GraphQLNonNull(PaymentType) }
  },
  resolve (parent, args) {
    return addUserPayment(args)
  }
}

module.exports.addPayment = addPayment
