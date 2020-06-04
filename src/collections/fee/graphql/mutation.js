const graphql = require('graphql')

const { FeeResponseType } = require('./type')
const { createFeeService, setMerchantSchemaFee, setInstitutionSchemaFee } = require('../services')
const { TransactionMethodType } = require('../../transaction/graphql/type')
const { ActionTo } = require('./type')

const {
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLFloat
} = graphql

const addFee = {
  type: FeeResponseType,
  args: {
    fix_fee: { type: new GraphQLNonNull(GraphQLInt) },
    percentage_fee: { type: new GraphQLNonNull(GraphQLFloat) },
    action_to: { type: new GraphQLNonNull(ActionTo) },
    transaction_method: { type: new GraphQLNonNull(TransactionMethodType) }
  },
  resolve (parent, args) {
    return createFeeService(args.fix_fee, args.percentage_fee, args.action_to, args.transaction_method)
  }
}

const setMerchantFee = {
  type: FeeResponseType,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLString) },
    fee_method: { type: new GraphQLNonNull(TransactionMethodType) },
    fee_id: { type: new GraphQLNonNull(GraphQLString) },
    entity: { type: new GraphQLNonNull(ActionTo) }
  },
  resolve (parent, args) {
    return setMerchantSchemaFee(args.merchant_id, args.fee_id, args.fee_method, args.entity)
  }
}

const setInstitutionFee = {
  type: FeeResponseType,
  args: {
    institution_id: { type: new GraphQLNonNull(GraphQLString) },
    fee_id: { type: new GraphQLNonNull(GraphQLString) },
    fee_method: { type: new GraphQLNonNull(TransactionMethodType) }
  },
  resolve (parent, args) {
    return setInstitutionSchemaFee(args.institution_id, args.fee_id, args.fee_method)
  }
}

module.exports = {
  addFee,
  setMerchantFee,
  setInstitutionFee
}
