const graphql = require('graphql')

const { TransactionResponseType } = require('./type')
const { addUserTransaction } = require('../services')

const {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
} = graphql

// const addTransaction = {
//   type: TransactionResponseType,
//   args: {
//     transaction_amount: { type: new GraphQLNonNull(GraphQLInt) },
//     merchant_id: { type: new GraphQLNonNull(GraphQLID) }
//   },
//   resolve (parent, args) {
//     return addUserTransaction(args)
//   }
// }

module.exports.addTransaction = addTransaction
