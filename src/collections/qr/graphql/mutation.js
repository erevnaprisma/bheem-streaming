const graphql = require('graphql')

const {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt
} = graphql

const { createQrStaticService, testingService, createQrDynamic: createQrDynamicService } = require('../services')
const { QrResponseType } = require('./type')

const createQrStatic = {
  type: QrResponseType,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLString) },
    institution_id: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return createQrStaticService(args.merchant_id, args.institution_id)
  }
}

const createQrDynamic = {
  type: QrResponseType,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLString) },
    institution_id: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLInt) }
  },
  resolve (parent, args) {
    return createQrDynamicService(args.merchant_id, args.institution_id, args.amount)
  }
}

const testing = {
  type: QrResponseType,
  args: {
    content: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args, context) {
    return testingService(args.content, context)
  }
}

module.exports.createQrStatic = createQrStatic
module.exports.testing = testing
module.exports.createQrDynamic = createQrDynamic
