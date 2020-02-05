"use strict";

const config = require("../config.json");
const common = require("../common");

let centerKey = function(req, res, next){
  if(req.params.apiKey != config.center.api_key){
    common.log("invalid api key "+req.params.apiKey);
    res.json({
      status: 500,
      message: 'api key failed'
    });
  }else{
    next();
  }
};

exports.keyCenter = centerKey;
