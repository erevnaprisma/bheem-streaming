const graphql = require('graphql')

const {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLID
} = graphql

const SaldoType = new GraphQLObjectType({
  name: 'Saldo',
  fields: () => ({
    saldo_id: { type: GraphQLID },
    saldo: { type: GraphQLInt },
    user_id: { type: GraphQLID }
  })
})

const SaldoResponseType = new GraphQLObjectType({
  name: 'SaldoResponse',
  fields: () => ({
    success: { type: GraphQLString },
    status: { type: GraphQLID },
    error: { type: GraphQLString }
  })
})

module.exports.SaldoType = SaldoType
module.exports.SaldoResponseType = SaldoResponseType
