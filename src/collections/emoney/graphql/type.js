const graphql = require('graphql')

const {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLID
} = graphql

const PaymentType = new GraphQLEnumType({
  name: 'Payment',
  values: {
    DEBIT: { value: 'DEBIT' },
    CREDIT: { value: 'CREDIT' }
  }
})

const EmoneyType = new GraphQLObjectType({
  name: 'Emoney',
  fields: () => ({
    id: { type: GraphQLID },
    user_id: { type: GraphQLID },
    transaction_id: { type: GraphQLID },
    bill_id: { type: GraphQLID },
    transaction_amount: { type: GraphQLInt },
    saldo: { type: GraphQLInt },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
    type: { type: PaymentType }
  })
})

const EmoneyResponseType = new GraphQLObjectType({
  name: 'EmoneyResponse',
  fields: () => ({
    success: { type: GraphQLString },
    status: { type: GraphQLID },
    error: { type: GraphQLString }
  })
})

module.exports.EmoneyType = EmoneyType
module.exports.EmoneyResponseType = EmoneyResponseType
module.exports.PaymentType = PaymentType
