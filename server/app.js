const express = require('express');
const fs = require('fs');
const app = express();
var logObject = {};
var logArray = [];
app.use((req, res, next) => {
// write your logging code here
    var timestamp = new Date();
    

    var agent = req.headers['user-agent'];
    //console.log(req.headers);
    agent = agent.replace(',','');
    //console.log('Requested '+ agent, timestamp.toISOString());
    var time = timestamp.toISOString();
    var method = req.method;
    //console.log('Requested '+ method, timestamp.toISOString());
    var resource = req.originalUrl;
    //console.log('Requested '+ resource, timestamp.toISOString());
    var version = 'HTTP/' + req.httpVersion;
    //console.log('Requested '+ version, timestamp.toISOString());
    var status = res.statusCode;

     var logData =  '\n' + agent + ',' 
                    + time + ',' 
                    + method + ',' 
                    + resource + ','
                    + version + ','
                    + status;
    logArray.push(logData);
    console.log(logData);

fs.appendFile('log.csv', logArray, (error) => {
        if (error) throw error;
    });
    next();
});

app.get('/', (req, res) => {
// write your code to respond "ok" here
    res.send('Ok');
});

app.get('/logs', (req, res) => {
// write your code to return a json object containing the log data here
    fs.readFile('log.csv', 'utf8', (error, data) => {
        if (error) throw error;
        logObject = csvToJson(data);
        let jsonObject = JSON.parse(logObject);
        res.send(jsonObject);
        console.log(data);
    });
    
});
function csvToArr(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp((
          "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" 
        + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" 
        + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
    var arrData = [[]];
    var arrMatches = null;
    while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[1];
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            arrData.push([]);
        }
        if (arrMatches[2]) {
            var strMatchedValue = arrMatches[2].replace( new RegExp("\"\"", "g"), "\"");
        } else {
            var strMatchedValue = arrMatches[3];
        }
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    return (arrData);
}
function csvToJson(csv) {
    var array = csvToArr(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            objArray[i - 1][key] = array[i][k]
        }
    }
    var json = JSON.stringify(objArray);
    var str = json.replace(/},/g, "},\r\n");

    return str;
}
module.exports = app;