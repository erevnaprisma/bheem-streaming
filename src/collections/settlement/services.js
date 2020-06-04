// Model
const Transaction = require('../transaction/Model')
const Merchant = require('../merchant/Model')
const Fee = require('../fee/Model')
const Settlement = require('../settlement/Model')
const Institution = require('../institution/Model')

// Services
const { generateID, getUnixTime } = require('../../utils/services/supportServices')
const { RANDOM_STRING_FOR_CONCAT } = require('../../utils/constants/number')

const setSettlementService = async (transactions, settlements) => {
  try {
    transactions.forEach(async e => {
      await Transaction.updateOne({ transaction_id: e }, { isSettlement: 'Y', updated_at: getUnixTime() })
    })

    settlements.forEach(async e => {
      await Settlement.updateOne({ settlement_id: e }, { status: 'SETLD', updated_at: getUnixTime() })
    })

    return { status: 200, success: 'Successfully Change Settlement', transaction: transactions }
  } catch (err) {
    return { status: 400, error: 'Failed Change Settlement' }
  }
}

const createPaymentSettlement = async (merchantID, transactionID, amount, institutionID) => {
  try {
    // get merchant _id
    const merchant = await Merchant.findOne({ merchant_id: merchantID })

    // get transaction _id
    const transaction = await Transaction.findOne({ transaction_id: transactionID })

    // get institution _id
    const institution = await Institution.findOne({ institution_id: institutionID })

    let institutionFee = {}
    let operatorFee = {}

    const operatorCode = merchant.feeRules.operator_code_emoney
    operatorFee = await Fee.findOne({ fee_id: operatorCode })

    const institutionCode = merchant.feeRules.institution_code_emoney
    institutionFee = await Fee.findOne({ fee_id: institutionCode })

    // if (transactionMethod === 'topup') {
    //   const operatorCode = merchant.fee_master_code.operator_code_topup
    //   operatorFee = await Fee.findOne({ fee_master_code: operatorCode })

    //   const institutionCode = merchant.fee_master_code.institution_code_topup
    //   institutionFee = await Fee.findOne({ fee_master_code: institutionCode })
    // }

    const institutionCalc = calculateFee(amount, institutionFee)

    // settlement for institution
    const institutionSettlement = await new Settlement({
      settlement_id: generateID(RANDOM_STRING_FOR_CONCAT),
      institution_id: institutionID,
      institution_id_native: institution._id,
      transaction_id: transactionID,
      transaction_id_native: transaction._id,
      payment_date: transaction.created_at,
      status: 'PNDNG',
      created_at: getUnixTime(),
      updated_at: getUnixTime(),
      transaction_amount: transaction.transaction_amount,
      action_to: 'institution',
      action_from: 'operator',
      percentage_fee: institutionCalc.percentageFee,
      fix_fee: institutionCalc.fixFee,
      total_fee: institutionCalc.totalFee,
      settlement_amount: institutionCalc.totalFee
    })

    const operatorCalc = calculateFee(amount, operatorFee)

    // settlement for operator
    const operatorSettlement = await new Settlement({
      settlement_id: generateID(RANDOM_STRING_FOR_CONCAT),
      transaction_id: transactionID,
      transaction_id_native: transaction._id,
      payment_date: transaction.created_at,
      status: 'PNDNG',
      created_at: getUnixTime(),
      updated_at: getUnixTime(),
      transaction_amount: transaction.transaction_amount,
      action_to: 'operator',
      action_from: 'operator',
      percentage_fee: operatorCalc.percentageFee,
      fix_fee: operatorCalc.fixFee,
      total_fee: operatorCalc.totalFee,
      settlement_amount: operatorCalc.totalFee
    })

    const merchantTotalFee = institutionSettlement.total_fee + operatorSettlement.total_fee

    // settlement for merchant
    const merchantSettlement = await new Settlement({
      settlement_id: generateID(RANDOM_STRING_FOR_CONCAT),
      merchant_id: merchantID,
      merchant_id_native: merchant._id,
      transaction_id: transactionID,
      transaction_id_native: transaction._id,
      payment_date: transaction.created_at,
      status: 'PNDNG',
      created_at: getUnixTime(),
      updated_at: getUnixTime(),
      transaction_amount: transaction.transaction_amount,
      action_to: 'merchant',
      action_from: 'operator',
      settlement_amount: amount - merchantTotalFee
    })

    await merchantSettlement.save()
    await institutionSettlement.save()
    await operatorSettlement.save()

    return true
  } catch (err) {
    throw new Error(err)
  }
}

const calculateFee = (amount, entity) => {
  const percentageFee = amount * entity.percentage_fee_amount
  const fixFee = entity.fix_fee_amount
  const totalFee = percentageFee + fixFee

  return {
    percentageFee,
    fixFee,
    totalFee
  }
}

const createTopUpSettlementViaMerchant = async (merchantID, transactionID, amount, institutionID) => {
  try {
    // get merchant _id
    const merchant = await Merchant.findOne({ merchant_id: merchantID })

    // get transaction _id
    const transaction = await Transaction.findOne({ transaction_id: transactionID })

    // get institution _id
    const institution = await Institution.findOne({ institution_id: institutionID })

    let institutionFee = {}
    let merchantFee = {}

    const merchantCode = merchant.feeRules.merchant_code_topup
    merchantFee = await Fee.findOne({ fee_id: merchantCode })

    const institutionCode = merchant.feeRules.institution_code_topup
    institutionFee = await Fee.findOne({ fee_id: institutionCode })

    const institutionCalc = calculateFee(amount, institutionFee)

    // settlement for institution
    const institutionSettlement = await new Settlement({
      settlement_id: generateID(RANDOM_STRING_FOR_CONCAT),
      institution_id: institutionID,
      institution_id_native: institution._id,
      transaction_id: transactionID,
      transaction_id_native: transaction._id,
      payment_date: transaction.created_at,
      status: 'PNDNG',
      created_at: getUnixTime(),
      updated_at: getUnixTime(),
      transaction_amount: transaction.transaction_amount,
      action_to: 'institution',
      action_from: 'operator',
      percentage_fee: institutionCalc.percentageFee,
      fix_fee: institutionCalc.fixFee,
      total_fee: institutionCalc.totalFee,
      settlement_amount: institutionCalc.totalFee
    })

    const merchantCalc = calculateFee(amount, merchantFee)

    // settlement for operator
    const merchantSettlement = await new Settlement({
      settlement_id: generateID(RANDOM_STRING_FOR_CONCAT),
      transaction_id: transactionID,
      transaction_id_native: transaction._id,
      merchant_id: merchantID,
      merchant_id_native: merchant._id,
      payment_date: transaction.created_at,
      status: 'PNDNG',
      created_at: getUnixTime(),
      updated_at: getUnixTime(),
      transaction_amount: transaction.transaction_amount,
      action_to: 'merchant',
      action_from: 'operator',
      percentage_fee: merchantCalc.percentageFee,
      fix_fee: merchantCalc.fixFee,
      total_fee: merchantCalc.totalFee,
      settlement_amount: merchantCalc.totalFee
    })

    const operatorTotalFee = institutionSettlement.total_fee + merchantSettlement.total_fee

    // settlement for merchant
    const operatorSettlement = await new Settlement({
      settlement_id: generateID(RANDOM_STRING_FOR_CONCAT),
      transaction_id: transactionID,
      transaction_id_native: transaction._id,
      merchant_id: merchantID,
      merchant_id_native: merchant._id,
      payment_date: transaction.created_at,
      status: 'PNDNG',
      created_at: getUnixTime(),
      updated_at: getUnixTime(),
      transaction_amount: transaction.transaction_amount,
      action_to: 'operator',
      action_from: 'merchant',
      settlement_amount: amount
    })

    await merchantSettlement.save()
    await institutionSettlement.save()
    await operatorSettlement.save()

    return true
  } catch (err) {
    throw new Error(err)
  }
}

const createTopUpSettlementViaInstitution = async (transactionID, amount, institutionID) => {
  try {
    // get transaction _id
    const transaction = await Transaction.findOne({ transaction_id: transactionID })

    // get institution _id
    const institution = await Institution.findOne({ institution_id: institutionID })

    // let institutionFee = {}
    let institutionFee = {}

    const institutionCode = institution.feeRules.institution_code_topup
    institutionFee = await Fee.findOne({ fee_id: institutionCode })

    const institutionCalc = calculateFee(amount, institutionFee)

    // settlement for institution
    const institutionSettlement = await new Settlement({
      settlement_id: generateID(RANDOM_STRING_FOR_CONCAT),
      institution_id: institutionID,
      institution_id_native: institution._id,
      transaction_id: transactionID,
      transaction_id_native: transaction._id,
      payment_date: transaction.created_at,
      status: 'PNDNG',
      created_at: getUnixTime(),
      updated_at: getUnixTime(),
      transaction_amount: transaction.transaction_amount,
      action_to: 'institution',
      action_from: 'operator',
      percentage_fee: institutionCalc.percentageFee,
      fix_fee: institutionCalc.fixFee,
      total_fee: institutionCalc.totalFee,
      settlement_amount: institutionCalc.totalFee
    })

    // settlement for operator
    const operatorSettlement = await new Settlement({
      settlement_id: generateID(RANDOM_STRING_FOR_CONCAT),
      transaction_id: transactionID,
      transaction_id_native: transaction._id,
      institution_id: institutionID,
      institution_id_native: institution._id,
      payment_date: transaction.created_at,
      status: 'PNDNG',
      created_at: getUnixTime(),
      updated_at: getUnixTime(),
      transaction_amount: transaction.transaction_amount,
      action_to: 'operator',
      action_from: 'institution',
      settlement_amount: amount
    })

    await institutionSettlement.save()
    await operatorSettlement.save()

    return true
  } catch (err) {
    throw new Error(err)
  }
}

const getAllSettlementService = async () => {
  try {
    const settlements = await Settlement.find()
    return { status: 200, success: 'Successfully get Settlements', settlements }
  } catch (err) {
    return { status: 400, error: 'Failed get Settlements' }
  }
}

const getSettlementsService = async (id, entity) => {
  if (!id) return { status: 400, error: 'Invalid ID' }
  if (!entity) return { status: 400, error: 'Invalid Entity' }
  try {
    let settlements
    if (entity === 'merchant') {
      const merchantChecker = await Merchant.findOne({ merchant_id: id })
      if (!merchantChecker) return { status: 400, error: 'Invalid ID' }

      settlements = await Settlement.find({ merchant_id: id })
    }

    if (entity === 'institution') {
      const institutionChecker = await Institution.findOne({ institution_id: id })
      if (!institutionChecker) return { status: 400, error: 'Invalid ID' }

      settlements = await Settlement.find({ institution_id: id })
    }

    return { status: 200, success: 'Successfully get Settlements', settlements }
  } catch (err) {
    return { status: 400, error: 'Failed get Merchant Settlement' }
  }
}

module.exports = {
  setSettlementService,
  createPaymentSettlement,
  createTopUpSettlementViaInstitution,
  createTopUpSettlementViaMerchant,
  getAllSettlementService,
  getSettlementsService
}
