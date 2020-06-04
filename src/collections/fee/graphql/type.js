const graphql = require('graphql')

const {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLID
} = graphql

const ActionTo = new GraphQLEnumType({
  name: 'ActionTo',
  values: {
    operator: { value: 'operator' },
    institution: { value: 'institution' },
    merchant: { values: 'merchant' }
  }
})

const FeeResponseType = new GraphQLObjectType({
  name: 'FeeResponse',
  fields: () => ({
    success: { type: GraphQLString },
    status: { type: GraphQLID },
    error: { type: GraphQLString }
  })
})

module.exports = {
  ActionTo,
  FeeResponseType
}
