const Transaction = require('../../collections/transaction/Model')
const Institution = require('../../collections/institution/Model')
const { checkerValidUser } = require('../../collections/user/services')

const transactionHistory = async (id) => {
  try {
    await checkerValidUser(id)

    const transaction = await Transaction.find({ user_id: id, status: 'SETLD' }).populate('merchant_id_native')
    if (!transaction) return { status: 400, error: 'No Transaction' }

    // add Merchant username to response
    transaction.forEach(e => {
      if (e.merchant_id_native) {
        if (e.transaction_method === 'E-money' || e.transaction_method === 'Top-up') {
          e.merchant_name = e.merchant_id_native.business_name
        }
      } else {
        e.merchant_name = e.topup_method
      }
    })

    // transaction.forEach(e => {
    //   if (e.merchant_id_native) {
    //     if (e.transaction_method !== 'Top-up') {
    //       e.merchant_name = e.merchant_id_native.business_name
    //     } else if (e.topup_method === 'Institution') {
    //       Institution.findOne({ institution_id: transaction.institution_id }).then((institution) => { e.merchant_name = institution.business_name })
    //     } else if (e.topup_method === 'Virtual Account') {
    //       e.merchant_name = 'Virtual Account'
    //     }
    //   } else {
    //     if (e.transaction_method !== 'Top-up') {
    //       e.merchant_name = 'Development'
    //     } else if (e.topup_method === 'Institution') {
    //       Institution.findOne({ institution_id: transaction.institution_id }).then((institution) => {
    //         console.log(institution)
    //         e.merchant_name = institution.business_name
    //       })
    //     } else if (e.topup_method === 'Virtual Account') {
    //       e.merchant_name = 'Virtual Account'
    //     }
    //   }
      
    // })

    return { status: 200, success: 'Successfully get Transaction History', transaction_history: transaction }
  } catch (err) {
    return {
      status: 400,
      error: err || 'Failed get Transaction History'
    }
  }
}

module.exports = transactionHistory
