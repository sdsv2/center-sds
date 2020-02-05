'use strict'

const connection = require('../db');
const common = require('../common');

let smsc = function(req, callback){
  let smsc = req.query.smsc;
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM smsc WHERE smsc_name=?";
    connection.query(sql, [smsc], function(err, rows, fields){
      if(err){
        common.log('query smsc '+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          //reject(new Error("ooops"));
          callback('failed', 'smsc '+smsc+' invalid');
          return;
        }else{
          resolve();
          callback('', rows[0].smsc_id);
          return;
        }
      }
    });
  });
};

let msisdn = function(req, callback){
  let noHp = req.query.msisdn;
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM user WHERE username=? and status=?";
    connection.query(sql, [noHp,1], function(err, rows, fields){
      if(err){
        common.log('query user '+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed', 'msisdn or username = '+noHp+' invalid');
          return;
        }else{
          let data = [rows[0].user_id, rows[0].pin, rows[0].status, rows[0].member_id, rows[0].outlet_id];
          resolve();
          callback('', data);
          return;
        }
      }
    });
  });
};

let smsInterval = function(msg,user_id, callback){
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM config WHERE config_id=?";
    connection.query(sql, [5], function(err, rows, fields){
      if(err){
        common.log('query config '+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed','config nothing');
          return;
        }else{
          let sms_interval = rows[0].config_value;
          sql = "SELECT * FROM sms WHERE sms_int=? and sms_time > DATE_SUB(NOW(), INTERVAL ? MINUTE) AND user_id=?"
          connection.query(sql, [msg, sms_interval, user_id], function(err, rows, fields){
            if(err){
              common.log('query sms interval '+err);
              throw err;
              return;
            }else{
              if(!rows[0]){
                resolve();
                callback('','sms interval not found');
                return;
              }else{
                resolve();
                callback('failed', 'same msg occurs from 0 until '+sms_interval+' minutes');
                return;
              }
            }
          });
        }
      }
    })
  });
}

let smsInject = function(smsc_id, msg, user_id, ts, callback){
  return new Promise((resolve, reject) => {
    let sql = "INSERT INTO sms (smsc_id, sms_int, user_id, sms_time, sms_localtime) value(?, ?, ?, ?, NOW())";
    connection.query(sql, [smsc_id, msg, user_id, ts], function(err, rows, fields){
      if(err){
        common.log("INSERT INTO SMS "+err);
        throw err;
        return;
      }else{
        resolve();
        callback('',rows.insertId);
        return;
      }
    });
  });
}

let smsOutbox = function(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, out_msg, callback){
  return new Promise((resolve, reject) => {
    let sql = "INSERT INTO sms_outbox (sms_id, out_msg, out_status, user_id, out_ts) value(?, ?, ?, ?, NOW())";
    connection.query(sql, [sms_id, out_msg, 'w', user_id], function(err, data, fields){
      if(err){
        common.log("insert sms outbox "+err);
        throw err;
        return;
      }else{
        resolve();
        callback('',out_msg);
        return;
      }
    });
  });
}

exports.smsc = smsc;
exports.msisdn = msisdn;
exports.smsInterval = smsInterval;
exports.smsInject = smsInject;
exports.smsOutbox = smsOutbox;
