const Blacklist = require('./Model')
const { getUnixTime } = require('../../utils/services/supportServices')

const serviceAddBlacklist = async (token) => {
  const blacklist = await new Blacklist({
    token,
    created_at: getUnixTime(),
    updated_at: getUnixTime()
  })

  await blacklist.save()
}

const checkerBlacklist = async (token) => {
  const res = await Blacklist.findOne({ token })
  if (res) return new Error('Token is not valid anymore')
}

const checkerBlacklistMerchant = async (token) => {
  const res = await Blacklist.findOne({ token })
  if (res) return new Error('Token is not valid anymore')
}

const checkerBlacklistInstitution = async (token) => {
  const res = await Blacklist.findOne({ token })
  if (res) return new Error('Token is not valid anymore')
}

module.exports.serviceAddBlacklist = serviceAddBlacklist
module.exports.checkerBlacklist = checkerBlacklist
module.exports.checkerBlacklistMerchant = checkerBlacklistMerchant
module.exports.checkerBlacklistInstitution = checkerBlacklistInstitution
