const graphql = require('graphql')
const {
  GraphQLInt,
  GraphQLNonNull
} = graphql

const { BillingResponseType } = require('./type')
const { addBillingService } = require('../services')

const addBilling = {
  type: BillingResponseType,
  args: {
    amount: { type: new GraphQLNonNull(GraphQLInt) }
  },
  resolve (parent, args) {
    return addBillingService(args)
  }
}

module.exports.addBilling = addBilling
