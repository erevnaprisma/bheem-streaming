const graphql = require('graphql')
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID
} = graphql

const QrResponseType = new GraphQLObjectType({
  name: 'QrResponse',
  fields: () => ({
    qr_code: { type: GraphQLString },
    success: { type: GraphQLString },
    status: { type: GraphQLID },
    error: { type: GraphQLString }
  })
})

const TopupQrResponseType = new GraphQLObjectType({
  name: 'TopupQrResponse',
  fields: () => ({
    qr_code: { type: GraphQLString },
    success: { type: GraphQLString },
    status: { type: GraphQLID },
    error: { type: GraphQLString }
  })
})

module.exports = {
  QrResponseType,
  TopupQrResponseType
}
