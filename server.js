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

app.get('/',(req,res,next) =>{

res.json({"message":"Welcome to the Speed limit detection System :\nServer is up and running sucessfully"})

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

Request(request_option_overspeed,(err,res,result1)=>{
if(!err && res.statusCode==200){
	var result = JSON.parse(result1)
   console.log(result);

   
 

// -----------------------------------------------------------------------------------------------------

if((result.speedLimits[0].speedLimit - req.body.Speed) < 0)
{

// Connceting to google location api

const request_option_location= {
	uri: "https://maps.googleapis.com/maps/api/place/details/json?placeid="ChIJN1t_tDeuEmsRUsoyG83frY4"&key=AIzaSyDSehieJnAXKODJZCcibjeJNSUVeHdOSWw",
	method: "GET",
	headers: {
		"Content-Type": "application/json"
	},
}

Request(request_option_location,(err,res,result)=>{
if(!err && res.statusCode==200){
	var result = JSON.parse(result)
   console.log(result);

// connecting to mongodb
// ---------------------------------------------------------------------------------
MongoClient.connect('mongodb://<dbuser>:<dbpassword>@ds219879.mlab.com:19879/speed_analysis', (err,db)=> {

    assert.equal(null,err);
    console.log("Sucessfully connected to the mongodb client");
    // sending the information
  db.collection(req.body.Car_Number).insertOne({
  "Car_Number": req.body.Car_Number,	
  "Location":  req.body.Location,
  "Speed": req.body.Speed,
  "Time-Stamp_key": timestamp('YYYY/MM/DD'),
  "Time-Stamp": timestamp('YYYY/MM/DD:mm:ss'),
  "Overspeed_Limit": result.speedLimits[0].speedLimit + " " + result.speedLimits[0].units,
  "Speed_above_overspeed_limit": (req.body.Speed - result.speedLimits[0].speedLimit)
})
.then(function(result) {
  // process result
  res.json({"code": 200 ,"message": "Data uploaded successfully on Car overspeeding "});
})
.catch()
{
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

// Server Started
app.listen(port);
console.log('Test Server Started ! on port ' + port);


