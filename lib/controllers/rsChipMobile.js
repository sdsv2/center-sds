"use strict";

const jwt = require('jsonwebtoken');

const config = require("../config.json");
const common = require("../common");

const modelRsChip = require("../models/rsChip");

exports.index = async function (req, res, next) {
  // body...
  let bearer; let token;
  const authorization = req.header('Authorization');
  if(authorization){
    [bearer, token] = authorization.split(' ');
    try{
      const data = jwt.verify(token, config.app.secretKey);
      if(data){
        let response = {
          status:200, message: "already data", data: {}
        };
        await new Promise(function(resolve, reject) {
          modelRsChip.rsChipCanvasser(data.member_id, function(err, data){
            response.data = data;
            resolve();
          });
        });
        res.status(200).json(response);
        return;
      }else{
        res.status(401).json({status: 304, message: "not found", data: {}});
        return;
      }
    }catch(error){
      common.log("RS Chip "+error.message);
      res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
      return;
    }
  }else{
    res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
    return;
  }
};

exports.dataChip = async function (req, res, next) {
  // body...
  let bearer; let token;
  const authorization = req.header('Authorization');
  if(authorization){
    [bearer, token] = authorization.split(' ');
    try{
      const data = jwt.verify(token, config.app.secretKey);
      if(data){
        let response = {
          status:200, message: "already data", data: {}
        };
        let rsNumber = req.params.rsNumber;
        common.log("search rs number "+rsNumber);
        await new Promise(function(resolve, reject) {
          modelRsChip.dataChipMobile(rsNumber, data.member_id, function(err, data){
            response.data = data;
            resolve();
          });
        });
        res.status(200).json(response);
        return;
      }else{
        res.status(401).json({status: 304, message: "not found", data: {}});
        return;
      }
    }catch(error){
      common.log("RS Chip "+error.message);
      res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
      return;
    }
  }else{
    res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
    return;
  }
};
