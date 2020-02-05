"use strict";

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const config = require('./lib/config.json');
const port = config.center.listen_port;
const common = require('./lib/common');

const center = require('./lib/routes/center');

app.use("/images", express.static(path.join(__dirname, '/public/images')));

app.use(function(req, res, next){
  common.log(req.method, req.originalUrl);
  next();
});

app.use(cors());
app.use('/center', center);

app.use(function (req, res, next) {
  res.status(404).json({
    status: 404,
    message: 'Upps.. request service not found!'
  });
});

app.listen(port, () => common.log(`Center SDS listening on port ${port}!`));
