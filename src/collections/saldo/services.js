const Saldo = require('./Model')
const User = require('../user/Model')
const { generateID, getUnixTime } = require('../../utils/services/supportServices')
const { RANDOM_STRING_FOR_CONCAT } = require('../../utils/constants/number')
const { checkerValidUser } = require('../user/services')

const createSaldo = async (userID, finalAmount) => {
  await checkerValidUser(userID)

  const { error } = Saldo.validation({ user_id: userID, saldo: finalAmount })
  if (error) return { status: 400, error: error.details[0].message }
  var saldo
  try {
    const user = await User.findOne({ user_id: userID })

    saldo = new Saldo({
      user_id_native: user._id,
      user_id: userID,
      saldo: finalAmount,
      saldo_id: generateID(RANDOM_STRING_FOR_CONCAT),
      created_at: getUnixTime(),
      updated_at: getUnixTime()
    })

    await saldo.save()
  } catch (err) {
    throw new Error(err)
  }
  return saldo
}

const updateSaldo = async (saldoID, finalAmount) => {
  if (!saldoID) return { status: 400, error: 'Invalid saldo id' }
  else if (!finalAmount) return { status: 400, error: 'Invalid final amount' }

  await Saldo.updateOne({ saldo_id: saldoID }, { saldo: finalAmount, updated_at: getUnixTime() })
}

module.exports.createSaldo = createSaldo
module.exports.updateSaldo = updateSaldo
