const graphql = require('graphql')

const { TransactionType } = require('../../collections/transaction/graphql/type')

const {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLList
} = graphql

const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: () => ({
    error: { type: GraphQLString },
    status: { type: GraphQLInt },
    success: { type: GraphQLString }
  })
})

const StaticPaymentScanType = new GraphQLObjectType({
  name: 'ScanResponse',
  fields: () => ({
    transaction_id: { type: GraphQLString },
    merchant_id: { type: GraphQLString },
    billing_id: { type: GraphQLString },
    merchant_name: { type: GraphQLString },
    institution_id: { type: GraphQLString },
    error: { type: GraphQLString },
    status: { type: GraphQLInt },
    success: { type: GraphQLString }
  })
})

const DynamicPaymentScanType = new GraphQLObjectType({
  name: 'DynamicScanResponse',
  fields: () => ({
    transaction_id: { type: GraphQLString },
    merchant_id: { type: GraphQLString },
    billing_id: { type: GraphQLString },
    merchant_name: { type: GraphQLString },
    institution_id: { type: GraphQLString },
    error: { type: GraphQLString },
    status: { type: GraphQLInt },
    success: { type: GraphQLString },
    amount: { type: GraphQLInt }
  })
})

const TransactionDetailType = new GraphQLObjectType({
  name: 'TransactionDetailResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    success: { type: GraphQLString },
    error: { type: GraphQLString },
    transaction: { type: TransactionType }
  })
})

const TransactionHistoryType = new GraphQLObjectType({
  name: 'TransactionHistoryResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    success: { type: GraphQLString },
    error: { type: GraphQLString },
    transaction_history: { type: GraphQLList(TransactionType) }
  })
})

module.exports.ResponseType = ResponseType
module.exports.StaticPaymentScanType = StaticPaymentScanType
module.exports.TransactionDetailType = TransactionDetailType
module.exports.TransactionHistoryType = TransactionHistoryType
module.exports.DynamicPaymentScanType = DynamicPaymentScanType
