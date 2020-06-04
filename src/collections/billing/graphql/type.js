const graphql = require('graphql')

const {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLID
} = graphql

const BillingType = new GraphQLObjectType({
  name: 'Billing',
  fields: () => ({
    id: { type: GraphQLID },
    bill_id: { type: GraphQLID },
    amount: { type: GraphQLInt }
  })
})

const BillingResponseType = new GraphQLObjectType({
  name: 'BillingResponse',
  fields: () => ({
    success: { type: GraphQLString },
    status: { type: GraphQLID },
    error: { type: GraphQLString }
  })
})

module.exports.BillingType = BillingType
module.exports.BillingResponseType = BillingResponseType
