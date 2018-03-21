var express = require('express');
var session = require('express-session');
var http = require('http');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var port  = 8080;//<----- Control the port no from here
var server = require('http').Server(app);// needed to deploy on server
var fetchAction =  require('node-fetch');
var fs = require('fs');
var timestamp = require('time-stamp');
var request = require('request');
var cors = require('cors');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient,assert = require('assert');

// setting up express server 
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// routes of the server

app.get('/',(req,res,next) => {

res.json({"message":"Welcome to the Speed limit detection System :\nServer is up and running sucessfully"});

console.log("Request made to the server landing page");
});

app.post('/Speed_stream',(req,res,next) => {

// ---------------------------------------------------------------------------------------------------
const request_option_overspeed = {
	uri: "https://roads.googleapis.com/v1/speedLimits?path="+JSON.stringify(req.body.Location)+"&key=AIzaSyDSehieJnAXKODJZCcibjeJNSUVeHdOSWw",
	method: "GET",
	headers: {
		"Content-Type": "application/json"
	},
}

request(request_option_overspeed,(err,response,result11)=>{
//if(!err && res.statusCode==200){<-------------------add this once api active
	if(!err && response.statusCode==403){
	var result = JSON.parse(result11)
   console.log(result11);

   
 

// -----------------------------------------------------------------------------------------------------

//if((result.speedLimits[0].speedLimit - req.body.Speed) < 0)<--------correct this once api ready
if((200 - req.body.Speed) < 0)
{

// Connceting to google location api

const request_option_location= {
	//uri: "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + JSON.stringify(result.speedLimits[0].placeId) + "&key=AIzaSyDSehieJnAXKODJZCcibjeJNSUVeHdOSWw",
	uri: "https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJJ4vQRudkJA0RpednU70A-5M&key=AIzaSyDSehieJnAXKODJZCcibjeJNSUVeHdOSWw",
	method: "GET",
	headers: {
		"Content-Type": "application/json"
	},
}

request(request_option_location,(err2,response2,result2)=>{
//if(!err && res.statusCode==200){ // <-----------------add this once api works
	if(!err && response2.statusCode==200){
	var result1 = JSON.parse(result2)
   console.log(result1);

// connecting to mongodb
// ---------------------------------------------------------------------------------
MongoClient.connect('mongodb://ankit:1234567890@ds219879.mlab.com:19879/speed_analysis', (err3,db)=> {

    assert.equal(null,err);
    console.log("Sucessfully connected to the mongodb client");
    // sending the information
  db.collection(req.body.Car_Number).insertOne({
  "Car_Number": req.body.Car_Number,	
  "Location":  JSON.stringify(result1.result.formatted_address),
  "Speed": req.body.Speed,
  "Time-Stamp_key": timestamp('YYYY/MM/DD'),
  "Time-Stamp": timestamp('YYYY/MM/DD:mm:ss'),
  //"Overspeed_Limit": result.speedLimits[0].speedLimit + " " + result.speedLimits[0].units, //activate once api active
  "Overspeed_Limit":  200 + " " + "KMPH",
  //"Speed_above_overspeed_limit": (req.body.Speed - result.speedLimits[0].speedLimit) // activate once api active
  "Speed_above_overspeed_limit": (req.body.Speed - 200)
})
.then(function(result) {
  // process result
  res.json({"code": 200 ,"message": "Data uploaded successfully on Car overspeeding "});
})
  if(err3){
	res.json({"code": 500 , "message": "Data upload unsuccessfull"})
    }
});
//google api location else ending here 
//------------------------------------------------------------------------
} 
else 
{
	console.log("Overspeed_data=" + res.statusCode);
} 
});

//-----------------------------------------------------------------------
}
else
{
	res.json({"code": 200 ,"message": "Car Not overspedding right now"});
}

// else ending for the google speed api request
//-------------------------------------------------------------- 
} 
else 
{
	console.log("Overspeed_data=" + res.statusCode);
} 

// ------------------------------------------------------------------ 
});
});
// ----------------------------------------------------------------------------
app.get('/speed_violation_details/:Car_Number', (req,res,next)=>{

MongoClient.connect('mongodb://ankit:1234567890@ds219879.mlab.com:19879/speed_analysis', (err,db)=> {

    assert.equal(null,err);
    console.log("Sucessfully connected to the mongodb client");
    // sending the information
 db.collection(req.params.Car_Number).find({}).toArray((err,result)=>{

if(result == null)
  {
    res.json({"code": 404,"message":"This Car does not exist"})
  }
  res.json({"code": 200,result});
});

    
});

});



// Server Started
//app.listen(port);
app.listen(process.env.port || 8080);
console.log('Test Server Started ! on port ' + port);


