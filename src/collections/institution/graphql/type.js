const graphql = require('graphql')

const {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLList
} = graphql

const InstitutionType = new GraphQLObjectType({
  name: 'Institution',
  fields: () => ({
    institution_id: { type: GraphQLString },
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

const InstitutionResponseType = new GraphQLObjectType({
  name: 'InstitutionResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString }
  })
})

const AllInstitutionResponseType = new GraphQLObjectType({
  name: 'AllInstitutionResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    institution: { type: GraphQLList(InstitutionType) }
  })
})

const LoginResponseType = new GraphQLObjectType({
  name: 'InstitutionLoginResponse',
  fields: {
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    access_token: { type: GraphQLString },
    institution_id: { type: GraphQLString }
  }
})

const InstitutionInfoResponseType = new GraphQLObjectType({
  name: 'InstitutionInfoResponse',
  fields: () => ({
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    institution: { type: InstitutionType }
  })
})

module.exports.InstitutionType = InstitutionType
module.exports.InstitutionResponseType = InstitutionResponseType
module.exports.AllInstitutionResponseType = AllInstitutionResponseType
module.exports.LoginResponseType = LoginResponseType
module.exports.InstitutionInfoResponseType = InstitutionInfoResponseType
