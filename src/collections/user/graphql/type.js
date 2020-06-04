const graphql = require('graphql')

const { findUser } = require('../../../utils/services/mongoServices')
const Saldo = require('../../saldo/Model')

const {
  GraphQLString,
  GraphQLID,
  GraphQLObjectType,
  GraphQLInt
} = graphql

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    user_id: { type: GraphQLID },
    full_name: { type: GraphQLString },
    username: { type: GraphQLString },
    device_id: { type: GraphQLString },
    email: { type: GraphQLString },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    nickname: { type: GraphQLString },
    address: { type: GraphQLString },
    saldo: {
      type: GraphQLInt,
      async resolve (parent) {
        const res = await Saldo.findOne({ user_id: parent.user_id }).select('saldo -_id')
        if (!res) return 0
        return res.saldo
      }
    }
  })
})

const AuthType = new GraphQLObjectType({
  name: 'Auth',
  fields: () => ({
    access_token: { type: GraphQLString },
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString },
    user: {
      type: UserType,
      async resolve (parent, args) {
        return findUser(parent.user_id)
      }
    }
  })
})

const ChangeType = new GraphQLObjectType({
  name: 'Change',
  fields: () => ({
    new_token: { type: GraphQLString },
    status: { type: GraphQLInt },
    error: { type: GraphQLString },
    success: { type: GraphQLString }
  })
})

module.exports.UserType = UserType
module.exports.AuthType = AuthType
module.exports.ChangeType = ChangeType
