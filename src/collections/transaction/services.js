const Transaction = require('./Model')
const { generateID, getUnixTime } = require('../../utils/services/supportServices')
const { RANDOM_STRING_FOR_CONCAT } = require('../../utils/constants/number')
const Merchant = require('../merchant/Model')
const Institution = require('../institution/Model')

const addUserTransaction = async ({ bill, userID = null, qrID = null, qr_id_native = null, amount, merchantID, transactionMethod, institutionID = null, billing_id_native = null, user_id_native = null, topup_method = null }) => {
  // const { error } = Transaction.validation({ user_id: userID, billing_id: bill })
  // if (error) throw new Error({ status: 400, error: error.details[0].message })
  try {
    if (merchantID) {
      var nativeMerchantID = await Merchant.findOne({ merchant_id: merchantID }).select('_id')
    } else {
      nativeMerchantID = null
    }

    if (institutionID) {
      var { _id } = await Institution.findOne({ institution_id: institutionID })
    } else {
      _id = null
    }

    let transaction = await new Transaction({
      merchant_id_native: nativeMerchantID,
      billing_id: bill,
      billing_id_native,
      user_id: userID,
      user_id_native,
      qr_id: qrID,
      qr_id_native,
      merchant_id: merchantID,
      transaction_method: transactionMethod,
      transaction_amount: amount,
      topup_method,
      transaction_id: generateID(RANDOM_STRING_FOR_CONCAT),
      institution_id: institutionID,
      institution_id_native: _id,
      isSettlement: 'N',
      created_at: getUnixTime(),
      updated_at: getUnixTime()
    })
    transaction = await transaction.save()

    return transaction
  } catch (err) {
    throw new Error(err)
  }
}

const getTransaction = async (transactionID) => {
  const transaction = await Transaction.findOne({ transaction_id: transactionID })
  if (!transaction) throw new Error('Invalid Transaction Id')

  return transaction
}

const cancelTransaction = async (transactionID) => {
  return Transaction.updateOne({ transaction_id: transactionID }, { status: 'CANCEL', updated_at: getUnixTime() })
}

const transactionStatusPendingChecker = async (transactionID) => {
  const res = await getTransaction(transactionID)
  if (res) {
    if (res.status !== 'PNDNG') throw new Error('Transaction status is not pending anymore')
  }
}

const checkerValidTransaction = async (transactionID) => {
  if (!transactionID) throw new Error('Invalid Transaction ID')

  const res = await Transaction.findOne({ transaction_id: transactionID })
  if (!res) throw new Error('Invalid Transaction ID')
}

module.exports.addUserTransaction = addUserTransaction
module.exports.getTransaction = getTransaction
module.exports.cancelTransaction = cancelTransaction
module.exports.transactionStatusPendingChecker = transactionStatusPendingChecker
module.exports.checkerValidTransaction = checkerValidTransaction
