// Model
const Fee = require('./Model')
const Merchant = require('../merchant/Model')
const Institution = require('../institution/Model')

// services
const { generateID, generateRandomString, getUnixTime } = require('../../utils/services/supportServices')
const { RANDOM_STRING_FOR_CONCAT } = require('../../utils/constants/number')
const { checkerValidMerchant } = require('../merchant/services')
const { checkerValidInstitution } = require('../institution/services')

const createFeeService = async (fixFee, percentageFee, actionTo, transactionMethod) => {
  if (!fixFee) return { status: 400, error: 'Invalid Fix Fee' }
  if (!percentageFee) return { status: 400, error: 'Invalid percentageFee' }
  if (!actionTo) return { status: 400, error: 'Invalid Action To' }
  if (!transactionMethod) return { status: 400, error: 'Invalid Transaction Method' }

  if (transactionMethod === 'Top-up' && actionTo === 'operator') {
    return { status: 400, error: 'Operator don\'t need Top Up Fee' }
  }
  if (transactionMethod === 'E-money' && actionTo === 'merchant') {
    return { status: 400, error: 'Merchant don\'t need Emoney Fee' }
  }
  try {
    const fee = new Fee({
      fee_id: generateID(RANDOM_STRING_FOR_CONCAT),
      fix_fee_amount: fixFee,
      percentage_fee_amount: percentageFee,
      action_to: actionTo,
      transaction_method: transactionMethod,
      fee_master_code: generateRandomString(8),
      created_at: getUnixTime(),
      updated_at: getUnixTime()
    })

    await fee.save()

    return { status: 200, success: 'Successfully Save Fee' }
  } catch (err) {
    return { status: 400, error: 'Failed Saving Fee' }
  }
}

const setMerchantSchemaFee = async (merchantID, feeID, feeMethod, entity) => {
  if (!feeID) return { status: 400, error: 'Invalid Fee ID' }
  if (!feeMethod) return { status: 400, error: 'Invalid Fee Method' }
  if (!entity) return { status: 400, error: 'Invalid Entity' }

  if (feeMethod === 'Top-up' && entity === 'operator') {
    return { status: 400, error: 'Operator don\'t need Top Up Fee' }
  }

  if (feeMethod === 'E-money' && entity === 'merchant') {
    return { status: 400, error: 'Merchant don\'t need E-Money Fee' }
  }

  try {
    // check if merchant valid
    await checkerValidMerchant(merchantID)

    // check valid fee code
    const validFeeCode = await Fee.findOne({ action_to: entity, fee_id: feeID, transaction_method: feeMethod })
    if (!validFeeCode) {
      return { status: 400, error: 'Invalid Fee ID' }
    }
    // assign feeMasterCode for merchant based on fee method
    var feeCode

    if (entity === 'institution') {
      if (feeMethod === 'Top-up') {
        feeCode = {
          institution_code_topup: feeID
        }
      }

      if (feeMethod === 'E-money') {
        feeCode = {
          institution_code_emoney: feeID
        }
      }
    }

    if (entity === 'operator') {
      if (feeMethod === 'E-money') {
        feeCode = {
          operator_code_emoney: feeID
        }
      }
    }

    if (entity === 'merchant') {
      if (feeMethod === 'Top-up') {
        feeCode = {
          merchant_code_topup: feeID
        }
      }

      if (feeMethod === 'E-money') {
        feeCode = {
          merchant_code_emoney: feeID
        }
      }
    }

    const { feeRules: currentFeeRules } = await Merchant.findOne({ merchant_id: merchantID })

    // if current fee master code is null or undefined
    if (!currentFeeRules) {
      await Merchant.updateOne({ merchant_id: merchantID }, { feeRules: feeCode, updated_at: getUnixTime() })
      return { status: 200, success: 'Successfully Set Merchant Schema Fee' }
    }

    await Merchant.updateOne({ merchant_id: merchantID }, { feeRules: Object.assign(currentFeeRules, feeCode), updated_at: getUnixTime() })

    return { status: 200, success: 'Successfully Set Merchant Schema Fee' }
  } catch (err) {
    return { status: 400, error: 'Failed Set Merchant Schema Fee' }
  }
}

const setInstitutionSchemaFee = async (institutionID, operatorFeeCode, feeMethod) => {
  if (!operatorFeeCode) return { status: 400, error: 'Invalid Operator Fee Code' }
  if (!feeMethod) return { status: 400, error: 'Invalid Fee Method' }

  try {
    await checkerValidInstitution(institutionID)

    // check operator fee code
    const validOperatorFee = await Fee.findOne({ action_to: 'institution', fee_id: operatorFeeCode, transaction_method: feeMethod })
    if (!validOperatorFee) {
      return { status: 400, error: 'Invalid Operator Fee Code' }
    }

    // assign feeMasterCode for merchant based on fee method
    var feeMasterCode

    if (feeMethod === 'Top-up') {
      feeMasterCode = {
        institution_code_topup: operatorFeeCode
      }
    }

    if (feeMethod === 'E-money') {
      feeMasterCode = {
        institution_code_emoney: operatorFeeCode
      }
    }

    const { feeRules: currentFeeRules } = await Institution.findOne({ institution_id: institutionID })

    // if current fee master code is null or undefined
    if (!currentFeeRules) {
      await Institution.updateOne({ institution_id: institutionID }, { feeRules: feeMasterCode, updated_at: getUnixTime() })
      return { status: 200, success: 'Successfully Set Merchant Schema Fee' }
    }

    await Institution.updateOne({ institution_id: institutionID }, { feeRules: Object.assign(currentFeeRules, feeMasterCode), updated_at: getUnixTime() })

    return { status: 200, success: 'Successfully Set Institution Schema Fee' }
  } catch (err) {
    return { status: 400, error: 'Failed Set Institution Schema Fee' }
  }
}

const checkerValidFeeMasterCode = async (feeMasterCode) => {
  try {
    const fee = await Fee.findOne({ fee_id: feeMasterCode })
    if (!fee) {
      throw new Error('Invalid Fee Code')
    }
    return true
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  createFeeService,
  setMerchantSchemaFee,
  checkerValidFeeMasterCode,
  setInstitutionSchemaFee
}
