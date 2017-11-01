const Promise = require('bluebird');
const _ = require('lodash');
const request = require('request');
const fs = require('fs');
const jstringify = require('json-stringify');
const exec  = require('child_process').exec;

const apiOne = '',
  apiTwo = '',
  parameter = 'products/histogram?filters=Category&regions=ca';



function getJsonFile(url, filename) {
  return new Promise(function (resolve, reject) {
    request.get(url, {json: true} ,function (err, result, body) {
      if(err){
        return reject(err);
      }
      fs.writeFile(filename, jstringify(body, null, 2, {offset: 4}), function (error) {
        if(error){
          return reject(error);
        }
        return resolve(filename);
      })
    })
  })
}


Promise.join(getJsonFile(apiOne + parameter, 'production.json'), getJsonFile(apiTwo + parameter, 'test.json')).then(function () {
  exec('kankan diff production.json test.json');
})