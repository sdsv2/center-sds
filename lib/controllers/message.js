"use strict";

const config = require("../config.json");
const common = require("../common");

const request = require('request');

const modelMessage = require('../models/message');
const modelStockRef = require('../models/stockRef');

const topupHandler = require('./topup');

let handler = async function(req, res, next){
  //validation smsc
  let smsc_id = '';
  await new Promise(function(resolve, reject) {
    modelMessage.smsc(req, function(err, data){
      if(err){
        res.json({
          status:'failed',
          message: data
        });
        return;
      }else{
        smsc_id = data;
        resolve();
      }
    });
  });

  //validation msisdn
  let user_id; let pin; let status; let member_id; let outlet_id;
  await new Promise(function(resolve, reject) {
    modelMessage.msisdn(req, function(err, data){
      if(err){
        res.json({
          status:'failed',
          message: data
        });
        return;
      }else{
        user_id = data[0];
        pin = data[1];
        status = data[2];
        member_id = data[3];
        outlet_id = data[4];
        resolve();
      }
    });
  });

  //validation ts
  let ts = req.query.ts;
  let regex = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/;
  let resTs = ts.match(regex);
  if(!resTs){
    common.log("ts invalid "+ts);
    res.json({
      status: 'failed',
      message: 'ts invalid'
    });
    return;
  }
  //validation message
  let msg = req.query.msg;
  if(!msg){
    common.log('msg is empty');
    res.json({
      status: 'failed',
      message: 'msg is empty'
    })
    return;
  }

  //validation pin
  let arrMsgCheck = msg.split('.');
  let pinCheck = arrMsgCheck[arrMsgCheck.length - 1];
  common.log('pin msg '+pinCheck);
  if(pin != pinCheck){
    let pinCheck2 = arrMsgCheck[arrMsgCheck.length - 2];
    common.log('pin2 msg '+pinCheck2);
    if(pin != pinCheck2){
      res.json({
        status: 'failed',
        message: 'pin anda salah'
      });
      return;
    }
  }

  //validation adm id
  let adm_id = req.query.adm_id || '';

  //validation sms interval
  await new Promise(function(resolve, reject) {
    modelMessage.smsInterval(msg,user_id, function(err,data){
      if(err){
        res.json({
          status:'failed',
          message: data
        });
        return;
      }else{
        common.log(data);
        resolve();
      }
    });
  });

  //insert to sms
  let sms_id = null;
  await new Promise(function(resolve, reject) {
    modelMessage.smsInject(smsc_id, msg, user_id, ts, function(err,data){
      if(!err){
        sms_id = data;
        resolve();
      }
    });
  });

  //sorting message type
  let out_msg = null;
  let urlCore; let newTopup; let topupMulti;
  await mapping_process(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, function(err, urlHit, askTopup, askMulti){
    if(err){
      out_msg = urlHit;
      callSmsOutbox(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, out_msg, function(err, data){
        if(err){
          res.json({
            status:'failed',
            message: data
          });
          return;
        }else{
          res.json({
            status: 'success',
            message: data
          });
          return;
        }
      });
    }else{
      urlCore = urlHit;
      newTopup = askTopup;
      topupMulti = askMulti;
    }
  });
  common.log("url Core "+urlCore);
  common.log("new Topup "+newTopup);
  common.log("topup Multi "+topupMulti);
  if(newTopup == 'no' && topupMulti == 'no'){
    await process(urlCore, function(err, data){
      out_msg = data;
    });
    common.log("out msg "+out_msg);
    await new Promise(function(resolve, reject) {
      callSmsOutbox(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, out_msg, function(err,data){
        if(err){
          res.json({
            status:'failed',
            message: data
          });
          return;
        }else{
          res.json({
            status: 'success',
            message: data
          });
          return;
        }
      });
    });
  }else if(newTopup == 'yes' && topupMulti == 'no'){
    await new Promise(function(resolve, reject) {
      modelStockRef.keyword(msg, function(err, data){
        if(err){
          res.json({
            status: 'failed',
            message: data
          });
          return;
        }else{
          resolve();
        }
      });
    });
    let rs_number = null;
    await new Promise(function(resolve, reject) {
      topupHandler.handler(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, function(err, data){
        if(err){
          out_msg = data;
          resolve();
        }else{
          rs_number = data;
          resolve();
        }
      });
    });
    if(!rs_number){
      common.log("out msg "+out_msg);
      await new Promise(function(resolve, reject) {
        callSmsOutbox(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, out_msg, function(err, data){
          if(err){
            res.json({
              status:'failed',
              message: data
            });
            return;
          }else{
            res.json({
              status: 'success',
              message: data
            });
            return;
          }
        });
      });
    }else{
      //XL5.100.0817.pin.2
      let msgForward = msg.split('.');
      let sequence = msgForward[4] ? msgForward[4] : 1;
      urlCore = urlCore +'/'+sms_id+'/'+member_id+'/'+msgForward[0]+'/'+msgForward[1]+'/'+rs_number+'/'+sequence;
      common.log("url Core Trx "+urlCore);
      await process(urlCore, function(err, data){
        out_msg = data;
      });
      common.log("out msg "+out_msg);
      await new Promise(function(resolve, reject) {
        callSmsOutbox(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, out_msg, function(err, data){
          if(err){
            res.json({
              status:'failed',
              message: data
            });
            return;
          }else{
            res.json({
              status: 'success',
              message: data
            });
            return;
          }
        });
      });
    }
  }else if(newTopup == 'yes' && topupMulti == 'yes'){
    //M.X5.20.X10.15.XLN.100000.081906044145.1234
    let arrMsgMulti = msg.split('.');
    let codeMulti = arrMsgMulti.shift();
    let pin = arrMsgMulti.pop();
    let rsNumberMulti = arrMsgMulti.pop();
    let replyMulti = '';
    let sequence= 0;
    for(let i=0; i < arrMsgMulti.length; i++){
      sequence++;
      let keywordMulti = arrMsgMulti.shift();
      let qtyMulti = arrMsgMulti.shift();
      common.log("count "+i+" length msg "+arrMsgMulti.length);
      if(i < 2){
        i = 0;
      }
      //make msg forward Core like XL5.100.0817.pin
      let msgSingle = keywordMulti+'.'+qtyMulti+'.'+rsNumberMulti+'.'+pin+'.'+sequence;

      await new Promise(function(resolve, reject) {
        modelStockRef.keyword(msgSingle, function(err, data){
          if(err){
            res.json({
              status: 'failed',
              message: data
            });
            return;
          }else{
            resolve();
          }
        });
      });
      let rs_number = null;
      await new Promise(function(resolve, reject) {
        topupHandler.handler(ts, msgSingle, user_id, pin, adm_id, sms_id, member_id, outlet_id, function(err, data){
          if(err){
            out_msg = data;
            resolve();
          }else{
            rs_number = data;
            resolve();
          }
        });
      });
      if(!rs_number){
        common.log("out msg "+out_msg);
        await new Promise(function(resolve, reject) {
          callSmsOutbox(ts, msgSingle, user_id, pin, adm_id, sms_id, member_id, outlet_id, out_msg, function(err, data){
            if(err){
              res.json({
                status:'failed',
                message: data
              });
              return;
            }else{
              res.json({
                status: 'success',
                message: data
              });
              return;
            }
          });
        });
      }else{
        //XL5.100.0817.pin.2
        let msgForward = msgSingle.split('.');
        let sequence = msgForward[4] ? msgForward[4] : 1;
        let lastUrlCore = urlCore;
        urlCore = urlCore +'/'+sms_id+'/'+member_id+'/'+msgForward[0]+'/'+msgForward[1]+'/'+rs_number+'/'+sequence;
        common.log("url Core Trx "+urlCore);
        await process(urlCore, function(err, data){
          out_msg = data;
        });
        common.log("out msg "+out_msg);
        replyMulti = replyMulti + out_msg +';';
        urlCore = lastUrlCore;
      }
    }
    await new Promise(function(resolve, reject) {
      callSmsOutbox(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, replyMulti, function(err, data){
        if(err){
          res.json({
            status:'failed',
            message: data
          });
          return;
        }else{
          res.json({
            status: 'success',
            message: data
          });
          return;
        }
      });
    });
  }

};

let mapping_process = async function(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, callback){
  return new Promise(function(resolve, reject) {
    try{
      let map = {
        s: config.core.url_host+'/core/saldoMember/'+config.core.api_key+'/'+user_id,
        gp: config.core.url_host+'/core/gantiPin/'+config.core.api_key+'/'+user_id,
        rep: config.core.url_host+'/core/report/'+config.core.api_key+'/'+user_id,
        m: config.core.url_host+'/core/topup/'+config.core.api_key
      }
      let arrMsg = msg.split('.');
      common.log("keyword msg "+arrMsg[0]);
      let urlCore = null;
      let newTopup = 'no';
      let topupMulti = 'no';
      if(arrMsg[0].toLowerCase() == 's'){
        urlCore = map.s;
        resolve();
        callback('',urlCore, newTopup, topupMulti);
        return;
      }else if(arrMsg[0].toLowerCase() == 'gp'){
        //GP.pinBaru.pinLama
        //pin baru dalam hal ini adalah : arrMsg[1]
        let arrMsg = msg.split('.');
        urlCore = map.gp +'/'+arrMsg[1];
        resolve();
        callback('',urlCore, newTopup, topupMulti);
        return;
      }else if(arrMsg[0].toLowerCase() == 'rep'){
        //REP.ddmmyy.pin OR REP.ddmm.pin OR REP.d.pin
        let arrMsg = msg.split('.');
        urlCore = map.rep+'/'+arrMsg[1];
        callback('',urlCore, newTopup, topupMulti);
        resolve();
        return;
      }else if(arrMsg[0].toLowerCase() == 'm'){
        newTopup = "yes";
        topupMulti = "yes";
        urlCore = map.m;
        callback('', urlCore, newTopup, topupMulti);
        resolve();
        return;
      }else{
        newTopup = 'yes';
        urlCore = config.core.url_host+'/core/topup/'+config.core.api_key;
        resolve();
        callback('',urlCore, newTopup, topupMulti);
        return;
      }
    }
    catch(err){
      common.log("error "+err);
      reject();
      callback('failed',err,'','');
      return;
    }
  });
}

let process = function(urlCore, callback){
  return new Promise(function(resolve, reject) {
    try{
      request(urlCore, function(error, response, body){
        common.log("response: "+response && response.statusCode);
        if(error){
          callback('failed', 'url not found');
          return;
        }else{
          common.log("body "+body);
          let respBody = JSON.parse(body);
          //common.log("message "+respBody.message);
          resolve();
          callback('', respBody.message);
          return;
        }
      });
    }
    catch(err){
      common.log("error "+err);
      reject();
      callback('failed',err);
      return;
    }
  });
}

let callSmsOutbox = async function(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, out_msg, callback){
  await modelMessage.smsOutbox(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, out_msg, function(err, data){
    if(err){
      callback(err, data);
      return;
    }else{
      callback('', data);
      return;
    }
  });
}

exports.handler = handler;
