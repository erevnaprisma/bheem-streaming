const graphql = require('graphql')

const { AllInstitutionResponseType, InstitutionInfoResponseType, LoginResponseType } = require('./type')
const { getAllInstitutionService, getInstitutionInfoService, loginService } = require('../services')

const {
  GraphQLString,
  GraphQLNonNull
} = graphql

const AllInstitution = {
  type: AllInstitutionResponseType,
  resolve (parent, args) {
    return getAllInstitutionService()
  }
}

const InstitutionInfo = {
  type: InstitutionInfoResponseType,
  args: {
    institutionID: { type: new GraphQLNonNull(GraphQLString)}
  },
  resolve (parent, args) {
    return getInstitutionInfoService(args.institutionID)
  }
}

const loginInstitution = {
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

module.exports = {
  AllInstitution,
  InstitutionInfo,
  loginInstitution
}
