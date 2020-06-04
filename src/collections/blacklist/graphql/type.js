const graphql = require('graphql')

const {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID
} = graphql

const BlacklistResponseType = new GraphQLObjectType({
  name: 'BlacklistResponseType',
  fields: () => ({
    success: { type: GraphQLString },
    status: { type: GraphQLID },
    error: { type: GraphQLString }
  })
})

module.exports = BlacklistResponseType
