const graphql = require('graphql')

const transactionHistoryService = require('../payment_services/transactionHistory')
const { TransactionHistoryType } = require('./type')

const {
  GraphQLNonNull,
  GraphQLString
} = graphql

const transactionHistory = {
  type: TransactionHistoryType,
  args: {
    user_id: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return transactionHistoryService(args.user_id)
  }
}

module.exports.transactionHistory = transactionHistory
