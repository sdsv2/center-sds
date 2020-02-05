"use strict";

const express = require('express');
const router = express.Router();

const checkAPI = require('../controllers/apiKey');
const auth = require('../controllers/authMobile');
const dashboard = require('../controllers/dashboardMobile');
const transaction = require('../controllers/transactionMobile');
const account = require('../controllers/accountMobile');
const rsChip = require('../controllers/rsChipMobile');
const product = require('../controllers/productMobile');
const topup = require('../controllers/topupMobile');

router.get('/:apiKey', [checkAPI.keyCenter],function(req, res, next){
  res.json({
    status: 200,
    message: 'Api key Success'
  })
});

router.get('/:apiKey/codeOtp/:hpNumber', [checkAPI.keyCenter], auth.otpUser);
router.get('/:apiKey/loginUser/:codeOtp', [checkAPI.keyCenter], auth.loginUser);
router.get('/:apiKey/dashboard', [checkAPI.keyCenter, auth.sessionUser], dashboard.index);
router.get('/:apiKey/transaction/sales/:dateTrx', [checkAPI.keyCenter, auth.sessionUser], transaction.sales);
router.get('/:apiKey/transaction/deposit/:dateTrx', [checkAPI.keyCenter, auth.sessionUser], transaction.deposit);
router.get('/:apiKey/transaction/reversal', [checkAPI.keyCenter, auth.sessionUser], transaction.reversal);
router.get('/:apiKey/account', [checkAPI.keyCenter, auth.sessionUser], account.index);
router.get('/:apiKey/account/mutation/:dateTrx', [checkAPI.keyCenter, auth.sessionUser], account.mutation);
router.get('/:apiKey/rsNumber', [checkAPI.keyCenter, auth.sessionUser], rsChip.index);
router.get('/:apiKey/searchRsNumber/:rsNumber', [checkAPI.keyCenter, auth.sessionUser], rsChip.dataChip);
router.get('/:apiKey/orderProduct/:chipTypeName/:rsTypeId', [checkAPI.keyCenter, auth.sessionUser], product.index);
router.post('/:apiKey/topup/:dataTopup', [checkAPI.keyCenter, auth.sessionUser], topup.index);

module.exports = router;
