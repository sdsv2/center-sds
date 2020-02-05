'use strict'

const connection = require('../db');
const common = require('../common');

exports.sales = function (memberId, dateTrx, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    common.log("search date "+dateTrx);
    let sql = "SELECT * FROM topup INNER JOIN stock_ref ON stock_ref.stock_ref_id = topup.stock_ref_id INNER JOIN rs_chip ON rs_chip.rs_id = topup.rs_id LEFT JOIN transaction on transaction.trans_id = topup.trans_id LEFT JOIN mutation ON mutation.trans_id = transaction.trans_id LEFT JOIN sd_log ON sd_log.log_id = topup.log_id WHERE topup.member_id=? AND topup.topup_ts > ? AND topup.topup_ts < ? + INTERVAL 1 DAY";
    connection.query(sql, [memberId, dateTrx, dateTrx], function(err, rows, fields){
      if(err){
        common.log("error query "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed', 'data tidak ditemukan');
          return;
        }else{
          resolve();
          callback('', rows);
          return;
        }
      }
    })
  })
};

exports.deposit = function (memberId, dateTrx, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    common.log("search date "+dateTrx);
    let sql = "SELECT * FROM transaction LEFT JOIN mutation ON mutation.trans_id = transaction.trans_id AND mutation.member_id=? WHERE trans_date >= ? AND trans_date <= ? AND trans_type = ?";
    connection.query(sql, [memberId, dateTrx, dateTrx, 'dep'], function(err, rows, fields){
      if(err){
        common.log("error query "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed', 'data tidak ditemukan');
          return;
        }else{
          resolve();
          callback('', rows);
          return;
        }
      }
    })
  });
};

exports.mutation = function (memberId, dateTrx, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM mutation INNER JOIN transaction on transaction.trans_id = mutation.trans_id WHERE trans_date >= ? AND trans_date <= ? AND member_id=? ORDER BY trans_time DESC";
    connection.query(sql, [dateTrx, dateTrx, memberId], function(err, rows, fields){
      if(err){
        common.log("error query "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed', 'data tidak ditemukan');
          return;
        }else{
          resolve();
          callback('', rows);
          return;
        }
      }
    })
  });
};
