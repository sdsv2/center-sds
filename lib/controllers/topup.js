"use strict";

const config = require("../config.json");
const common = require("../common");

const modelRsChip = require('../models/rsChip');
const modelMember = require('../models/member');

let handler = async function(ts, msg, user_id, pin, adm_id, sms_id, member_id, outlet_id, callback){
  let arrMsg = msg.split('.');
  let rs_number = arrMsg[2];
  common.log('rs number before '+rs_number);
  rs_number = rs_number.replace(/^0/,62);
  common.log('rs number '+rs_number);
  let rs_id; let sd_id; let rs_member_id; let rs_type_id; let rs_chip_type;
  await modelRsChip.dataChip(rs_number, function(err, data){
    if(err){
      callback(err, data);
      return;
    }else{
      rs_id = data[0];
      sd_id = data[1];
      rs_member_id = data[2];
      rs_type_id = data[3];
      rs_chip_type = data[4];
    }
  });
  common.log("rs member id "+rs_member_id +' member id '+member_id);
  if(rs_member_id != member_id){
    let findDownline = null;
    let listDownline = [];
    await new Promise(function(resolve, reject) {
      modelMember.downline(member_id, function(err, data){
        if(err == 'cvs'){
          callback('failed', 'rs number tidak sesuai dengan data anda');
          return;
        }else{
          listDownline.splice(0, listDownline.length);
          for(let i=0; i < data.length; i++){
            common.log("downline id "+data[i]);
            listDownline.push(data[i]);
            if(rs_member_id == data[i]){
              findDownline = data[i];
            }
          }
          resolve();
        }
      });
    });
    common.log("find downline "+findDownline);
    await new Promise(function(resolve, reject) {
      if(!findDownline){
        common.log("search cvs");
        modelMember.downlineSpv(rs_member_id, listDownline, function(err, data){
          findDownline = data;
          setTimeout(resolve, 1000);
        });
      }else{
        resolve();
      }
    });
    common.log("find downline 2 "+findDownline);
    if(!findDownline){
      if(config.owner_free.member_id == member_id){
        common.log(" owner free topup for member "+member_id);
        callback('',rs_number);
        return;
      }else{
        callback('failed', 'rs number tidak sesuai dengan data downline anda');
        return;
      }
    }else{
      callback('',rs_number);
      return;
    }
  }else{
    callback('',rs_number);
    return;
  }
}

exports.handler = handler;
