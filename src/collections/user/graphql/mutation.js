const graphql = require('graphql')

const { userSignup, changeEmail, changePassword, changeName, changeProfile, serviceLogout } = require('../services')
const { AuthType, ChangeType } = require('./type')

const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID
} = graphql

const signUp = {
  type: AuthType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    device_id: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return userSignup(args.email, args.device_id)
  }
}

const changeUserEmail = {
  type: ChangeType,
  args: {
    access_token: { type: new GraphQLNonNull(GraphQLString) },
    user_id: { type: new GraphQLNonNull(GraphQLString) },
    new_email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return changeEmail(args.new_email, args.user_id, args.password, args.newToken)
  }
}

const changeUserPassword = {
  type: ChangeType,
  args: {
    access_token: { type: new GraphQLNonNull(GraphQLString) },
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    new_password: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return changePassword(args.user_id, args.new_password, args.password, args.newToken)
  }
}

const changeUserName = {
  type: ChangeType,
  args: {
    access_token: { type: new GraphQLNonNull(GraphQLString) },
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    new_username: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return changeName(args.user_id, args.new_username, args.password, args.newToken)
  }
}

const changeUserProfile = {
  type: ChangeType,
  args: {
    access_token: { type: new GraphQLNonNull(GraphQLString) },
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    first_name: { type: new GraphQLNonNull(GraphQLString) },
    last_name: { type: new GraphQLNonNull(GraphQLString) },
    nickname: { type: new GraphQLNonNull(GraphQLString) },
    full_name: { type: new GraphQLNonNull(GraphQLString) },
    address: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return changeProfile(args)
  }
}

const logout = {
  type: AuthType,
  args: {
    access_token: { type: GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return serviceLogout(args.access_token)
  }
}

module.exports.signUp = signUp
module.exports.changeUserEmail = changeUserEmail
module.exports.changeUserPassword = changeUserPassword
module.exports.changeUserName = changeUserName
module.exports.changeUserProfile = changeUserProfile
module.exports.logout = logout
