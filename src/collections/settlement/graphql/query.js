const graphql = require('graphql')

const { SettlementResponse, Entity } = require('./type')
const { getAllSettlementService, getSettlementsService } = require('../services')

const {
  GraphQLString,
  GraphQLNonNull
} = graphql

const getAllSettlement = {
  type: SettlementResponse,
  resolve (parent, args) {
    return getAllSettlementService()
  }
}

const getSettlements = {
  type: SettlementResponse,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    entity: { type: new GraphQLNonNull(Entity) }
  },
  resolve (parent, args) {
    return getSettlementsService(args.id, args.entity)
  }
}

module.exports = {
  getAllSettlement,
  getSettlements
}
