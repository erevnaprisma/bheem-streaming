const graphql = require('graphql')
const Emoney = require('../Model')

const {
  GraphQLList
} = graphql

const { EmoneyType } = require('./type')
const { getAllTransaction } = require('../services')

const allTransaction = {
  type: new GraphQLList(EmoneyType),
  async resolve (parent, args, context) {
    return getAllTransaction()
  }
}

module.exports.allTransaction = allTransaction
