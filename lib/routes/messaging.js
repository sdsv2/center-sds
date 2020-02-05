"use strict";

const express = require('express');
const router = express.Router();

const checkAPI = require('../controllers/apiKey');
const message = require('../controllers/message');

//http://localhost:4675/center/messaging/:apiKey?msisdn=..&msg=s.1234&ts=..&smsc=...
router.get('/:apiKey', [checkAPI.keyCenter, message.handler],function(req, res, next){
  res.json({
    status: 200,
    message: 'Api key Success'
  })
});

module.exports = router;
