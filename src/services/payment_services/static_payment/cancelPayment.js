const { cancelTransaction, transactionStatusPendingChecker, checkerValidTransaction } = require('../../../collections/transaction/services')

const cancelStaticPaymentService = async (transactionID) => {
  await checkerValidTransaction(transactionID)

  await transactionStatusPendingChecker(transactionID)

  try {
    await cancelTransaction(transactionID)

    return { status: 200, success: 'Transaction successfully canceled' }
  } catch (err) {
    return { status: 400, error: err || 'Cancel Failed' }
  }
}

module.exports = cancelStaticPaymentService
