const {
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt
} = require('graphql')

const { TransactionSettlement, TransactionResponse, SettlementResponse, Entity } = require('./type')
const { setSettlementService, createPaymentSettlement, getAllSettlementService, getMerchantSettlementsService } = require('../services')

const setSettlement = {
  type: TransactionSettlement,
  args: {
    transactions: { type: GraphQLList(GraphQLString) },
    settlements: { type: GraphQLList(GraphQLString) }
  },
  resolve (parent, args) {
    return setSettlementService(args.transactions, args.settlements)
  }
}

module.exports = {
  setSettlement
}
