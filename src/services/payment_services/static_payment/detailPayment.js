const { getTransaction } = require('../../../collections/transaction/services')
const Merchant = require('../../../collections/merchant/Model')

const transactionDetail = async (transactionID) => {
  try {
    const res = await getTransaction(transactionID)

    const merchant = await Merchant.findOne({ merchant_id: res.merchant_id })

    res.merchant_name = merchant.business_name
    return { status: 200, success: 'Successfully get Transaction Detail', transaction: res }
  } catch (err) {
    return { status: 400, error: err || 'Transaction Detail failed' }
  }
}

module.exports = transactionDetail
