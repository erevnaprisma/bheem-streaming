const graphql = require('graphql')

const { TransactionType } = require('../../transaction/graphql/type')
const { InstitutionType } = require('../../institution/graphql/type')

const {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLList
} = graphql

const MerchantType = new GraphQLObjectType({
  name: 'Merchant',
  fields: () => ({
    merchant_id: { type: GraphQLID },
    email: { type: GraphQLString },
    fullname: { type: GraphQLString },
    business_name: { type: GraphQLString },
    password: { type: GraphQLString },
    device_id: { type: GraphQLString },
    address: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString }
  })
})

const MerchantResponseType = new GraphQLObjectType({
  name: 'MerchantResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString }
  })
})

const AllMerchantResponseType = new GraphQLObjectType({
  name: 'AllMerchantResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    merchant: { type: GraphQLList(MerchantType) }
  })
})

const AllMerchantTransactionResponseType = new GraphQLObjectType({
  name: 'AllMerchantTransaction',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    transaction: { type: GraphQLList(TransactionType) }
  })
})

const LoginResponseType = new GraphQLObjectType({
  name: 'MerchantLoginResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    access_token: { type: GraphQLString },
    merchant_id: { type: GraphQLString }
  })
})

const MerchantDashboardType = new GraphQLObjectType({
  name: 'MerchantDashboardResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    total_transaction: { type: GraphQLString },
    total_transaction_amount: { type: GraphQLString },
    daily_transaction_amount: { type: GraphQLString }
  })
})

const MerchantInfoResponseType = new GraphQLObjectType({
  name: 'MerchantInfoResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    merchant: { type: MerchantType }
  })
})

const MerchantInstitutionRelation = new GraphQLObjectType({
  name: 'MerchantInstitutionRelationResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    institution: { type: GraphQLList(InstitutionType) }
  })
})

module.exports.MerchantType = MerchantType
module.exports.MerchantResponseType = MerchantResponseType
module.exports.AllMerchantResponseType = AllMerchantResponseType
module.exports.LoginResponseType = LoginResponseType
module.exports.MerchantInfoResponseType = MerchantInfoResponseType
module.exports.AllMerchantTransactionResponseType = AllMerchantTransactionResponseType
module.exports.MerchantDashboardType = MerchantDashboardType
module.exports.MerchantInstitutionRelation = MerchantInstitutionRelation
