#!/usr/bin/env node

// This script answars the following questions:
// Q1: How many times has a particular product has been launched during this time period?
//     How many first-time launches can you detect for this product?
// Q2: Can you detect duplicate events? How?
// Q6: If you should prepare a maintenance time for the processor, when would you do it 
//     in order to cause minimal impact to products?
// Q7: Which device has longest ‘activity time’ max('first event – latest event')

// Q3,4,5 is answared in the README file.

var worker = require('./worker.js');
var product = process.argv[2];

worker.countLanches(product,function(launches){
	console.log("Total Launches: "+ launches);
});

worker.countFirstLaunches(product,function(firstTimeLaunches){
	console.log("First Time Launches: "+ firstTimeLaunches);
});

worker.getBestMaintenanceTime(function(date){
	console.log("Best time to do maintenance is on a "+date.day+" at "+
		date.hour+":00 with total load of "+ date.mini+" events");
});

worker.findLongestActivityDevice(function(data){
	console.log("Longest Activity Device: "+data.device+
		" with active time of "+data.time+" milliseconds");
});






