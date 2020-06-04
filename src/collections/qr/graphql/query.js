const graphql = require('graphql')
const { QrResponseType } = require('./type')

const { showQrService } = require('../services')

const {
  GraphQLString
} = graphql

const showQR = {
  type: QrResponseType,
  args: {
    merchantID: { type: GraphQLString }
  },
  async resolve (parent, args, context) {
    return showQrService(args.merchantID)
  }
}

module.exports.showQR = showQR
