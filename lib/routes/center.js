"use strict";

const express = require('express');
const router = express.Router();

const messaging = require('./messaging');
const mobile = require('./mobile');

router.use('/messaging', messaging);
router.use('/mobile', mobile);

module.exports = router;
