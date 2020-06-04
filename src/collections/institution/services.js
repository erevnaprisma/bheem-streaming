const jwt = require('jsonwebtoken')
const config = require('config')

// model
const Institution = require('./Model')
const Blacklist = require('../blacklist/Model')
const Merchant = require('../merchant/Model')
const { serviceAddBlacklist } = require('../blacklist/services')

// services & constants
const { sendMailVerification, generateRandomNumber, getUnixTime } = require('../../utils/services/supportServices')
const { generateID, Response } = require('../../utils/services/supportServices')
const word = require('../../utils/constants/word')
const number = require('../../utils/constants/number')

const addInstitutionService = async (args) => {
  const { email, deviceID, fullname, address, businessName } = args
  // joi validation
  const { error } = Institution.validation(args)
  if (error) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: error.details[0].message })

  // null input checker
  if (!email) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.INVALID_EMAIL })
  if (!deviceID) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.INVALID_DEVICE_ID })

  // check if email already in used
  const isUsed = await Institution.findOne({ email })
  if (isUsed) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.IS_USED_EMAIL })

  const model = {
    type: 'institutionSignup',
    password: generateRandomNumber(number.PASSWORD),
    email
  }

  // sending email to institution
  await sendMailVerification(model)

  try {
    // save new institution to db
    const institution = new Institution({
      institution_id: generateID(),
      email,
      device_id: deviceID,
      fullname,
      address,
      business_name: businessName,
      password: model.password,
      created_at: getUnixTime(),
      updated_at: getUnixTime()
    })

    await institution.save()

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
    return { status: 200, success: word.WORD_LOGIN_INSTITUTION }
  }

  // null input checker
  if (!email || !password) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.CANNOT_EMPTY })

  // joi validation
  const { error } = Institution.validation({ email, password })
  if (error) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: error.details[0].message })

  try {
    // check if institution exist
    const institution = await Institution.findOne({ email })
    if (!institution) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.INSTITUTION_ID_NOT_FOUND })

    await institution.comparedPassword(password)

    // create access token
    const accessToken = await jwt.sign({ institution: institution.merchant_id }, config.get('privateKeyInstitution'), { expiresIn: '30min' })

    return { status: number.STATUS_CODE_SUCCESS, success: word.WORD_LOGIN_INSTITUTION, access_token: accessToken, institution_id: institution.institution_id }
  } catch (err) {
    return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: err || word.INSTITUTION_LOGIN_FAILED })
  }
}

const getInstitutionInfoService = async (institutionID) => {
  if (!institutionID) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.INSTITUTION_INVALID_ID })

  try {
    // check if institution exist
    const institution = await Institution.findOne({ institution_id: institutionID })
    if (!institution) return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.INSTITUTION_ID_NOT_FOUND })

    return { status: 200, success: word.MERCHANT_GET_SUCCESS, institution }
  } catch (err) {
    return Response({ statusCode: number.STATUS_CODE_FAIL, errorMessage: word.INSTITUTION_ID_NOT_FOUND })
  }
}

const checkerValidInstitution = async (institutionID) => {
  if (!institutionID || institutionID === '') throw new Error(word.INSTITUTION_INVALID_ID)

  const res = await Institution.findOne({ institution_id: institutionID })
  if (!res) throw new Error(word.INSTITUTION_ID_NOT_FOUND)

  return res
}

const getAllInstitutionService = async () => {
  try {
    const institution = await Institution.find()
    return { status: 200, success: 'Successfully get all Institution', institution }
  } catch (err) {
    return { status: 400, error: 'Failed get all Institution' }
  }
}

const serviceLogout = async (token) => {
  if (!token) return { status: 400, error: 'Invalid token' }

  try {
    await jwt.verify(token, config.get('privateKeyInstitution'))
    await serviceAddBlacklist(token)
    return { status: 200, success: 'Successfully logout' }
  } catch (err) {
    return { status: 400, success: err }
  }
}

const institutionRelationChecker = async (merchantID, institutionID) => {
  const merchant = await Merchant.findOne({ merchant_id: merchantID })
  let checker = false
  if (merchant) {
    merchant.institution.forEach(e => {
      if (e.institution_id === institutionID) {
        checker = true
      }
    })
  } else {
    return false
  }
  if (checker) {
    return true
  } else {
    return false
  }
}

module.exports.addInstitutionService = addInstitutionService
module.exports.checkerValidInstitution = checkerValidInstitution
module.exports.getAllInstitutionService = getAllInstitutionService
module.exports.loginService = loginService
module.exports.getInstitutionInfoService = getInstitutionInfoService
module.exports.serviceLogout = serviceLogout
module.exports.institutionRelationChecker = institutionRelationChecker
