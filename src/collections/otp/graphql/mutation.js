const graphql = require('graphql')
const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLID,
  GraphQLInt
} = graphql

const { OtpResponseType } = require('./type')
const {
  sendOTPService,
  submitOtpService,
  forgetPasswordSendOtpService,
  changePasswordViaForgetPasswordService,
  merchantChangePasswordViaForgetPasswordService,
  merchantForgetPasswordSendOtpService,
  institutionChangePasswordViaForgetPasswordService,
  institutionForgetPasswordSendOtpService
} = require('../services')

const sendOtp = {
  type: OtpResponseType,
  args: {
    password: { type: new GraphQLNonNull(GraphQLString) },
    new_email: { type: new GraphQLNonNull(GraphQLString) },
    user_id: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve (parent, args) {
    return sendOTPService({ password: args.password, email: args.new_email, userID: args.user_id })
  }
}

const submitOtp = {
  type: OtpResponseType,
  args: {
    otpRefNum: { type: new GraphQLNonNull(GraphQLString) },
    otp: { type: new GraphQLNonNull(GraphQLString) },
    new_email: { type: new GraphQLNonNull(GraphQLString) },
    user_id: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve (parent, args) {
    return submitOtpService({ email: args.new_email, otp: args.otp, userID: args.user_id, otpRefNum: args.otpRefNum })
  }
}

const forgetPasswordSendOtp = {
  type: OtpResponseType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return forgetPasswordSendOtpService(args.email)
  }
}

const changePasswordViaForgetPassword = {
  type: OtpResponseType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    otpRefNum: { type: new GraphQLNonNull(GraphQLString) },
    otp: { type: new GraphQLNonNull(GraphQLString) },
    new_password: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return changePasswordViaForgetPasswordService(args.otp, args.new_password, args.email, args.otpRefNum)
  }
}

const merchantForgetPassword = {
  type: OtpResponseType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return merchantForgetPasswordSendOtpService(args.email)
  }
}

const merchantSubmitForgetPassword = {
  type: OtpResponseType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    otpRefNum: { type: new GraphQLNonNull(GraphQLString) },
    otp: { type: new GraphQLNonNull(GraphQLString) },
    new_password: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return merchantChangePasswordViaForgetPasswordService(args.otp, args.new_password, args.email, args.otpRefNum)
  }
}

const institutionForgetPassword = {
  type: OtpResponseType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return institutionForgetPasswordSendOtpService(args.email)
  }
}

const institutionSubmitForgetPassword = {
  type: OtpResponseType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    otpRefNum: { type: new GraphQLNonNull(GraphQLString) },
    otp: { type: new GraphQLNonNull(GraphQLString) },
    new_password: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve (parent, args) {
    return institutionChangePasswordViaForgetPasswordService(args.otp, args.new_password, args.email, args.otpRefNum)
  }
}

module.exports.sendOtp = sendOtp
module.exports.submitOtp = submitOtp
module.exports.forgetPasswordSendOtp = forgetPasswordSendOtp
module.exports.changePasswordViaForgetPassword = changePasswordViaForgetPassword
module.exports.merchantForgetPassword = merchantForgetPassword
module.exports.merchantSubmitForgetPassword = merchantSubmitForgetPassword
module.exports.institutionForgetPassword = institutionForgetPassword
module.exports.institutionSubmitForgetPassword = institutionSubmitForgetPassword
