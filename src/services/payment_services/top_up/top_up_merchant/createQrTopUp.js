// Services
const { addBillingMerchantService } = require('../../../../collections/billing/services')
const { addUserTransaction } = require('../../../../collections/transaction/services')
const { checkerValidMerchant } = require('../../../../collections/merchant/services')
const { institutionRelationChecker, checkerValidInstitution } = require('../../../../collections/institution/services')
const { RANDOM_STRING_FOR_CONCAT } = require('../../../../utils/constants/number')
const { generateID, generateRandomStringAndNumber, getUnixTime } = require('../../../../utils/services/supportServices')

// Packages
const bcrypt = require('bcrypt')
const QRCode = require('qrcode')
const CryptoJs = require('crypto-js')
const config = require('config')

// Model
const Qr = require('../../../../collections/qr/Model')
const Serial = require('../../../../collections/serial_numbers/Model')
const User = require('../../../../collections/user/Model')
const Institution = require('../../../../collections/institution/Model')

const createQrTopupMerchant = async (amount, merchantID, email) => {
  if (!amount) return { status: 400, error: 'Invalid amount' }

  try {
    const emailChecker = await User.findOne({ email })
    if (!emailChecker) {
      return { status: 400, error: 'Invalid Email' }
    }
    const merchant = await checkerValidMerchant(merchantID)

    // generate serial
    const unEncryptSerialNumber = generateRandomStringAndNumber(8)

    // encrypt serial
    const encryptedSerialNumber = CryptoJs.HmacSHA256(unEncryptSerialNumber, config.get('serialNumber'))

    // Create Serial Number for Qr Value
    const serial = new Serial({
      serial_id: generateID(RANDOM_STRING_FOR_CONCAT),
      serial_number: encryptedSerialNumber,
      status: 'ACTIVE',
      created_at: getUnixTime(),
      updated_at: getUnixTime()
    })

    await serial.save()

    const qr = await new Qr({
      qr_id: generateID(RANDOM_STRING_FOR_CONCAT),
      type: 'VOUCHER',
      status: 'ACTIVE',
      merchant_id: merchantID,
      created_at: getUnixTime(),
      updated_at: getUnixTime()
    })

    // create Billing
    const bill = await addBillingMerchantService(amount, merchantID)

    // create Transaction
    const transaction = await addUserTransaction({ amount, bill: bill.bill_id, merchantID, qrID: qr.qr_id, transactionMethod: 'Top-up', billing_id_native: bill._id, topup_method: 'Merchant', qr_id_native: qr._id })

    // Create QR Value & add to DB
    const qrValue = { merchant_id_native: merchant._id, merchant_id: merchantID, amount, serial_number: unEncryptSerialNumber, serial_id: serial.serial_id, serial_number_id_native: serial._id, qr_id: qr.qr_id, transaction_id: transaction.transaction_id, merchant_name: merchant.business_name }
    qr.qr_value = qrValue

    // Generate QR PNG
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrValue), { type: 'image/png' })

    // save hashed serial number to qr value
    qr.qr_value.serial_number = encryptedSerialNumber

    // Save QR to DB
    await qr.save()

    return { status: 200, success: 'Successfully Create Voucher', qr_code: qrCode }
  } catch (err) {
    return { status: 400, error: err }
  }
}

module.exports = createQrTopupMerchant

// let finalAmount
// let emoney

// const serviceTopUpMerchant = async (args) => {
//   const { email, amount, merchant_id: merchantID } = args

//   if (!email) return { status: 400, error: 'Invalid email' }
//   if (!amount || args.amount <= 0) return { status: 400, error: 'Invalid amount' }
//   if (!merchantID) return { status: 400, error: 'Invalid Merchant ID' }

//   try {
//     const user = await checkValidUserUsingEmail(email)

//     // check if institution exist
//     await checkerValidMerchant(merchantID)

//     // create new billing
//     const billing = await addBillingMerchantService(amount, merchantID)

//     // create new transaction
//     const transaction = await addUserTransaction({ bill: billing.bill_id, amount: args.amount, userID: user.user_id, user_id_native: user._id, transactionMethod: 'Top-up', merchantID, billing_id_native: billing._id, topup_method: 'Merchant' })

//     // get saldo in saldo collection
//     const getSaldoInstance = await Saldo.findOne({ user_id: user.user_id })

//     // add saldo + set type to credit
//     const type = 'CREDIT'

//     // add e-money
//     if (!getSaldoInstance) {
//       emoney = await addUserPayment({ userID: user.user_id, saldo: args.amount, transactionAmount: args.amount, type })
//     } else {
//       finalAmount = getSaldoInstance.saldo + args.amount
//       emoney = await addUserPayment({ userID: user.user_id, saldo: finalAmount, transactionAmount: args.amount, type })
//     }

//     // update transaction status & e-money id
//     await Transaction.updateOne({ _id: transaction._id }, { status: 'SETLD', emoney_id: emoney.emoney_id, emoney_id_native: emoney._id })

//     // create saldo
//     if (!getSaldoInstance) {
//       await createSaldo(user.user_id, args.amount)
//     } else {
//       await updateSaldo(getSaldoInstance.saldo_id, finalAmount)
//     }

//     return { status: 200, success: 'Successfully topup' }
//   } catch (err) {
//     return { status: 400, error: err }
//   }
// }

// module.exports = serviceTopUpMerchant
