'use strict'

const connection = require('../db');
const common = require('../common');

exports.stockRef = function (req, callback) {
  // body...
  let chipTypeName = req.params.chipTypeName;
  let rsTypeId = req.params.rsTypeId;
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM stock_ref INNER JOIN stock_ref_type ON stock_ref_type.ref_type_id = stock_ref.ref_type_id LEFT JOIN pricing ON pricing.stock_ref_id = stock_ref.stock_ref_id AND rs_type_id=? WHERE ref_type_name=?";
    connection.query(sql, [rsTypeId, chipTypeName], function(err, rows, fields){
      if(err){
        common.log("error query "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed', 'product tidak ditemukan');
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
