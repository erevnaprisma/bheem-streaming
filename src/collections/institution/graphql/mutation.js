const graphql = require('graphql')

const { InstitutionResponseType } = require('./type')
const { addInstitutionService, serviceLogout } = require('../services')

const {
  GraphQLString,
  GraphQLNonNull
} = graphql

const signUpInstitution = {
  type: InstitutionResponseType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    deviceID: { type: new GraphQLNonNull(GraphQLString) },
    fullname: { type: new GraphQLNonNull(GraphQLString) },
    address: { type: new GraphQLNonNull(GraphQLString) },
    businessName: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return addInstitutionService(args)
  }
}

const logoutInstitution = {
  type: InstitutionResponseType,
  args: {
    access_token: { type: GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return serviceLogout(args.access_token)
  }
}

module.exports.signUpInstitution = signUpInstitution
module.exports.logoutInstitution = logoutInstitution
