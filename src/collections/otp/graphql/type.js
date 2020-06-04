const graphql = require('graphql')

const {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt
} = graphql

const OtpResponseType = new GraphQLObjectType({
  name: 'OtpResponseType',
  fields: () => ({
    otpRefNum: { type: GraphQLString },
    success: { type: GraphQLString },
    status: { type: GraphQLID },
    error: { type: GraphQLString }
  })
})

module.exports.OtpResponseType = OtpResponseType
