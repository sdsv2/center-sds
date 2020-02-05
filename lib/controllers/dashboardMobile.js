"use strict";

const jwt = require('jsonwebtoken');

const config = require("../config.json");
const common = require("../common");

const modelMember = require("../models/member");

exports.index = async function (req, res, next) {
  // body...
  let status = 200;
  let response = {
    message:"dashboard ok", data: {}
  };
  let bearer; let token;
  const authorization = req.header('Authorization');
  if(authorization){
    [bearer, token] = authorization.split(' ');
    try{
      const data = jwt.verify(token, config.app.secretKey);
      if(data){
        await new Promise(function(resolve, reject) {
          modelMember.byMemberId(data.member_id, function(err, data){
            response.data.member_name = data[0].member_name;
            response.data.member_balance = data[0].member_balance;
            response.data.member_type = data[0].member_type;
            resolve();
          });
        });
      }else{
        status = 304;
        message = "not found";
      }
    }catch(error){
      common.log("Dashboard "+error.message);
      status = 401;
      message = "Invalid/Expired Token.";
    }
  }else{
    status = 401;
    message = "Invalid/Expired Token.";
  }
  res.status(status).json(response);
};
