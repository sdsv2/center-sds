'use strict'

const connection = require('../db');
const common = require('../common');

let downline = async function(memberId, callback){
  new Promise(function(resolve, reject) {
    try {
      let sql = "SELECT * FROM member WHERE parent_id=?";
      connection.query(sql, [memberId], function(err, rows, fields){
        if(err){
          common.log("downline "+err);
          throw err;
          return;
        }else{
          if(!rows[0]){
            callback('cvs', 'tidak ada downline');
            return;
          }
          let listDownline = [];
          listDownline.splice(0, listDownline.length);
          for(let i=0; i < rows.length; i++){
            let member_id = rows[i].member_id;
            let member_type = rows[i].member_type;
            listDownline.push(member_id);
          }
          resolve();
          callback('',listDownline);
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

exports.checkTypeDownline = async function (memberId, callback) {
  // body...
  await new Promise(function(resolve, reject) {
    try{
      let sql = "SELECT * FROM member WHERE member_id=?";
      let spvDownline = [];
      spvDownline.splice(0, spvDownline.length);
      connection.query(sql, [member_id], function(err, rows, fields){
        if(err){
          common.log("spv downline "+err);
          throw err;
          return;
        }else{
          if(rows[0].member_type.toLowerCase() == 'spv'){
            resolve();
            callback('', rows[0].member_id);
            return;
          }
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
};

exports.downlineSpv = async function (rs_member_id, listSpv, callback) {
  // body...
  await new Promise(function(resolve, reject) {
    try{
      let findCvs = null;
      for(let i=0; i < listSpv.length; i++){
        let sql = "SELECT * FROM member WHERE parent_id=?";
        connection.query(sql, [listSpv[i]], function(err, rows, fields){
          if(err){
            common.log("spv downline "+err);
            throw err;
            return;
          }else{
            for(let j=0; j < rows.length; j++){
              common.log("downline spv "+rows[j].member_id+" rs member id "+rs_member_id);
              if(rs_member_id == rows[j].member_id){
                common.log("find rs member id "+rs_member_id);
                findCvs = rows[j].member_id;
                resolve();
                callback('', findCvs);
                return;
              }
            }
          }
        });
      }
      resolve();
      callback('', findCvs);
      return;
    }
    catch(err){
      common.log("error "+err);
      reject();
      callback('failed',err);
      return;
    }
  });
}

exports.byHpNumber = async function (req, callback) {
  // body...
  await new Promise(function(resolve, reject) {
    try{
      let hpNumber = req.params.hpNumber;
      hpNumber = hpNumber.replace(/^0/,62);
      common.log("after replace "+hpNumber);
      let sql = "SELECT * FROM user WHERE username=?";
      connection.query(sql, [hpNumber], function(err, rows, fields){
        if(err){
          common.log("by Hp Number "+err);
          throw err;
          return;
        }else{
          if(!rows[0]){
            resolve();
            callback('failed', 'not found');
            return;
          }else{
            resolve();
            callback('', rows);
            return;
          }
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
};

exports.byMemberId = async function (memberId, callback) {
  // body...
  await new Promise(function(resolve, reject) {
    try{
      let sql = "SELECT * FROM member WHERE member_id=?";
      connection.query(sql, [memberId], function(err, rows, fields){
        if(err){
          common.log("by Member ID "+err);
          throw err;
          return;
        }else{
          callback('', rows);
          resolve();
          return;
        }
      });
    }
    catch(error){
      common.log("error "+error);
      reject();
      callback('failed', error);
      return;
    }
  });
};

exports.downline = downline;
