"use strict";

const jwt = require('jsonwebtoken');

const config = require("../config.json");
const common = require("../common");

const request = require('request');

exports.index = function (req, res, next) {
  // body...
  let url = config.center.url_host+"/center"+"/messaging/"+config.center.api_key;
  let dataTopup = req.params.dataTopup;
  common.log(dataTopup);
  let bearer; let token;
  const authorization = req.header('Authorization');
  if(authorization){
    [bearer, token] = authorization.split(' ');
    try{
      const data = jwt.verify(token, config.app.secretKey);
      if(data){
        let response = {
          status:200, message: "data sedang diproses", data: {}
        };
        let msg = 'M.'+dataTopup+"."+data.pin;
        common.log("msg "+msg);
        let ts = common.now();
        request(url+"?msisdn="+data.hp_number+"&msg="+msg+"&ts="+ts+"&smsc=sds-mobile", function(error, response, body){
          common.log("response: "+response && response.statusCode);
          if(error){
            common.log("response "+error.message)
            response.status = 403;
            response.message = "data tidak diproses";
            res.status(403).json(response);
            return;
          }else{
            common.log("body "+body);
            let respBody = JSON.parse(body);
            if(respBody.status == 'failed'){
              response.status = 403;
              response.message = "data tidak diproses";
              res.status(403).json(response);
              return;
            }else{
              common.log("message "+respBody.message);
              res.status(200).json(response);
              return;
            }
          }
        });
      }else{
        res.status(401).json({status: 304, message: "not found", data: {}});
        return;
      }
    }catch(error){
      common.log("RS Chip "+error.message);
      res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
      return;
    }
  }else{
    res.status(401).json({status: 401, message: "Invalid/Expired Token.", data: {}});
    return;
  }
};
