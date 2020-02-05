"use strict";

const jwt = require('jsonwebtoken');
const rn = require('random-number');
const request = require('request');
const moment = require('moment');
const querystring = require('querystring');

const config = require("../config.json");
const common = require("../common");

const modelMember = require('../models/member');

exports.sessionUser = function (req, res, next) {
  // body...
  let bearer; let token;
  const authorization = req.header('Authorization');
  if(authorization){
    [bearer, token] = authorization.split(' ');
    common.log('Bearer '+bearer);
    common.log('token '+token);
    try{
      const data = jwt.verify(token, config.app.secretKey);
      if(data){
        common.log("member id "+data.member_id);
      }else{
        res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
        return;
      }
    }catch(error){
      common.log("sessionUser "+error.message);
      res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
      return;
    }
    next();
  }else{
    res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
  }
};

exports.otpUser = async function (req, res, next) {
  // body...
  let status = 200;
  let response = {
    message: "", data: {}
  };
  try{
    common.log("generate otp for "+req.params.hpNumber);
    let member_id = null;
    let pin = null;
    let user_id = null;
    await new Promise(function(resolve, reject) {
      modelMember.byHpNumber(req, function(err, data){
        if(!err){
          member_id = data[0].member_id;
          pin = data[0].pin;
          user_id = data[0].user_id;
          resolve();
        }else{
          common.log("check hp number "+err);
          resolve();
        }
      });
    });
    if(member_id){
      let options = {
        min: 1000, max: 9999, integer: true
      };
      let number = rn(options);
      common.log("number otp "+number);
      let hpNumber = req.params.hpNumber;
      hpNumber = hpNumber.replace(/^0/,62);
      let data = {code: number, member_id: member_id, user_id: user_id, hp_number: hpNumber, pin: pin};
      response.data.tokenOtp = jwt.sign(data, config.app.otpSecretKey, {expiresIn: '1h'});
      response.message = "kode login sds telah dikirim sms";
      if(config.modem.url_host){
        let dt = new Date();
        let params = querystring.stringify({
          username : 'app1',
          password : '1234',
          modem    : config.modem.modem_name,
          text     : 'kode login anda: '+number,
          to       : hpNumber,
        });
        console.log(config.modem.url_host+'?'+params+'&ts='+moment(dt).format('YYYY-MM-DD HH:mm:ss'));
        request(config.modem.url_host+'?'+params+'&ts='+moment(dt).format('YYYY-MM-DD HH:mm:ss'), function(error, response, body){
          common.log("response: "+response && response.statusCode);
          common.log("body "+body);
        });
      }
    }else{
      status = 404;
      response.message = "No Hp tidak terdaftar";
    }
  }
  catch(error){
    common.log("error otp "+error.message);
    status = 500;
    response.message = "kode failed";
  }
  res.status(status).json(response);
};

exports.loginUser = function (req, res, next) {
  // body...
  let codeOtp = req.params.codeOtp;
  let status = 200;
  let response = {
    message: "", data: {}
  };
  let bearer; let tokenOtp;
  const xTokenOtp = req.header('x-otp-token');
  if(xTokenOtp){
    [bearer, tokenOtp] = xTokenOtp.split(' ');
    common.log('Bearer '+bearer);
    common.log('tokenOtp '+tokenOtp);
    try{
      const data = jwt.verify(tokenOtp, config.app.otpSecretKey);
      if(data){
        common.log("code otp header "+data.code);
        common.log("code otp params "+codeOtp);
        if(codeOtp == data.code){
          response.message = "Login Berhasil";
          let dataLogin = {member_id: data.member_id, user_id: data.user_id, hp_number: data.hp_number, pin: data.pin};
          common.log("Login data "+JSON.stringify(dataLogin));
          common.log("Login screet "+config.app.secretKey)
          response.data.token = jwt.sign(dataLogin, config.app.secretKey, {expiresIn: '6d'});
        }else{
          response.message = 'kode login tidak sama';
          status = 404;
        }
      }else{
        common.log("token otp failed");
        status = 401;
        response.message = 'Invalid/Expired Token Otp';
      }
    }catch(error){
      common.log("Token Otp "+error.message);
      status = 401;
      response.message = "Invalid/Expired Token OTP";
    }
    res.status(status).json(response);
    return;
  }else{
    res.status(401).json({message: "Invalid/Expired Token Otp.", data: {}});
  }
};
