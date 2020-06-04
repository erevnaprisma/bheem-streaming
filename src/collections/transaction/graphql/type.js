const graphql = require('graphql')

const {
  GraphQLEnumType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLObjectType
} = graphql

const TransactionStatusType = new GraphQLEnumType({
  name: 'TransactionStatus',
  values: {
    PENDING: { value: 'PNDNG' },
    SETTLED: { value: 'SETLD' },
    REJECT: { value: 'REJEC' },
    CANCEL: { value: 'CANCEL' }
  }
})

const TransactionMethodType = new GraphQLEnumType({
  name: 'TransactionMethod',
  values: {
    TOPUP: { value: 'Top-up' },
    EMONEY: { value: 'E-money' }
  }
})

const TopupType = new GraphQLEnumType({
  name: 'TopupMethod',
  values: {
    INSTITUTION: { value: 'Institution' },
    VIRTUAL_ACCOUNT: { value: 'Virtual Account' }
  }
})

const TransactionType = new GraphQLObjectType({
  name: 'Transaction',
  fields: () => ({
    id: { type: GraphQLID },
    transaction_id: { type: GraphQLString },
    transaction_amount: { type: GraphQLInt },
    emoney_id: { type: GraphQLString },
    merchant_id: { type: GraphQLID },
    billing_id: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
    status: { type: TransactionStatusType },
    transaction_method: { type: TransactionMethodType },
    merchant_name: { type: GraphQLString },
    institution_id: { type: GraphQLString }
  })
})

const TransactionResponseType = new GraphQLObjectType({
  name: 'TransactionResponse',
  fields: () => ({
    error: { type: GraphQLString },
    status: { type: GraphQLInt },
    success: { type: GraphQLString }
  })
})

module.exports.TransactionType = TransactionType
module.exports.TransactionResponseType = TransactionResponseType
module.exports.TransactionMethodType = TransactionMethodType
module.exports.TopupType = TopupType
