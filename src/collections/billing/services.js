const Billing = require('./Model')
const Institution = require('../institution/Model')
const Merchant = require('../merchant/Model')
const { generateID, getUnixTime } = require('../../utils/services/supportServices')
const { RANDOM_STRING_FOR_CONCAT } = require('../../utils/constants/number')

const addBillingService = async ({ amount = null, institution_id = null, merchant = null }) => {
  try {
    // if institution id provided
    if (institution_id) {
      const { _id } = await Institution.findOne({ institution_id })

      let bill = await new Billing({
        bill_id: generateID(RANDOM_STRING_FOR_CONCAT),
        amount,
        institution_id,
        institution_id_native: _id,
        created_at: getUnixTime(),
        updated_at: getUnixTime()
      })
      bill = await bill.save()

      return bill
    }
    // if not
    let bill = await new Billing({
      bill_id: generateID(RANDOM_STRING_FOR_CONCAT),
      amount,
      created_at: getUnixTime(),
      updated_at: getUnixTime()
    })
    bill = await bill.save()

    return bill
  } catch (err) {
    return { status: 400, error: err }
  }
}

const addBillingMerchantService = async (amount, merchantID) => {
  let { _id } = await Merchant.findOne({ merchant_id: merchantID })

  let bill = await new Billing({
    bill_id: generateID(RANDOM_STRING_FOR_CONCAT),
    amount,
    merchant_id: merchantID,
    merchant_id_native: _id,
    created_at: getUnixTime(),
    updated_at: getUnixTime()
  })
  bill = await bill.save()

  return bill
}

const updateBillingAmount = () => {
  console.log('update')
}

const checkerValidBill = async (billID) => {
  if (!billID) throw new Error('Invalid Bill ID')

  const res = await Billing.findOne({ bill_id: billID })
  if (!res) throw new Error('Invalid Bill ID')
}

module.exports.addBillingService = addBillingService
module.exports.updateBillingAmount = updateBillingAmount
module.exports.checkerValidBill = checkerValidBill
module.exports.addBillingMerchantService = addBillingMerchantService
