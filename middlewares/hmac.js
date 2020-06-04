const CryptoJs = require('crypto-js')
const config = require('config')

module.exports = function () {
  return function (req, res, next) {
    const { hmac } = req.headers
    console.log('hmac', hmac)
    console.log('environment variable hmac', config.get('hmac'))
    console.log('body stream', req.body)

    const signature = CryptoJs.HmacSHA256(JSON.stringify(req.body), config.get('hmac')).toString()

    if (signature !== hmac) {
      res.status(400).send({ errors: [{ message: 'Invalid Hmac' }] })
      return
    }

    next()
  }
}
