'use strict'

const connection = require('../db');
const common = require('../common');

let dataKeyword = function(msg, callback){
  let arrMsg = msg.split('.');
  let keyword = arrMsg[0];
  let sql = "SELECT keyword FROM stock_ref WHERE keyword=?";
  connection.query(sql, [keyword], function(err, rows, fields){
    if(err){
      common.log("check keyword "+err);
      throw err;
      return;
    }else{
      if(!rows[0]){
        callback('failed', 'keyword tidak dikenal');
        return;
      }else{
        callback('', 'keyword dikenal');
        return;
      }
    }
  });
}

exports.keyword = dataKeyword;
