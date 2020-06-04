const graphql = require('graphql')

const { AllMerchantResponseType, MerchantInfoResponseType, LoginResponseType, AllMerchantTransactionResponseType, MerchantResponseType, MerchantDashboardType, MerchantInstitutionRelation } = require('./type')
const { getAllMerchantService, getMerchantInfoService, loginService, merchantTransactionHistoryService, merchantDashboardService, InstitutionRelatedToMerchantService } = require('../services')

const {
  GraphQLString,
  GraphQLNonNull
} = graphql

const AllMerchant = {
  type: AllMerchantResponseType,
  resolve (parent, args) {
    return getAllMerchantService()
  }
}

const MerchantInfo = {
  type: MerchantInfoResponseType,
  args: {
    merchantID: { type: new GraphQLNonNull(GraphQLString)}
  },
  resolve (parent, args) {
    return getMerchantInfoService(args.merchantID)
  }
}

const loginMerchant = {
  type: LoginResponseType,
  args: {
    access_token: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString }
  },
  resolve (parent, args) {
    return loginService(args.email, args.password, args.access_token, args.isLoggedInWithToken)
  }
}

const MerchantTransactionHistory = {
  type: AllMerchantTransactionResponseType,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return merchantTransactionHistoryService(args.merchant_id)
  }
}

const merchantDashboard = {
  type: MerchantDashboardType,
  args: {
    merchant_id: { type: GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return merchantDashboardService(args.merchant_id)
  }
}

const showRelatedInstitution = {
  type: MerchantInstitutionRelation,
  args: {
    merchant_id: { type: GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return InstitutionRelatedToMerchantService(args.merchant_id)
  }
}

module.exports = {
  AllMerchant,
  MerchantInfo,
  loginMerchant,
  MerchantTransactionHistory,
  merchantDashboard,
  showRelatedInstitution
}
