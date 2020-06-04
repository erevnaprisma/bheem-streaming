const jwt = require('jsonwebtoken')
const config = require('config')

// model
const Merchant = require('./Model')
const Blacklist = require('../blacklist/Model')
const Transaction = require('../transaction/Model')
const Institution = require('../institution/Model')
const { serviceAddBlacklist } = require('../blacklist/services')
const { checkerValidInstitution } = require('../institution/services')

// services & constants
const { sendMailVerification, generateRandomNumber, getUnixTime } = require('../../utils/services/supportServices')
const { generateID, Response } = require('../../utils/services/supportServices')
const word = require('../../utils/constants/word')
const number = require('../../utils/constants/number')

const addMerchantService = async (args) => {
  const { email, deviceID, fullname, address, businessName } = args
  // joi validation
  const { error } = Merchant.validation(args)
  if (error) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: error.details[0].message })

  // null input checker
  if (!email) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.INVALID_EMAIL })
  if (!deviceID) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.INVALID_DEVICE_ID })

  // check if email already in used
  const isUsed = await Merchant.findOne({ email })
  if (isUsed) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.IS_USED_EMAIL })

  const model = {
    type: 'merchantSignup',
    password: generateRandomNumber(number.PASSWORD),
    email
  }

  // sending email to merchant
  await sendMailVerification(model)

  try {
    // save new merchant to db
    const merchant = new Merchant({
      merchant_id: generateID(),
      email,
      device_id: deviceID,
      fullname,
      address,
      business_name: businessName,
      password: model.password,
      created_at: getUnixTime(),
      updated_at: getUnixTime()
    })

    await merchant.save()

    return { status: number.STATUS_CODE_SUCCESS, success: word.CHECK_EMAIL }
  } catch (err) {
    return { status: number.STATUS_CODE_SUCCESS, error: err || word.FAILED_SIGN_UP }
  }
}

const loginService = async (email, password, token, isLoggedInWithToken) => {
  const checkerToken = await Blacklist.findOne({ token })
  if (checkerToken) return { status: 400, error: 'Token already expired' }

  // login with token
  if (isLoggedInWithToken) {
    return { status: 200, success: word.WORD_LOGIN_MERCHANT }
  }

  // null input checker
  if (!email || !password) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.CANNOT_EMPTY })

  // joi validation
  const { error } = Merchant.validation({ email, password })
  if (error) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: error.details[0].message })

  try {
    // check if merchant exist
    const merchant = await Merchant.findOne({ email })
    if (!merchant) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.MERCHANT_ID_NOT_FOUND })

    await merchant.comparedPassword(password)

    // create access token
    const accessToken = await jwt.sign({ merchant: merchant.merchant_id }, config.get('privateKeyMerchant'), { expiresIn: '30min' })

    return { status: number.STATUS_CODE_SUCCESS, success: word.WORD_LOGIN_MERCHANT, access_token: accessToken, merchant_id: merchant.merchant_id }
  } catch (err) {
    return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: err || word.MERCHANT_LOGIN_FAILED })
  }
}

const getMerchantInfoService = async (merchantID) => {
  if (!merchantID) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.MERCHANT_INVALID_ID })

  try {
    // check if merchant exist
    const merchant = await Merchant.findOne({ merchant_id: merchantID })
    console.log(merchant)
    if (!merchant) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.MERCHANT_ID_NOT_FOUND })

    return { status: 200, success: word.MERCHANT_GET_SUCCESS, merchant }
  } catch (err) {
    return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.MERCHANT_ID_NOT_FOUND })
  }
}

const checkerValidMerchant = async (MerchantID) => {
  if (!MerchantID) throw new Error('Invalid Merchant ID')

  const res = await Merchant.findOne({ merchant_id: MerchantID })
  if (!res) throw new Error('Invalid Merchant ID')

  return res
}

const getAllMerchantService = async () => {
  try {
    const merchant = await Merchant.find()
    return { status: 200, success: 'Successfully get all merchant', merchant }
  } catch (err) {
    return { status: 400, error: 'Failed get all Merchant' }
  }
}

const serviceLogout = async (token) => {
  if (!token) return { status: 400, error: 'Invalid token' }

  try {
    await jwt.verify(token, config.get('privateKeyMerchant'))
    await serviceAddBlacklist(token)
    return { status: 200, success: 'Successfully logout' }
  } catch (err) {
    return { status: 400, success: err }
  }
}

const merchantTransactionHistoryService = async (merchantID) => {
  try {
    await checkerValidMerchant(merchantID)

    const transaction = await Transaction.find({ merchant_id: merchantID }).populate('merchant_id_native')

    const filterTransaction = transaction.filter(e => e.merchant_id_native !== null)

    filterTransaction.forEach(e => {
      e.merchant_name = e.merchant_id_native.business_name
    })

    return { status: number.STATUS_CODE_SUCCESS, success: 'Successfully get Merchant Transactions', transaction: filterTransaction }
  } catch (err) {
    return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: err || 'Fail get Transaction History' })
  }
}

const merchantDashboardService = async (merchantID) => {
  try {
    let totalTransaction = 0
    let totalAmountTransaction = 0
    let todayTotalAmountTransaction = 0

    await checkerValidMerchant(merchantID)

    const transaction = await Transaction.find({ merchant_id: merchantID, status: 'SETLD' }).populate('merchant_id_native')

    const filterTransaction = transaction.filter(e => e.merchant_id_native !== null)

    filterTransaction.forEach(e => {
      e.merchant_name = e.merchant_id_native.business_name
      totalAmountTransaction = totalAmountTransaction + e.transaction_amount
      totalTransaction++
    })

    const arrayTodayTransaction = filterTransaction.filter(val => {
      return new Date(parseInt(val.created_at)).getUTCDate() === new Date().getUTCDate()
    }
    )

    arrayTodayTransaction.forEach(t => {
      todayTotalAmountTransaction = todayTotalAmountTransaction + t.transaction_amount
    })
    return { status: 200, success: 'Successfully get Merchant Dashboard ', total_transaction: totalTransaction, total_transaction_amount: totalAmountTransaction, daily_transaction_amount: todayTotalAmountTransaction }
  } catch (err) {
    return Response({ statusCode: 400, errorMessage: 'Failed get Merchant Information' })
  }
}

const merchantInstitutionRelation = async (merchantID, institutionID) => {
  try {
    // check if merchant id valid
    await checkerValidMerchant(merchantID)

    // check if institution id valid
    await checkerValidInstitution(institutionID)

    const institution = await Institution.findOne({ institution_id: institutionID })

    const merchant = await Merchant.findOne({ merchant_id: merchantID })

    var relationChecker = false

    merchant.institution.forEach(e => {
      if (e.institution_id === institutionID) {
        relationChecker = true
      }
    })

    if (relationChecker) {
      return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: 'Institution and Merchant already related' })
    }

    const institutionModel = {
      institution_id: institutionID,
      institution_id_native: institution._id
    }

    const merchantModel = {
      merchant_id: merchantID,
      merchant_id_native: merchant._id
    }

    await Merchant.findOneAndUpdate({ merchant_id: merchantID }, { $push: { institution: institutionModel }, updated_at: getUnixTime() })
    await Institution.findOneAndUpdate({ institution_id: institutionID }, { $push: { merchant: merchantModel }, updated_at: getUnixTime() })

    return Response({ statusCode: number.STATUS_CODE_SUCCESS, successMessage: 'Successfully add Relation' })
  } catch (err) {
    return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: 'Failed Creating Relation' })
  }
}

const InstitutionRelatedToMerchantService = async (merchantID) => {
  try {
    await checkerValidMerchant(merchantID)
    const merchant = await Merchant.findOne({ merchant_id: merchantID })
    const listInstitution = merchant.institution.map(e => {
      return Institution.findOne({ institution_id: e.institution_id })
    })

    return { status: 200, success: 'Successfully get institution', institution: listInstitution }
  } catch (err) {
    return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: 'Failed get Institution' })
  }
}

const changePasswordMerchantService = async (merchantID, password, newPassword) => {
  try {
    // Validating new Password
    const { error } = await Merchant.validation({ password: newPassword })
    if (error) return { status: 400, error: error.details[0].message }

    // Check Validity of merchant ID
    const merchant = await checkerValidMerchant(merchantID)

    // Check current password if true
    await merchant.comparedPassword(password)

    if (password === newPassword) {
      return { status: 400, error: 'Can\'t input same password' }
    }

    const newMerchantPassword = await Merchant.hashing(newPassword)

    await Merchant.updateOne({ merchant_id: merchantID }, { password: newMerchantPassword, updated_at: getUnixTime() })

    return { status: 200, success: 'Successfully Change Password' }
  } catch (err) {
    return { status: 400, error: err || 'Failed Change Password' }
  }
}

module.exports.addMerchantService = addMerchantService
module.exports.checkerValidMerchant = checkerValidMerchant
module.exports.getAllMerchantService = getAllMerchantService
module.exports.loginService = loginService
module.exports.getMerchantInfoService = getMerchantInfoService
module.exports.serviceLogout = serviceLogout
module.exports.merchantTransactionHistoryService = merchantTransactionHistoryService
module.exports.merchantInstitutionRelation = merchantInstitutionRelation
module.exports.merchantDashboardService = merchantDashboardService
module.exports.InstitutionRelatedToMerchantService = InstitutionRelatedToMerchantService
module.exports.changePasswordMerchantService = changePasswordMerchantService
