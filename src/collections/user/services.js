const jwt = require('jsonwebtoken')
const config = require('config')
const express = require('express')
const router = express()
const { v4: uuidv4 } = require('uuid')

const User = require('./Model')
const Otp = require('../otp/Model')
const { reusableFindUserByID } = require('../../utils/services/mongoServices')
const { generateRandomStringAndNumber, sendMailVerification, getUnixTime, generateRandomNumber, generateID, isEqual } = require('../../utils/services/supportServices')
const { WORD_SIGN_UP, WORD_LOGIN, WORD_CHANGE_PASSWORD, WORD_CHANGE_USERNAME, errorHandling } = require('../../utils/constants/word')
const { serviceAddBlacklist } = require('../blacklist/services')
const Blacklist = require('../blacklist/Model')
const { RANDOM_STRING_FOR_CONCAT } = require('../../utils/constants/number')

const userSignup = async (email, deviceID) => {
  const { error } = User.validation({ email, device_id: deviceID })
  if (error) return { status: 400, error: error.details[0].message }

  const emailCheck = await User.findOne({ email })
  if (emailCheck) return { status: 400, error: 'Email already used' }

  // for send Email
  const userBeforeSentEmail = {
    type: 'signupUser',
    password: generateRandomNumber(4),
    email
  }

  await sendMailVerification(userBeforeSentEmail)
  // if (!emailSent) return { status: 400, error: 'Failed sent email' }

  let user = new User({
    user_id: generateID(RANDOM_STRING_FOR_CONCAT),
    email,
    device_id: deviceID,
    username: generateRandomStringAndNumber(8),
    password: userBeforeSentEmail.password,
    created_at: getUnixTime(),
    updated_at: getUnixTime()
  })

  // const localPassword = user.password

  try {
    const accessToken = await jwt.sign({ user_id: user.user_id }, config.get('privateKey'), { expiresIn: '30min' })

    user = await user.save()

    // user.password = localPassword
    // user.type = 'signup'
    // await sendMailVerification(user)

    return { status: 200, user_id: user.user_id, access_token: accessToken, success: WORD_SIGN_UP }
  } catch (err) {
    return { status: '500', error: err || 'Failed to save to data...' }
  }
}

const userLogin = async (email, password, token, isLoggedInWithToken) => {
  const checkerToken = await Blacklist.findOne({ token })
  if (checkerToken) return { status: 400, error: 'Token already expired' }

  // login with token
  if (isLoggedInWithToken) {
    return { status: 200, success: WORD_LOGIN }
  }
  if (!email || !password) {
    return { status: 400, error: 'Email or Password can\'t be empty' }
  }

  const user = await User.findOne({ email })
  if (!user) return { status: 400, error: 'Invalid email or password', user: null }
  try {
    // verified password
    await user.comparedPassword(password)

    // generate access token
    const accessToken = await jwt.sign({ user_id: user._id }, config.get('privateKey'), { expiresIn: '30min' })
    // login with username & password
    return {
      status: 200,
      access_token: accessToken,
      user_id: user.user_id,
      success: WORD_LOGIN
    }
  } catch (err) {
    return { status: 500, error: err }
  }
}

// const changeEmail = async (newEmail, userID, password, token = null) => {
//   if (!newEmail || !password) return { status: 400, error: 'Must provide email or password' }

//   if (!userID) return { status: 400, error: 'User ID not found' }

//   const emailChecker = await User.findOne({ email: newEmail })
//   if (emailChecker) return { status: 400, error: 'Email already used' }

//   await checkerValidUser(userID)
//   console.log('sampai sini')

//   const { error } = User.validation({ email: newEmail })
//   if (error) return { status: 400, error: error.details[0].message }

//   try {
//     const user = await reusableFindUserByID(userID)

//     await user.comparedPassword(password)

//     await User.updateOne({ user_id: userID }, { email: newEmail }).catch(() => { errorHandling('Failed updating user') })

//     return { status: 200, success: WORD_CHANGE_EMAIL, new_token: token }
//   } catch (err) {
//     return { status: 400, error: err || 'Update failed' }
//   }
// }

const changePassword = async (userID, newPassword, password, token = null) => {
  if (!newPassword || !password) return { status: 400, error: 'Must provide new password or old password' }

  if (!userID) return { status: 400, error: 'Invalid user id' }

  const { error } = User.validation({ password: newPassword })
  if (error) return { status: 400, error: error.details[0].message }

  try {
    const user = await checkerValidUser(userID)

    await user.comparedPassword(password)

    const hashedPass = await User.hashing(newPassword)
    await User.findOneAndUpdate({ user_id: userID }, { password: hashedPass, updated_at: getUnixTime() }).catch(() => { errorHandling('Failed updating password') })

    return { status: 200, success: WORD_CHANGE_PASSWORD, new_token: token }
  } catch (err) {
    return { status: 400, error: err || 'Update failed' }
  }
}

const changeName = async (userID, newUsername, password, token = null) => {
  if (!newUsername || !password) return { status: 400, error: 'Must provide username or password' }

  if (!userID) return { status: 400, error: 'Invalid user id' }

  try {
    // check if username already used
    const regex = isEqual(newUsername)
    const usernameChecker = await User.findOne({ username: regex })
    if (usernameChecker) return { status: 400, error: 'Username already used' }

    const { error } = User.validation({ username: newUsername })
    if (error) return { status: 400, error: error.details[0].message }

    const user = await checkerValidUser(userID)

    await user.comparedPassword(password)

    await User.findOneAndUpdate({ user_id: userID }, { username: newUsername, updated_at: getUnixTime() }).catch(() => { errorHandling('Failed updating username') })

    return { status: 200, success: WORD_CHANGE_USERNAME, new_token: token }
  } catch (err) {
    return { status: 400, error: err || 'Update failed' }
  }
}

const changeProfile = async args => {
  const { user_id: userID, first_name: firstName, last_name: lastName, nickname, full_name: fullName, address, password } = args
  if (!userID) return { status: 400, error: 'Invalid user_id' }
  // !firstName ? { status: 400, error: 'Invalid user_id'} : true
  // !lastName ? { status: 400, error: 'Invalid user_id'} : true
  // !nickname ? { status: 400, error: 'Invalid user_id'} : true
  // !fullName ? { status: 400, error: 'Invalid user_id'} : true
  // !address ? { status: 400, error: 'Invalid user_id'} : true

  if (!userID) return { status: 400, error: 'Invalid user id' }

  if (!password) return { status: 400, error: 'Invalid password' }

  var user = await checkerValidUser(userID)

  const { error } = await User.validation({ first_name: firstName, last_name: lastName, nickname, full_name: fullName, address })
  if (error) return { status: 400, error: error.details[0].message }

  try {
    await user.comparedPassword(args.password)

    await User.where({ user_id: userID }).update({ $set: { first_name: firstName, last_name: lastName, nickname: nickname, full_name: fullName, address: address }, updated_at: getUnixTime() }).catch(() => { errorHandling('Failed updating user profile') })

    return { status: 200, success: 'Update profile success', new_token: args.newToken }
  } catch (err) {
    return { status: 400, error: err || 'Cannot update profile' }
  }
}

// const forgetPasswordSendOtpService = async (email) => {
//   if (!email) return { status: 400, error: 'Invalid email' }

//   const { error } = User.validation({ email })
//   if (error) return { status: 400, error: error.details[0].message }

//   try {
//     const user = await User.findOne({ email })
//     if (!user) return { status: 400, error: 'Email not found' }

//     const model = {
//       type: 'forgetPasswordSendOtp',
//       email,
//       otp: generateRandomNumber(4)
//     }
//     await sendMailVerification(model)

//     const otp = await new Otp({
//       status: 'ACTIVE',
//       otp_number: model.otp,
//       otp_id: generateID(RANDOM_STRING_FOR_CONCAT),
//       otp_reference_number: generateRandomNumber(6),
//       email,
//       type: 'FORGET PASSWORD',
//       created_at: new Date(),
//       updated_at: new Date(),
//       user_id: user.user_id
//     })

//     await otp.save()

//     return { status: 200, success: 'Successfully send otp', otpRefNum: otp.otp_reference_number }
//   } catch (err) {
//     return { status: 400, error: 'Failed send new password' }
//   }
// }

// const changePasswordViaForgetPasswordService = async (email, otp, password) => {
//   if (!otp) return { status: 400, error: 'Invalid otp' }
//   if (!password) return { status: 400, error: 'Invalid password' }

//   try {
//     const otpChecker = await Otp.findOne({ otp_number: otp, status: 'ACTIVE' })
//     if (!otpChecker) {
//       await Otp.findOneAndUpdate({ })
//       return { status: 400, error: 'Invalid otp' }
//     }

//     const hashedPassword = await User.hashing(password)

//     await User.findOneAndUpdate({ user_id: otpChecker.user_id }, { password: hashedPassword })

//     await Otp.findOneAndUpdate({ otp_number: otp }, { status: 'INACTIVE' })

//     return { status: 200, success: 'Successfully change password' }
//   } catch (err) {
//     return { status: 400, error: 'Failed change password' }
//   }
// }

// router.post('/sendLinkForgetPassword', async (req, res) => {
//   console.log('sampe sini')
//   const { email, name } = req
//   console.log(email + name)
//   // if (!req.email) res.status(400).send({ error: 'Invalid email' })

//   // const { error } = User.validation({ email: req.email })
//   // if (error) res.status(400).send({ error: error.details[0].message })

//   try {
//     // const user = await User.findOne({ email: req.email })
//     // if (!user) return { status: 400, error: 'Email not found' }

//     const uuid = await uuidv4()

//     const model = {
//       type: 'sendLinkForgetPassword',
//       email: 'michaelleopold2016@gmail.com',
//       link: `http://localhost:3000/send/${uuid}`
//     }
//     console.log('sebelum email')
//     await sendMailVerification(model)
//     console.log('sesudah email')
//     res.status(200).send('Successfully send link')
//   } catch (err) {
//     res.status(400).send('Failded to send new password')
//   }
// })

// router.get('/send/:codeConfirmation', (req, res) => {
//   // console.log('sampe sini')
//   console.log('uuid', req.params)

//   res.send('berhasil')
// })

const getUserProfile = async (userID) => {
  if (!userID) return { status: 400, error: 'Invalid user id' }

  await checkerValidUser(userID)

  try {
    return { user_id: userID, success: 'Success', status: 200 }
  } catch (err) {
    return { status: 400, error: err || 'User not found' }
  }
}

const serviceLogout = async (token) => {
  if (!token) return { status: 400, error: 'Invalid token' }

  try {
    await jwt.verify(token, config.get('privateKey'))
    await serviceAddBlacklist(token)
    return { status: 200, success: 'Successfully logout' }
  } catch (err) {
    return { status: 400, success: err }
  }
}

const checkerValidUser = async (userID) => {
  if (!userID) throw new Error('Invalid user id')

  const res = await User.findOne({ user_id: userID })
  if (!res) throw new Error('Invalid user id')

  return res
}

const checkValidUserUsingEmail = async (email) => {
  if (!email) throw new Error('Invalid email')

  const res = await User.findOne({ email })
  if (!res) throw new Error('Invalid email')

  return res
}

const userChangesValidation = async ({ userID, password }) => {
  return new Promise((resolve, reject) => {
    reusableFindUserByID(userID)
      .then((res) => {
        try {
          resolve(res.comparedPassword(password))
        } catch (err) {
          reject(err)
        }
      })
      .catch((err) => reject(err))
  })
}

module.exports.userSignup = userSignup
module.exports.userLogin = userLogin
// module.exports.changeEmail = changeEmail
module.exports.changePassword = changePassword
module.exports.changeName = changeName
module.exports.changeProfile = changeProfile
module.exports.getUserProfile = getUserProfile
module.exports.serviceLogout = serviceLogout
module.exports.checkerValidUser = checkerValidUser
module.exports.userChangesValidation = userChangesValidation
module.exports.checkValidUserUsingEmail = checkValidUserUsingEmail
// module.exports.router = router
