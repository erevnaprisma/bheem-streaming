const { sendMailVerification } = require('../../utils/services/supportServices')
const { userChangesValidation } = require('../user/services')
const { generateRandomNumber } = require('../../utils/services/supportServices')
const { generateID, getUnixTime } = require('../../utils/services/supportServices')
const { checkerValidUser } = require('../user/services')
const { checkerValidMerchant } = require('../merchant/services')
const { RANDOM_STRING_FOR_CONCAT } = require('../../utils/constants/number')

const Otp = require('./Model')
const User = require('../user/Model')
const Merchant = require('../merchant/Model')
const Institution = require('../institution/Model')

const sendOTPService = async ({ userID, password, email }) => {
  if (!password) return { status: 400, error: 'Invalid password' }
  if (!email) return { status: 400, error: 'Invalid email' }

  // Check email format
  const { error } = Otp.validation({ email })
  if (error) return { status: 400, error: error.details[0].message }

  try {
    // Check if user valid
    const user = await checkerValidUser(userID)
    await user.comparedPassword(password)

    // Check if email already exist
    const emailAlreadyUsed = await User.findOne({ email: email })
    if (emailAlreadyUsed) return { status: 400, error: 'Email already used' }

    const res = await Otp.findOne({ user_id: userID, status: 'ACTIVE', type: 'CHANGE EMAIL' })
    if (res) {
      const res2 = await expireOtpChecker({ getOtpTime: res.created_at, otp: res.otp_number })
      if (res2) return { status: 400, error: 'We already sent your otp, please wait 2 minutes for another otp' }
    }

    await userChangesValidation({ password, userID: userID })

    const otp = generateRandomNumber(4)
    const otpRefNum = generateRandomNumber(6)

    const otpResult = await new Otp({
      otp_id: generateID(RANDOM_STRING_FOR_CONCAT),
      otp_number: otp,
      otp_reference_number: otpRefNum,
      user_id: userID,
      user_id_native: user._id,
      new_email: email,
      type: 'CHANGE EMAIL',
      created_at: getUnixTime(),
      updated_at: getUnixTime()
    })

    await otpResult.save()

    const model = {
      email: otpResult.new_email,
      otp,
      type: 'otp'
    }

    await sendMailVerification(model)

    return { status: 200, success: 'Please do check your email', otpRefNum: otpResult.otp_reference_number }
  } catch (err) {
    return { status: 400, error: err || 'Otp failed' }
  }
}

const submitOtpService = async ({ otp, email, userID, otpRefNum }) => {
  if (!otp) return { status: 400, error: 'Invalid otp' }
  if (!email) return { status: 400, error: 'Invalid email' }
  if (!userID) return { status: 400, error: 'Invalid user id' }

  await checkerValidUser(userID)

  var otp

  try {
    // Check if otp is on database using otp number
    let res = await Otp.findOne({ otp_number: otp })
    if (res) {
      if (res.isValidLimit === 3) {
        res = null
      }
    }

    if (res) {
      if (res.status === 'INACTIVE') return { status: 400, error: 'Otp already expired' }
      if (res.new_email !== email) return { status: 400, error: 'New email not match' }
      if (otpRefNum !== res.otp_reference_number) return { status: 400, error: 'Otp reference number is invalid' }
    } else if (!res) {
      // Check otp using user id
      otp = await Otp.findOne({ user_id: userID, status: 'ACTIVE', otp_reference_number: otpRefNum })
      if (!otp) {
        throw new Error('Invalid otp')
      } else {
        if (otp.status === 'ACTIVE') {
          if (otp.isValidLimit >= 2) {
            await Otp.updateOne({ user_id: userID, status: 'ACTIVE', otp_reference_number: otpRefNum }, { status: 'INACTIVE', isValidLimit: otp.isValidLimit + 1, updated_at: getUnixTime() })
            return { status: 400, error: 'Otp expired' }
          } else {
            await Otp.updateOne({ user_id: userID, status: 'ACTIVE', otp_reference_number: otpRefNum }, { isValidLimit: otp.isValidLimit + 1, updated_at: getUnixTime() })
            return { status: 400, error: 'Invalid otp' }
          }
        } else {
          return { status: 400, error: 'Otp expired' }
        }
      }
    }

    // Check if otp already expired or not
    const otpCreateAt = parseInt(res.created_at)
    const time = await expireOtpChecker({ getOtpTime: otpCreateAt, otp })
    if (!time) return { status: 400, error: 'Otp expired' }

    // Check if otp above time limit
    // const getOtpTime = res.created_at.getTime()
    // const maxDate = getOtpTime + maximumTime

    await Otp.updateOne({ otp_number: otp }, { status: 'INACTIVE', updated_at: getUnixTime() })
    await User.updateOne({ user_id: userID }, { email: email, updated_at: getUnixTime() })
    return { status: 200, success: 'successfully change email' }
  } catch (err) {
    return { status: 400, error: err || 'Submit otp failed' }
  }
}

const forgetPasswordSendOtpService = async (email) => {
  if (!email) return { status: 400, error: 'Invalid email' }

  const { error } = User.validation({ email })
  if (error) return { status: 400, error: error.details[0].message }

  try {
    const user = await User.findOne({ email })
    if (!user) return { status: 400, error: 'Email not found' }

    // check if already sent forget password otp before
    const alreadySentOtp = await Otp.findOne({ new_email: email, status: 'ACTIVE', type: 'FORGET PASSWORD' })
    if (alreadySentOtp) {
      await Otp.findOneAndUpdate({ new_email: email, status: 'ACTIVE', type: 'FORGET PASSWORD' }, { status: 'INACTIVE', updated_at: getUnixTime() })
    }

    const model = {
      type: 'forgetPasswordSendOtp',
      email,
      otp: generateRandomNumber(4)
    }

    await sendMailVerification(model)

    const otp = await new Otp({
      status: 'ACTIVE',
      otp_number: model.otp,
      otp_id: generateID(RANDOM_STRING_FOR_CONCAT),
      otp_reference_number: generateRandomNumber(6),
      new_email: email,
      type: 'FORGET PASSWORD',
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      user_id: user.user_id,
      user_id_native: user._id
    })

    await otp.save()

    return { status: 200, success: 'Successfully send otp', otpRefNum: otp.otp_reference_number }
  } catch (err) {
    return { status: 400, error: err || 'Failed send new password' }
  }
}

const merchantForgetPasswordSendOtpService = async (email) => {
  if (!email) return { status: 400, error: 'Invalid email' }

  const { error } = User.validation({ email })
  if (error) return { status: 400, error: error.details[0].message }

  try {
    const merchant = await Merchant.findOne({ email })
    if (!merchant) return { status: 400, error: 'Email not found' }

    // check if already send forget password otp before
    const alreadySentOtp = await Otp.findOne({ new_email: email, status: 'ACTIVE', type: 'FORGET PASSWORD' })
    if (alreadySentOtp) {
      await Otp.findOneAndUpdate({ new_email: email, status: 'ACTIVE', type: 'FORGET PASSWORD' }, { status: 'INACTIVE', updated_at: getUnixTime() })
    }

    const model = {
      type: 'forgetPasswordSendOtp',
      email,
      otp: generateRandomNumber(4)
    }

    const otp = await new Otp({
      status: 'ACTIVE',
      otp_number: model.otp,
      otp_id: generateID(RANDOM_STRING_FOR_CONCAT),
      otp_reference_number: generateRandomNumber(4),
      new_email: email,
      type: 'FORGET PASSWORD',
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      merchant_id: merchant.merchant_id,
      merchant_id_native: merchant._id
    })

    await otp.save()

    return { status: 200, success: 'Successfylly send otp', otpRefNum: otp.otp_reference_number }
  } catch (err) {
    return { status: 400, error: err || 'Failed send new password' }
  }
}

const institutionForgetPasswordSendOtpService = async (email) => {
  if (!email) return { status: 400, error: 'Invalid email' }

  const { error } = User.validation({ email })
  if (error) return { status: 400, error: error.details[0].message }

  try {
    const institution = await Institution.findOne({ email })
    if (!institution) return { status: 400, error: 'Email not found' }

    // check if already send forget password otp before
    const alreadySentOtp = await Otp.findOne({ new_email: email, status: 'ACTIVE', type: 'FORGET PASSWORD' })
    if (alreadySentOtp) {
      await Otp.findOneAndUpdate({ new_email: email, status: 'ACTIVE', type: 'FORGET PASSWORD' }, { status: 'INACTIVE', updated_at: getUnixTime() })
    }

    const model = {
      type: 'forgetPasswordSendOtp',
      email,
      otp: generateRandomNumber(4)
    }

    const otp = await new Otp({
      status: 'ACTIVE',
      otp_number: model.otp,
      otp_id: generateID(RANDOM_STRING_FOR_CONCAT),
      otp_reference_number: generateRandomNumber(4),
      new_email: email,
      type: 'FORGET PASSWORD',
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      institution_id: institution.institution_id,
      institution_id_native: institution._id
    })

    await otp.save()

    return { status: 200, success: 'Successfylly send otp', otpRefNum: otp.otp_reference_number }
  } catch (err) {
    return { status: 400, error: err || 'Failed send new password' }
  }
}

const changePasswordViaForgetPasswordService = async (otp, password, email, otpRefNum) => {
  if (!otp) return { status: 400, error: 'Invalid otp' }
  if (!password) return { status: 400, error: 'Invalid password' }

  try {
    const otpChecker = await Otp.findOne({ otp_number: otp, status: 'ACTIVE', otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' })
    if (!otpChecker) {
      const isEmailValid = await Otp.findOne({ new_email: email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' })
      if (isEmailValid) {
        if (isEmailValid.status !== 'ACTIVE') {
          return { status: 400, error: 'Otp expired' }
        }
        if (isEmailValid.isValidLimit <= 2) {
          if (isEmailValid.isValidLimit >= 2) {
            await Otp.findOneAndUpdate({ new_email: email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' }, { status: 'INACTIVE', isValidLimit: isEmailValid.isValidLimit + 1, updated_at: getUnixTime() })
            return { status: 400, error: 'Otp expired' }
          }
          await Otp.findOneAndUpdate({ new_email: email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' }, { isValidLimit: isEmailValid.isValidLimit + 1, updated_at: getUnixTime() })
          return { status: 400, error: 'Invalid otp' }
        } else {
          await Otp.findOneAndUpdate({ email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' }, { status: 'INACTIVE', updated_at: getUnixTime() })
          return { status: 400, error: 'Otp expired' }
        }
      } else {
        return { status: 400, error: 'Invalid otp' }
      }
    }
    const otpTime = parseInt(otpChecker.created_at)
    const time = await expireOtpChecker({ getOtpTime: otpTime, otp })
    if (!time) return { status: 400, error: 'Otp expired' }

    const hashedPassword = await User.hashing(password)

    await User.findOneAndUpdate({ user_id: otpChecker.user_id }, { password: hashedPassword, updated_at: getUnixTime() })

    await Otp.findOneAndUpdate({ otp_number: otp }, { status: 'INACTIVE', updated_at: getUnixTime() })

    return { status: 200, success: 'Successfully change password' }
  } catch (err) {
    return { status: 400, error: 'Failed change password' }
  }
}

const merchantChangePasswordViaForgetPasswordService = async (otp, password, email, otpRefNum) => {
  if (!otp) return { status: 400, error: 'Invalid otp' }
  if (!password) return { status: 400, error: 'Invalid password' }

  try {
    const otpChecker = await Otp.findOne({ otp_number: otp, status: 'ACTIVE', otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' })
    if (!otpChecker) {
      const isEmailValid = await Otp.findOne({ new_email: email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' })
      if (isEmailValid) {
        if (isEmailValid.status !== 'ACTIVE') {
          return { status: 400, error: 'Otp expired' }
        }
        if (isEmailValid.isValidLimit <= 2) {
          if (isEmailValid.isValidLimit >=2) {
            await Otp.findOneAndUpdate({ new_email: email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' }, { status: 'INACTIVE', isValidLimit: isEmailValid.isValidLimit + 1, updated_at: getUnixTime() })
            return { status: 400, error: 'Otp expired' }
          }
          await Otp.findOneAndUpdate({ new_email: email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' }, { isValidLimit: isEmailValid.isValidLimit + 1, updated_at: getUnixTime() })
          return { status: 400, error: 'Invalid otp' }
        } else {
          await Otp.findOneAndUpdate({ email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' }, { status: 'INACTIVE', updated_at: getUnixTime() })
          return { status: 400, error: 'Otp expired' }
        }
      } else {
        return { status: 400, error: 'Invalid otp'}
      }
    }
    const otpTime = parseInt(otpChecker.created_at)
    const time = await expireOtpChecker({ getOtpTime: otpTime, otp })
    if (!time) return { status: 400, error: 'Otp expired' }

    const hashedPassword = await User.hashing(password)

    await Merchant.findOneAndUpdate({ merchant_id: otpChecker.merchant_id }, { password: hashedPassword, updated_at: getUnixTime() })

    await Otp.findOneAndUpdate({ otp_number: otp }, { status: 'INACTIVE', updated_at: getUnixTime() })
    return { status: 200, success: 'Successfully change password' }
  } catch (err) {
    return { status: 400, error: 'Failed change password' }
  }
}

const institutionChangePasswordViaForgetPasswordService = async (otp, password, email, otpRefNum) => {
  if (!otp) return { status: 400, error: 'Invalid otp' }
  if (!password) return { status: 400, error: 'Invalid password' }

  try {
    const otpChecker = await Otp.findOne({ otp_number: otp, status: 'ACTIVE', otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' })
    if (!otpChecker) {
      const isEmailValid = await Otp.findOne({ new_email: email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' })
      if (isEmailValid) {
        if (isEmailValid.status !== 'ACTIVE') {
          return { status: 400, error: 'Otp expired' }
        }
        if (isEmailValid.isValidLimit <= 2) {
          if (isEmailValid.isValidLimit >= 2) {
            await Otp.findOneAndUpdate({ new_email: email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' }, { status: 'INACTIVE', isValidLimit: isEmailValid.isValidLimit + 1, updated_at: getUnixTime() })
            return { status: 400, error: 'Otp expired' }
          }
          await Otp.findOneAndUpdate({ new_email: email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD'}, { isValidLimit: isEmailValid.isValidLimit + 1, updated_at: getUnixTime() })
          return { status: 400, error: 'Invalid otp' }
        } else {
          await Otp.findOneAndUpdate({ email, otp_reference_number: otpRefNum, type: 'FORGET PASSWORD' }, { status: 'INACTIVE', updated_at: getUnixTime() })
          return { status: 400, error: 'Otp expired' }
        }
      } else {
        return { status: 400, error: 'Invalid otp'}
      }
    }
    const otpTime = parseInt(otpChecker.created_at)
    const time = await expireOtpChecker({ getOtpTime: otpTime, otp })
    if (!time) return { status: 400, error: 'Otp expired' }

    const hashedPassword = await User.hashing(password)

    await Institution.findOneAndUpdate({ institution_id: otpChecker.institution_id }, { password: hashedPassword, updated_at: getUnixTime() })

    await Otp.findOneAndUpdate({ otp_number: otp }, { status: 'INACTIVE', updated_at: getUnixTime() })
    return { status: 200, success: 'Successfully change password' }
  } catch (err) {
    return { status: 400, error: 'Failed change password' }
  }
}

const expireOtpChecker = async ({ getOtpTime, otp }) => {
  const maximumTime = 120000

  const created_at = parseInt(getOtpTime)
  console.log(created_at)
  console.log(getOtpTime)

  // Check if otp above time limit
  const maxDate = created_at + maximumTime

  if (getUnixTime() > maxDate) {
    await Otp.updateOne({ otp_number: otp }, { status: 'INACTIVE', updated_at: getUnixTime() })
    return false
  }
  return true
}

module.exports.sendOTPService = sendOTPService
module.exports.submitOtpService = submitOtpService
module.exports.forgetPasswordSendOtpService = forgetPasswordSendOtpService
module.exports.changePasswordViaForgetPasswordService = changePasswordViaForgetPasswordService
module.exports.merchantForgetPasswordSendOtpService = merchantForgetPasswordSendOtpService
module.exports.merchantChangePasswordViaForgetPasswordService = merchantChangePasswordViaForgetPasswordService
module.exports.institutionForgetPasswordSendOtpService = institutionForgetPasswordSendOtpService
module.exports.institutionChangePasswordViaForgetPasswordService = institutionChangePasswordViaForgetPasswordService
