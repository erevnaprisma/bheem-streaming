const Serial = require('./Model')
const bcrypt = require('bcrypt')

const checkerValidSerial = async (serialID, serialNumber) => {
  if (!serialNumber) throw new Error('Invalid Serial Number')

  try {
    const serial = await Serial.findOne({ serial_id: serialID })
    if (!serial) throw new Error('Invalid Serial Number')

    if (serialNumber !== serial.serial_number) throw new Error('Invalid Serial Number')

    return serial
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  checkerValidSerial
}
