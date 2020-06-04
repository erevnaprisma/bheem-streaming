const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('../schema')
const { applyMiddleware } = require('graphql-middleware')

const authMiddleware = require('../middlewares/auth')

const Router = express.Router()

applyMiddleware(schema, authMiddleware)

Router.all('/',
  graphqlHTTP({
    schema,
    pretty: true,
    graphiql: true
  //   rootValue: root
  }))

module.exports = Router
