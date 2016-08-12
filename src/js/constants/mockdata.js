'use strict';
module.exports = {
  VALID_JSON: '[{"a":"1"},{"a":"2"},{"a":"3"}]',
  VALID_CSV: 'iata,name,city,state,country,latitude,longitude\n00M,Thigpen,Bay Springs,MS,USA,31.95376472,-89.23450472',
  VALID_TSV: 'x	y\n5	90\n25	30',
  INVALID_JSON: '[{a:1}, {"a":1]',
  INVALID_CSV: 'iata,name,city,state,country,latitude,longitude\nBay Springs,USA,31.95376472,-89.23450472',
  INVALID_TSV: 'x	y\n5	90\n25'
};
