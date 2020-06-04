const WORD_SIGN_UP = 'Success, please check your email'
const WORD_LOGIN = 'Welcome to RayaPay'
const WORD_LOGIN_MERCHANT = 'Welcome to RayaPay Merchant'
const WORD_LOGIN_INSTITUTION = 'Welcome to Rayapay Institution'
const WORD_CHANGE_PASSWORD = 'Change password success'
const WORD_CHANGE_EMAIL = 'Change email success'
const WORD_CHANGE_USERNAME = 'Change username success'
const FALSY = [NaN, null, false, '', undefined]

const CHECK_EMAIL = 'Please check your email'
const FAILED_SIGN_UP = 'Failed Sign Up'
const INVALID_EMAIL = 'Invalid Email'
const INVALID_DEVICE_ID = 'Invalid Device ID'
const INVALID_PASSWORD = 'Invalid Password'
const INVALID_EMAIL_OR_PASSWORD = 'Invalid Email or Password'
const IS_USED_EMAIL = 'Email already in used'
const CANNOT_EMPTY = 'Email or Password can\'t be empty'

// Merchant
const MERCHANT_GET_SUCCESS = 'Successfully get Merchant Info'
const MERCHANT_LOGIN_SUCCESS = 'Successfully login'
const MERCHANT_INVALID_ID = 'Invalid Merchant ID'
const MERCHANT_ID_NOT_FOUND = 'Merchant ID Not Found'
const MERCHANT_LOGIN_FAILED = 'Login Failed'

// Institution
const INSTITUTION_ID_NOT_FOUND = 'Institution ID Not Found'
const INSTITUTION_LOGIN_FAILED = 'Login Failed'
const INSTITUTION_INVALID_ID = 'Invalid Institution ID'
const INSTITUTION_INVALID_ID_NATIVE = 'Invalid Institution ID Native'

// Error
const errorHandling = (text) => {
  throw new Error(text)
}

module.exports = {
  INVALID_EMAIL,
  INVALID_DEVICE_ID,
  IS_USED_EMAIL,
  CHECK_EMAIL,
  FAILED_SIGN_UP,
  MERCHANT_INVALID_ID,
  MERCHANT_GET_SUCCESS,
  INVALID_EMAIL_OR_PASSWORD,
  INVALID_PASSWORD,
  MERCHANT_ID_NOT_FOUND,
  MERCHANT_LOGIN_SUCCESS,
  MERCHANT_LOGIN_FAILED,
  WORD_SIGN_UP,
  WORD_LOGIN,
  WORD_CHANGE_PASSWORD,
  WORD_CHANGE_EMAIL,
  WORD_CHANGE_USERNAME,
  FALSY,
  WORD_LOGIN_MERCHANT,
  CANNOT_EMPTY,
  INSTITUTION_ID_NOT_FOUND,
  WORD_LOGIN_INSTITUTION,
  INSTITUTION_LOGIN_FAILED,
  INSTITUTION_INVALID_ID,
  INSTITUTION_INVALID_ID_NATIVE,
  errorHandling
}
