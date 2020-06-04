const graphql = require('graphql')

const { userLogin, getUserProfile } = require('../services')
const { getAllUser } = require('../../../utils/services/mongoServices')
const { AuthType, UserType } = require('./type')

const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList
} = graphql

const login = {
  type: AuthType,
  args: {
    access_token: { type: GraphQLString },
    username: { type: GraphQLString },
    password: { type: GraphQLString }
  },
  async resolve (parent, args) {
    return userLogin(args.username, args.password, args.access_token, args.isLoggedInWithToken)
  }
}

const getProfile = {
  type: AuthType,
  args: {
    user_id: { type: new GraphQLNonNull(GraphQLID) }
  },
  async resolve (parent, args, context) {
    return getUserProfile(args.user_id)
  }
}

const allUser = {
  type: new GraphQLList(UserType),
  args: {
    email: { type: GraphQLString }
  },
  resolve (parent, args) {
    return getAllUser()
  }
}
module.exports.login = login
module.exports.getProfile = getProfile
module.exports.allUser = allUser
