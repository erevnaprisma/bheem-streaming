const graphql = require('graphql')

const BlacklistResponseType = require('./type')
const { serviceAddBlacklist } = require('../services')

const {
  GraphQLNonNull,
  GraphQLString
} = graphql

const addBlacklist = {
  type: BlacklistResponseType,
  args: {
    access_token: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return serviceAddBlacklist(args.access_token)
  }
}

module.exports.addBlacklist = addBlacklist
