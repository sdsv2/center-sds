'use strict'

const connection = require('../db');
const common = require('../common');

let dataChip = function(rsNumber, callback){
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM rs_chip WHERE rs_number=?";
    connection.query(sql, [rsNumber], function(err, rows, fields){
      if(err){
        common.log("error query "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed', 'rs chip tidak ditemukan');
          return;
        }else{
          resolve();
          let listData = [rows[0].rs_id, rows[0].sd_id, rows[0].member_id, rows[0].rs_type_id, rows[0].rs_chip_type];
          callback('', listData);
          return;
        }
      }
    })
  });
}

exports.rsChipCanvasser = function (memberId, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "select * FROM rs_chip INNER JOIN outlet ON outlet.outlet_id = rs_chip.outlet_id INNER JOIN rs_type ON rs_type.rs_type_id = rs_chip.rs_type_id WHERE member_id=?"
    connection.query(sql, [memberId], function(err, rows, fields){
      if(err){
        common.log("rs chip canvasser "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed', 'rs chip tidak ditemukan');
          return;
        }else{
          resolve();
          callback('', rows);
          return;
        }
      }
    });
  });
};

exports.dataChipMobile = function (rsNumber, memberId, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM rs_chip INNER JOIN outlet ON outlet.outlet_id = rs_chip.outlet_id INNER JOIN rs_type ON rs_type.rs_type_id = rs_chip.rs_type_id WHERE rs_number like ? AND member_id = ?";
    connection.query(sql, ["%"+rsNumber+"%", memberId], function(err, rows, fields){
      if(err){
        common.log("error query "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed', 'rs chip tidak ditemukan');
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

exports.dataChip = dataChip;
