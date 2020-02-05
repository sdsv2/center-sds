"use strict";

const jwt = require('jsonwebtoken');

const config = require("../config.json");
const common = require("../common");

const modelMember = require("../models/member");
const modelTransaction = require("../models/transaction");

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
          modelMember.byMemberId(data.member_id, function(err, data){
            response.data.member_name = data[0].member_name;
            response.data.member_balance = data[0].member_balance;
            response.data.member_type = data[0].member_type;
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
      common.log("Account "+error.message);
      res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
      return;
    }
  }else{
    res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
    return;
  }
  res.status(200).json({ status: 200, message: 'account ok'});
};

exports.mutation = async function (req, res, next) {
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
          modelTransaction.mutation(data.member_id, req.params.dateTrx, function(err, data){
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
      common.log("Mutation "+error.message);
      res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
      return;
    }
  }else{
    res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
    return;
  }
  res.status(200).json({ status: 200, message: 'account ok'});
};
