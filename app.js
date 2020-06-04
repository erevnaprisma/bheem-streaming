var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const mongoose = require('mongoose')
const config = require('config')
const cors = require('cors')
const hmac = require('./middlewares/hmac')
// const bodyParser = require('body-parser')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var graphqlRouter = require('./routes/grahpql')
// var { router: forgetPassword } = require('./src/collections/user/services')

mongoose.connect(config.get('DB'), { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(() => console.log('Server Timeout...'))

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// app.use(bodyParser.json())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(cors())
// app.use(hmac())

app.use('/', indexRouter)
// app.use(forgetPassword)

app.use('/graphql', graphqlRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Running on Localhost:${port}`)
})

module.exports = app
