// Model
const Saldo = require('../../../../collections/saldo/Model')
const Transaction = require('../../../../collections/transaction/Model')
const Qr = require('../../../../collections/qr/Model')
const Serial = require('../../../../collections/serial_numbers/Model')
const Merchant = require('../../../../collections/merchant/Model')
const Institution = require('../../../../collections/institution/Model')

// Services
const { getUnixTime, generateID } = require('../../../../utils/services/supportServices')
const { RANDOM_STRING_FOR_CONCAT } = require('../../../../utils/constants/number')
const { checkerValidUser } = require('../../../../collections/user/services')
const { createTopUpSettlementViaMerchant } = require('../.../../../../../collections/settlement/services')

const paymentTopUpMerchantService = async (userID, amount, qrID, transactionID, serialID, merchantID, password) => {
  try {
    const user = await checkerValidUser(userID)

    const serial = await Serial.findOne({ serial_id: serialID })

    await user.confirmPassword(password)

    // Update User saldo
    let finalSaldo = 0
    const currentSaldo = await Saldo.findOne({ user_id: userID })
    // if already top up before
    if (currentSaldo) {
      finalSaldo = currentSaldo.saldo + amount
      await Saldo.updateOne({ user_id: userID }, { saldo: finalSaldo, updated_at: getUnixTime() })
    } else {
      const saldo = await new Saldo({
        saldo_id: generateID(RANDOM_STRING_FOR_CONCAT),
        saldo: amount,
        user_id: userID,
        user_id_native: user._id,
        created_at: getUnixTime(),
        updated_at: getUnixTime()
      })

      await saldo.save()
    }

    // Get Institution id from Merchant collection
    const merchant = await Merchant.findOne({ merchant_id: merchantID })

    const institution = await Institution.findOne({ institution_id: merchant.institution[0].institution_id })

    // Update Transaction to Settled
    await Transaction.updateOne({ transaction_id: transactionID }, { status: 'SETLD', user_id: userID, user_id_native: user._id, updated_at: getUnixTime(), institution_id: institution.institution_id, institution_id_native: institution._id })

    // Inactive Qr Code
    await Qr.updateOne({ qr_id: qrID }, { status: 'INACTIVE', updated_at: getUnixTime() })

    // Inactive Serial Number
    await Serial.updateOne({ serial_id: serial.serial_id }, { status: 'INACTIVE', updated_at: getUnixTime() })

    await createTopUpSettlementViaMerchant(merchantID, transactionID, amount, institution.institution_id)

    return { status: 200, success: 'Transaction Success' }
  } catch (err) {
    return { status: 400, error: err.message || 'Failed Confirm Payment' }
  }
}

module.exports = paymentTopUpMerchantService
