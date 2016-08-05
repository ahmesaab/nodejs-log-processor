#!/usr/bin/env node

// This script answars the following questions:
// Q1: How many times has a particular product has been launched during this time period?
//     How many first-time launches can you detect for this product?
// Q2: Can you detect duplicate events? How?
// Q6: If you should prepare a maintenance time for the processor, when would you do it 
//     in order to cause minimal impact to products?
// Q7: Which device has longest ‘activity time’ max('first event – latest event')

// Note: Q3,4,5 is answared in the README.md file.

var worker = require('./worker.js');

var logFilePath = process.argv[2];
var product = process.argv[3];

if(logFilePath && logFilePath!='-h')
{
	if(product)
	{
		worker.countLanches(logFilePath,product,function(launches){
			console.log("Total Launches: "+ launches);
		});

		worker.countFirstLaunches(logFilePath,product,function(firstTimeLaunches){
			console.log("First Time Launches: "+ firstTimeLaunches);
		});
	}

	worker.getBestMaintenanceTime(logFilePath,function(date){
		console.log("Best time to do maintenance is on a "+date.day+" at "+
			date.hour+":00 with average load of "+ parseInt(date.mini/3)+" events");
	});

	worker.findLongestActivityDevice(logFilePath,function(data){
		console.log("Longest Activity Device: "+data.device+
			" with active time of "+data.time+" milliseconds");
	});
}
else
	console.log("usage: ./main.js 'path_to_log_file' ['product_name']");






