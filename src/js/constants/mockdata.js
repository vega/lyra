'use strict';
module.exports = {
  VALID_JSON: '[{"yield":27,"variety":"Manchuria","year":1931,"site":"University Farm"}]',
  VALID_CSV: 'iata,name,city,state,country,latitude,longitude\n00M,Thigpen,Bay Springs,MS,USA,31.95376472,-89.23450472',
  VALID_TSV: 'x	y\n5	90\n25	30',
  INVALID_JSON: '[{a:1}, {"a":1]',
  INVALID_CSV: 'iata,name,city,state,country,latitude,longitude\nBay Springs,USA,31.95376472,-89.23450472',
  INVALID_TSV: 'x	y\n5	90\n25'
};
