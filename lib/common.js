'use strict';

const date = require('date-and-time');
let currentNow; let currentDate; let currentDateId;
let log = function(dataLog, dataLog2){
  let now = new Date();
  console.log('[',date.format(now, 'YYYY-MM-DD HH:mm:ss'),']', '[Info]', dataLog, dataLog2 ? dataLog2: '');

  currentNow = date.format(now, 'YYYY-MM-DD HH:mm:ss');
  currentDate = date.format(now, 'YYYY-MM-DD');
  currentDateId = date.format(now, 'DD-MM-YYYY');
}

exports.now = function () {
  // body...
  let now = new Date();
  return date.format(now, 'YYYY-MM-DD HH:mm:ss');
};

exports.log = log;
exports.date = currentDate;
