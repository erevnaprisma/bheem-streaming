const graphql = require('graphql')

const { MerchantResponseType, TransactionSettlement } = require('./type')
const { addMerchantService, serviceLogout, merchantInstitutionRelation, changePasswordMerchantService, setSettlementService } = require('../services')

const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLList
} = graphql

const signUpMerchant = {
  type: MerchantResponseType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    deviceID: { type: new GraphQLNonNull(GraphQLString) },
    fullname: { type: new GraphQLNonNull(GraphQLString) },
    address: { type: new GraphQLNonNull(GraphQLString) },
    businessName: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return addMerchantService(args)
  }
}

const logoutMerchant = {
  type: MerchantResponseType,
  args: {
    access_token: { type: GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return serviceLogout(args.access_token)
  }
}

const relationMerchantInstitution = {
  type: MerchantResponseType,
  args: {
    merchant_id: { type: GraphQLNonNull(GraphQLString) },
    institution_id: { type: GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return merchantInstitutionRelation(args.merchant_id, args.institution_id)
  }
}

const changePasswordMerchant = {
  type: MerchantResponseType,
  args: {
    merchant_id: { type: GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLNonNull(GraphQLString) },
    new_password: { type: GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return changePasswordMerchantService(args.merchant_id, args.password, args.new_password)
  }
}

module.exports.signUpMerchant = signUpMerchant
module.exports.logoutMerchant = logoutMerchant
module.exports.relationMerchantInstitution = relationMerchantInstitution
module.exports.changePasswordMerchant = changePasswordMerchant
