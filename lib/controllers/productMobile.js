"use strict";

const jwt = require('jsonwebtoken');

const config = require("../config.json");
const common = require("../common");

const modelProduct = require('../models/product');

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
          modelProduct.stockRef(req, function(err, data){
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
