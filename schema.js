const graphql = require('graphql')

// User
const { signUp, changeUserPassword, changeUserName, changeUserProfile, logout } = require('./src/collections/user/graphql/mutation')
const { login, getProfile, allUser } = require('./src/collections/user/graphql/query')

// Emoney
const { allTransaction } = require('./src/collections/emoney/graphql/query')

// Merchant
const { signUpMerchant, logoutMerchant, relationMerchantInstitution, changePasswordMerchant } = require('./src/collections/merchant/graphql/mutation')
const { AllMerchant, MerchantInfo, loginMerchant, MerchantTransactionHistory, merchantDashboard, showRelatedInstitution } = require('./src/collections/merchant/graphql/query')

// Institution
const { logoutInstitution, signUpInstitution } = require('./src/collections/institution/graphql/mutation')
const { AllInstitution, loginInstitution, InstitutionInfo } = require('./src/collections/institution/graphql/query')

// Qr
const { createQrStatic, testing, createQrDynamic } = require('./src/collections/qr/graphql/mutation')
const { showQR } = require('./src/collections/qr/graphql/query')

// Fee
const { addFee, setMerchantFee, setInstitutionFee } = require('./src/collections/fee/graphql/mutation')

// Settlement
const { setSettlement } = require('./src/collections/settlement/graphql/mutation')
const { getAllSettlement, getSettlements } = require('./src/collections/settlement/graphql/query')

// Otp
const {
  sendOtp,
  submitOtp,
  changePasswordViaForgetPassword,
  forgetPasswordSendOtp,
  merchantForgetPassword,
  merchantSubmitForgetPassword,
  institutionForgetPassword,
  institutionSubmitForgetPassword
} = require('./src/collections/otp/graphql/mutation')

// Services
const { topupVa, staticQrPayment, scanQrStatic, detailPayment, cancelStaticPayment, transactionReceipt, topupInstitution, dynamicQrPayment, scanQrDynamic, createQrTopUpMerchant, scanQrTopUpMerchant, paymentTopUpMerchant } = require('./src/services/graphql/mutation')
const { transactionHistory } = require('./src/services/graphql/query')

const {
  GraphQLObjectType,
  GraphQLSchema
} = graphql

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    login,
    getProfile,
    allUser,
    allTransaction,
    transactionHistory,
    showQR,
    AllMerchant,
    MerchantInfo,
    loginMerchant,
    AllInstitution,
    loginInstitution,
    InstitutionInfo,
    MerchantTransactionHistory,
    merchantDashboard,
    showRelatedInstitution,
    getAllSettlement,
    getSettlements
  }
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    signUp,
    // changeUserEmail,
    changeUserName,
    changeUserPassword,
    changeUserProfile,
    signUpMerchant,
    topupVa,
    staticQrPayment,
    createQrStatic,
    scanQrStatic,
    detailPayment,
    cancelStaticPayment,
    sendOtp,
    submitOtp,
    testing,
    transactionReceipt,
    logout,
    changePasswordViaForgetPassword,
    forgetPasswordSendOtp,
    logoutMerchant,
    logoutInstitution,
    signUpInstitution,
    topupInstitution,
    relationMerchantInstitution,
    merchantForgetPassword,
    merchantSubmitForgetPassword,
    institutionForgetPassword,
    institutionSubmitForgetPassword,
    createQrDynamic,
    dynamicQrPayment,
    scanQrDynamic,
    createQrTopUpMerchant,
    scanQrTopUpMerchant,
    changePasswordMerchant,
    addFee,
    setSettlement,
    setMerchantFee,
    paymentTopUpMerchant,
    setInstitutionFee
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})
