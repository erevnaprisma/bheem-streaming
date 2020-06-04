const graphql = require('graphql')

// type
const { ResponseType, StaticPaymentScanType } = require('./type')
const { TransactionDetailType, TransactionHistoryType, DynamicPaymentScanType } = require('./type')
const { TopupQrResponseType } = require('../../collections/qr/graphql/type')

// service
const serviceTopupVaService = require('../payment_services/top_up/topUpVa')
const serviceTopUpInstitution = require('../payment_services/top_up/topUpInstitution')
// const serviceTopUpMerchant = require('../payment_services/top_up/top_up_merchant/topUpMerchant')
const serviceStaticPaymentService = require('../payment_services/static_payment/staticPayment')
const scanPaymentStaticService = require('../payment_services/static_payment/scanPaymentStatic')
const detailPaymentService = require('../payment_services/static_payment/detailPayment')
const cancelStaticPaymentService = require('../payment_services/static_payment/cancelPayment')
const dynamicPaymentService = require('../payment_services/dynamic_qr_payment/dynamicPayment')
const scanPaymentDynamicService = require('../payment_services/dynamic_qr_payment/scanPaymentDynamic')
const createQrTopUpMerchantService = require('../payment_services/top_up/top_up_merchant/createQrTopUp')
const scanQrTopUpMerchantService = require('../payment_services/top_up/top_up_merchant/scanTopUpMerchant')
const paymentTopUpMerchantService = require('../payment_services/top_up/top_up_merchant/paymentTopUpMerchant')
const transactionHistoryService = require('../payment_services/transactionHistory')

const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLID
} = graphql

const topupVa = {
  type: ResponseType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLInt) }
  },
  resolve (parent, args) {
    return serviceTopupVaService(args)
  }
}

const topupInstitution = {
  type: ResponseType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    institution_id: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return serviceTopUpInstitution(args)
  }
}

const createQrTopUpMerchant = {
  type: TopupQrResponseType,
  args: {
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    merchant_id: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return createQrTopUpMerchantService(args.amount, args.merchant_id, args.email)
  }
}

const scanQrTopUpMerchant = {
  type: ResponseType,
  args: {
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    merchant_id: { type: new GraphQLNonNull(GraphQLString) },
    serial_number: { type: new GraphQLNonNull(GraphQLString) },
    user_id: { type: new GraphQLNonNull(GraphQLString) },
    transaction_id: { type: new GraphQLNonNull(GraphQLString) },
    qr_id: { type: new GraphQLNonNull(GraphQLString) },
    serial_id: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return scanQrTopUpMerchantService(args.amount, args.merchant_id, args.serial_number, args.user_id, args.transaction_id, args.qr_id, args.serial_id)
  }
}

const paymentTopUpMerchant = {
  type: ResponseType,
  args: {
    user_id: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    transaction_id: { type: new GraphQLNonNull(GraphQLString) },
    qr_id: { type: new GraphQLNonNull(GraphQLString) },
    serial_id: { type: new GraphQLNonNull(GraphQLString) },
    merchant_id: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return paymentTopUpMerchantService(args.user_id, args.amount, args.qr_id, args.transaction_id, args.serial_id, args.merchant_id, args.password)
  }
}

// const topupMerchant = {
//   type: ResponseType,
//   args: {
//     email: { type: new GraphQLNonNull(GraphQLString) },
//     amount: { type: new GraphQLNonNull(GraphQLInt) },
//     merchant_id: { type: new GraphQLNonNull(GraphQLString) }
//   },
//   resolve (parent, args) {
//     return serviceTopUpMerchant(args)
//   }
// }

const staticQrPayment = {
  type: ResponseType,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    transaction_id: { type: new GraphQLNonNull(GraphQLID) },
    bill_id: { type: new GraphQLNonNull(GraphQLID) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    institution_id: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return serviceStaticPaymentService(args.merchant_id, args.amount, args.user_id, args.transaction_id, args.bill_id, args.password, args.institution_id)
  }
}

const dynamicQrPayment = {
  type: ResponseType,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    transaction_id: { type: new GraphQLNonNull(GraphQLID) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    institution_id: { type: new GraphQLNonNull(GraphQLString) },
    qr_id: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return dynamicPaymentService(args.merchant_id, args.amount, args.user_id, args.transaction_id, args.password, args.institution_id, args.qr_id)
  }
}

const scanQrStatic = {
  type: StaticPaymentScanType,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    qr_id: { type: new GraphQLNonNull(GraphQLID) },
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    institution_id: { type: GraphQLString }
  },
  resolve (parent, args) {
    return scanPaymentStaticService({ merchantID: args.merchant_id, userID: args.user_id, qrID: args.qr_id, institutionID: args.institution_id })
  }
}

const scanQrDynamic = {
  type: DynamicPaymentScanType,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    qr_id: { type: new GraphQLNonNull(GraphQLID) },
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    institution_id: { type: GraphQLString },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    bill_id: { type: new GraphQLNonNull(GraphQLString) },
    transaction_id: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return scanPaymentDynamicService({ merchantID: args.merchant_id, userID: args.user_id, qrID: args.qr_id, institutionID: args.institution_id, amount: args.amount, bill_id: args.bill_id, transaction_id: args.transaction_id, })
  }
}

const detailPayment = {
  type: TransactionDetailType,
  args: {
    transaction_id: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve (parent, args) {
    return detailPaymentService(args.transaction_id)
  }
}

const transactionReceipt = {
  type: TransactionDetailType,
  args: {
    transaction_id: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve (parent, args) {
    return detailPaymentService(args.transaction_id)
  }
}

const cancelStaticPayment = {
  type: ResponseType,
  args: {
    transaction_id: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve (parent, args) {
    return cancelStaticPaymentService(args.transaction_id)
  }
}

module.exports.topupVa = topupVa
module.exports.staticQrPayment = staticQrPayment
module.exports.scanQrStatic = scanQrStatic
module.exports.detailPayment = detailPayment
module.exports.cancelStaticPayment = cancelStaticPayment
module.exports.transactionReceipt = transactionReceipt
module.exports.topupInstitution = topupInstitution
// module.exports.topupMerchant = topupMerchant
module.exports.dynamicQrPayment = dynamicQrPayment
module.exports.scanQrDynamic = scanQrDynamic
module.exports.createQrTopUpMerchant = createQrTopUpMerchant
module.exports.scanQrTopUpMerchant = scanQrTopUpMerchant
module.exports.paymentTopUpMerchant = paymentTopUpMerchant
