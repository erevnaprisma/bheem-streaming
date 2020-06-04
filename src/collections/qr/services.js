const QRCode = require('qrcode')

// model
const Qr = require('./Model')
const Merchant = require('../merchant/Model')
const Institution = require('../institution/Model')

// service
const { generateID, getUnixTime } = require('../../utils/services/supportServices')
const { RANDOM_STRING_FOR_CONCAT } = require('../../utils/constants/number')
const { checkerValidMerchant } = require('../merchant/services')
const { checkerValidInstitution, institutionRelationChecker } = require('../institution/services')
const { addBillingService } = require('../billing/services')
const { addUserTransaction } = require('../transaction/services')

const createQrStaticService = async (merchantID, institutionID) => {
  const type = 'STATIC'
  const status = 'ACTIVE'

  try {
    // check if merchant id valid
    await checkerValidMerchant(merchantID)

    // check if institution id valid
    await checkerValidInstitution(institutionID)

    // get native _id 
    const { _id: institutionIdNative } = await Institution.findOne({ institution_id: institutionID })

    // check relation between merchant and institution
    const relation = await institutionRelationChecker(merchantID, institutionID)
    if (!relation) return { status: 400, error: 'Institution and Merchant doesn\'t have relation' }

    const qr = new Qr({
      qr_id: generateID(RANDOM_STRING_FOR_CONCAT),
      created_at: getUnixTime(),
      updated_at: getUnixTime(),
      type,
      status,
      merchant_id: merchantID
    })

    const { business_name: businessName, _id: merchantIdNative } = await Merchant.findOne({ merchant_id: merchantID })

    // create a png qrcode
    const qrCode = await generateQrPng({ merchantID: merchantID, merchantName: businessName, qrID: qr.qr_id, type: qr.type, institutionID })

    // save created qrcode to collection
    qr.qr_value = { merchant_id_native: merchantIdNative, merchant_id: merchantID, merchant_name: businessName, qr_id: qr.qr_id, type: qr.type, institution_id: institutionID, institution_id_native: institutionIdNative }

    await qr.save()

    return { status: 200, error: 'Successfully creating QR Code', qr_code: qrCode }
  } catch (err) {
    return { status: 400, error: err || 'Failed create QR Code' }
  }
}

const createQrDynamic = async (merchantID, institutionID, amount) => {
  const type = 'DYNAMIC'
  const status = 'ACTIVE'

  try {
    // check if merchant id valid
    await checkerValidMerchant(merchantID)

    // check if institution id valid
    await checkerValidInstitution(institutionID)

    // get native _id
    const { _id: institutionIdNative } = await Institution.findOne({ institution_id: institutionID })

    // check relation between merchant and institution
    const relation = await institutionRelationChecker(merchantID, institutionID)
    if (!relation) return { status: 400, error: 'Institution and Merchant doens\'t have relation' }

    const qr = new Qr({
      qr_id: generateID(RANDOM_STRING_FOR_CONCAT),
      created_at: getUnixTime(),
      updated_at: getUnixTime(),
      type,
      status,
      merchant_id: merchantID
    })

    // get business name and merchant id native
    const { business_name: businessName, _id: merchantIdNative } = await Merchant.findOne({ merchant_id: merchantID })

    // add billing
    const billing = await addBillingService({ amount, institution_id: institutionID })

    // add transaction
    const transaction = await addUserTransaction({ bill: billing.bill_id, qrID: qr.qr_id, merchantID, transactionMethod: 'E-money', billing_id_native: billing._id, amount, institutionID: institutionID })

    // create a png qrcode 
    const qrCode = await generateQrPng({ merchantID, merchantName: businessName, qrID: qr.qr_id, type: qr.type, institutionID, amount, bill_id: billing.bill_id, transaction_id: transaction.transaction_id })

    // save created qrcode to collection
    qr.qr_value = { merchant_id_native: merchantIdNative, merchant_id: merchantID, merchant_name: businessName, qr_id: qr.qr_id, type, institution_id: institutionID, institution_id_native: institutionIdNative, amount, bill_id: billing.bill_id, transaction_id: transaction.transaction_id }

    // save qr to db
    await qr.save()

    return { status: 200, success: 'Successfully created Qr Code', qr_code: qrCode }
  } catch (err) {
    return { status: 400, error: err || 'Failed create QR Code' }
  }
}

const checkerValidQr = async ({ QrID }) => {
  if (!QrID) throw new Error('Invalid QR Code')

  const res = await Qr.findOne({ qr_id: QrID, status: 'ACTIVE' })
  if (!res) throw new Error('Invalid QR Code')
}

const generateQrPng = async ({ merchantID, merchantName, qrID, type, institutionID, amount = null, transaction_id = null, bill_id = null }) => {
  // const a = await QRCode.image(merchantID, { type: 'png', size: 10, margin: 0 })
  // console.log('a=', JSON.stringify(a))
  // return JSON.stringify(a)

  if (!amount) {
    const res = await QRCode.toDataURL(JSON.stringify({ merchant_id: merchantID, qr_id: qrID, type: type, merchant_name: merchantName, institution_id: institutionID }), { type: 'image/png' })
    return res
  }
  const resWithAmount = await QRCode.toDataURL(JSON.stringify({ merchant_id: merchantID, qr_id: qrID, type, merchant_name: merchantName, institution_id: institutionID, amount, transaction_id, bill_id }), { type: 'image/png' })
  return resWithAmount
}

const showQrService = async (merchantID) => {
  await checkerValidMerchant(merchantID)

  try {
    const qr = await Qr.findOne({ merchant_id: merchantID, status: 'ACTIVE', type: 'STATIC' })

    let qrValue = {}
    if (qr) {
      qrValue = qr.qr_value
    } else {
      return { status: 400, error: 'Merchant doesn\'t have qr code yet' }
    }

    const qrCode = await generateQrPng({ merchantID: qrValue.merchant_id, qrID: qrValue.qr_id, type: qrValue.type, merchantName: qrValue.merchant_name })

    return { status: 200, success: 'Successfully get QrCode', qr_code: qrCode }
  } catch (err) {
    return { status: 400, error: err || 'Show Qr Failed' }
  }
}

const isQrExpired = async (qrID, maximumTime) => {
  const qr = await Qr.findOne({ qr_id: qrID })
  const qrTime = parseInt(qr.created_at)

  // Check if qr code above time limit
  const maxDate = qrTime + parseInt(maximumTime)

  if (getUnixTime() > maxDate) {
    await Qr.updateOne({ qr_id: qr.qr_id }, { status: 'INACTIVE', updated_at: getUnixTime() })
    return false
  }
  return true
}

module.exports.createQrDynamic = createQrDynamic
module.exports.createQrStaticService = createQrStaticService
module.exports.checkerValidQr = checkerValidQr
module.exports.showQrService = showQrService
module.exports.isQrExpired = isQrExpired
