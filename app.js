var mongo = process.env.VCAP_SERVICES;
var port = process.env.PORT || 3030;
var conn_str = "";
console.log('#001#'); 
if (mongo) {
	console.log('#002#'); 
  var env = JSON.parse(mongo);
  if (env['mongodb-2.4']) {
	  console.log('#003#'); 
    mongo = env['mongodb-2.4'][0]['credentials'];
    if (mongo.url) {
    	console.log('#004#'); 
      conn_str = mongo.url;
    } else {
    	console.log('#005#'); 
      console.log("No mongo found");
    }  
  } else {
	  console.log('#006#'); 
    conn_str = 'mongodb://localhost:27017';
  }
} else {
	console.log('#007#'); 
//  conn_str = 'mongodb://localhost:27017';
  conn_str = 'mongodb://192.168.162.173:27017';
}
console.log('#008#'); 

var MongoClient = require('mongodb').MongoClient;
var db; 
console.log('#009#'); 
MongoClient.connect(conn_str, function(err, database) {
  if(err) throw err;
  console.log('#010#'); 
  db = database;
}); 
console.log('#011#'); 

var express = require('express');
var app = express();

console.log('#012#'); 
app.get('/', function (req, res) {
  res.write('Two APIs are provided: "/api/insertMessage" and "/api/render"' + "\n"
    + 'When "/api/insertMessage" is called, messages will be written to database' + "\n"
    + 'When "/api/render" is called, the inserted message will be shown');
  res.end();	
});
console.log('#013#'); 

app.get('/api/insertMessage', function (req, res) {
  var message = { 'message': 'Hello, Bluemix', 'ts': new Date() };
  if (db && db !== "null" && db !== "undefined") {
    db.collection('messages').insert(message, {safe:true}, function(err){
      if (err) { 
        console.log(err.stack);
        res.write('mongodb message insert failed');
        res.end(); 
      } else {
        res.write('following messages has been inserted into database' + "\n" 
        + JSON.stringify(message));
        res.end();
      }
    });    
  } else {
    res.write('No mongo found');
    res.end();
  } 
});
console.log('#014#'); 

app.get('/api/render', function (req, res) {
  if (db && db !== "null" && db !== "undefined") {
    // list messages
    db.collection('messages').find({}, {limit:10, sort:[['_id', 'desc']]}, function(err, cursor) {
      if (err) {
        console.log(err.stack); 
        res.write('mongodb message list failed');
        res.end();
      } else {
        cursor.toArray(function(err, items) {
          if (err) {
            console.log(err.stack); 
            res.write('mongodb cursor to array failed');
            res.end();
          } else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            for (i=0; i < items.length; i++) {
              res.write(JSON.stringify(items[i]) + "\n");
            }
            res.end();
          }
        });
      }
    });     
  } else {
    res.write('No mongo found');
    res.end();  
  }
});
app.listen(port);
console.log('#099#'); 

