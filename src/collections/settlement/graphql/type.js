const {
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
  GraphQLEnumType
} = require('graphql')

const Settlement = new GraphQLObjectType({
  name: 'Settlement',
  fields: () => ({
    settlement_id: { type: GraphQLString },
    merchant_id: { type: GraphQLString },
    institution_id: { type: GraphQLString },
    transaction_id: { type: GraphQLString },
    payment_date: { type: GraphQLString },
    status: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
    transaction_amount: { type: GraphQLString },
    action_to: { type: GraphQLString },
    action_from: { type: GraphQLString },
    percentage_fee: { type: GraphQLString },
    total_fee: { type: GraphQLString },
    settlement_amount: { type: GraphQLString },
    fix_fee: { type: GraphQLString }
  })
})

const Entity = new GraphQLEnumType({
  name: 'Entity',
  values: {
    institution: { value: 'institution' },
    merchant: { values: 'merchant' }
  }
})

const TransactionSettlement = new GraphQLObjectType({
  name: 'TransactionSettlement',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    transaction: { type: GraphQLList(GraphQLString) }
  })
})

const TransactionResponse = new GraphQLObjectType({
  name: 'TransactionResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString }
  })
})

const SettlementResponse = new GraphQLObjectType({
  name: 'SettlementResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    settlements: { type: GraphQLList(Settlement) }
  })
})

module.exports = {
  TransactionSettlement,
  TransactionResponse,
  SettlementResponse,
  Entity
}