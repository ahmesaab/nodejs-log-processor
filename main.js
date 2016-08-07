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
var commandLineHelper = require('./command-line-helper.js');

var options = commandLineHelper.options;

if(options.help || typeof options.input == 'undefined')
    commandLineHelper.printHelp();
else
{
    if(options.product)
    {
        worker.countLanches(options.input,options.product,function(launches){
                console.log(">> Total Launches: " + launches);
        });

        worker.countFirstLaunches(options.input,options.product,
            function(firstTimeLaunches){
                console.log(">> First Time Launches: " + firstTimeLaunches);
            }
        );
    }

    if(options.duplicates)
    {
        worker.countDuplicates(options.input,function(duplicates){
                console.log(">> Total Duplicate Events: " + duplicates);
            }
        );
    }

    if(options.maintenance)
        worker.getBestMaintenanceTime(options.input,function(date){
            console.log(">> Best time for maintenance is on a " + date.day +
                " at "+date.hour+":00 with average load of " +
                parseInt(date.mini/3) +" events");
        });
    
    if(options.device)
        worker.findLongestActivityDevice(options.input,function(data){
            console.log(">> Longest Activity Device: " + data.device +
                " with active time of " + data.time + " milliseconds");
        });
}









