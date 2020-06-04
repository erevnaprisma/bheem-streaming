const mongoose = require('mongoose')
require('mongoose-type-email')
const bcrypt = require('bcrypt')
const Joi = require('@hapi/joi')

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    min: 5,
    max: 25,
    unique: true
  },
  full_name: {
    type: String,
    min: 6,
    max: 40
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    unique: true
  },
  password: {
    type: String,
    min: 5,
    max: 15
  },
  device_id: {
    type: String,
    min: 2
  },
  first_name: {
    type: String,
    min: 3,
    max: 14
  },
  last_name: {
    type: String,
    min: 3,
    max: 14
  },
  nickname: {
    type: String,
    min: 3,
    max: 10
  },
  address: {
    type: String,
    min: 6,
    max: 50
  },
  profile_picture: {
    type: String
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  }
})

userSchema.pre('save', function (next) {
  const user = this
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err)
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

userSchema.statics.validation = (args) => {
  var regex = /^[a-z][a-z.\s-]{1,255}$/i
  var addRegex = /^[a-zA-Z0-9,.:/ ]*$/

  const schema = Joi.object({
    username: Joi.string().min(5).max(25),
    full_name: Joi.string().min(6).max(40).pattern(new RegExp(regex)),
    email: Joi.string().email(),
    password: Joi.string().min(5).max(15),
    device_id: Joi.string().min(2),
    first_name: Joi.string().min(3).max(14).pattern(new RegExp(regex)),
    last_name: Joi.string().min(3).max(14).pattern(new RegExp(regex)),
    nickname: Joi.string().min(3).max(14).pattern(new RegExp(regex)),
    address: Joi.string().min(6).max(50).pattern(new RegExp(addRegex, 'm'))
  })

  return schema.validate(args)
}

userSchema.statics.hashing = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return reject(err)

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) return reject(err)

        resolve(hash)
      })
    })
  })
}

userSchema.methods.comparedPassword = function (candidatePassword) {
  const user = this
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject('Invalid password')
      }

      if (!isMatch) {
        return reject('Invalid password')
      }

      resolve(true)
    })
  })
}

userSchema.methods.confirmPassword = function (candidatePassword) {
  const user = this
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject({ message: 'Invalid password' })
      }

      if (!isMatch) {
        return reject({ message: 'Invalid password' })
      }

      resolve(true)
    })
  })
}

module.exports = mongoose.model('User', userSchema)
