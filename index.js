const Promise = require('bluebird');
const _ = require('lodash');
const request = require('request');
const fs = require('fs');
const jstringify = require('json-stringify');
const jsonPath = require('jsonpath');
const exec  = require('child_process').exec;
const writeFile = Promise.promisify(fs.writeFile);

const apiOne = '',
  apiTwo = '',
  parameter = 'products/histogram?filters=Category&regions=ca';



function getJsonFile(url, filename) {
  return new Promise(function (resolve, reject) {
    request.get(url, {json: true} ,function (err, result, body) {
      if(err){
        return reject(err);
      }
      return resolve(body);
    })
  })
}


Promise.join(getJsonFile(apiOne + parameter, 'production.json'), getJsonFile(apiTwo + parameter, 'test.json')).then(function (results) {
  const [productJson, testJson] = results;
  const countPattern = '$.categoryHistogram[*].count';
  const fullPricePattern = '$.categoryHistogram[*].price..fullPrice';
  return {productJson, testJson, result: _.isEqual(jsonPath.query(productJson, countPattern), jsonPath.query(testJson, countPattern))
  && _.isEqual(jsonPath.query(productJson, fullPricePattern), jsonPath.query(testJson, fullPricePattern))};
}).then(({productJson, testJson, result})=>{
  if(!result){
    console.log(`the results of ${parameter} are identical`);
    process.exit(0);
  }
 return  Promise.join(writeFile('production.json',  jstringify(productJson, null, 2, {offset: 4})),
   writeFile('test.json', jstringify(testJson, null, 2, {offset: 4})));
}).then(function () {
  exec('kankan diff production.json test.json');

});