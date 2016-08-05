var readline = require('readline');
var spawn = require('child_process').spawn;

var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


var Worker = {

	countFirstLaunches:function(filePath,product,callback)
	{
		// Spawn jq proccess that will filter the file by product name and type
		var jq = spawn('jq',['{type,source,device_id: .device.device_id}| \
			select(.type == "launch")|select(.source=="'+product+'")|tostring',
			filePath,'--raw-output']);

		var launches = 0;
		console.log("calculating first time launches...");

		// Pipe jq's output to awk filter to get unique events
		var awk = spawn("awk",["!x[$0]++"]);
		jq.stdout.pipe(awk.stdin);
		
		// Start the execution time for performance evaluation
		console.time("EXEC TIME (first time launches)");

		// Read the awk's output stream line by line
		var stream = readline.createInterface({
			input     : awk.stdout,	
			terminal  : false
		});

		// Count the launches of the products
		stream.on('line', function(line) {
			launches++;
		});

		// Call the callback function when stream ends.
		stream.on('close',function() {
			console.timeEnd("EXEC TIME (first time launches)")
			callback(launches);	
		});
	},
	countLanches:function(filePath,product,callback)
	{

		// Spawn jq proccess that will filter the file by product name and type
		var jq = spawn('jq',['{event_id,type,source}| \
			select(.type == "launch")|select(.source=="'+product+'")|tostring',
			filePath,'--raw-output']);

		// Note: We will pipeline the jq process with awk '!s[$0]++' which
		// will remove duplicate events (Q3. I have asumed that duplicates should 
		// not be included in the calculation. If a measure of the duplicate
		// rate frequency is required in this assignment check the duplicate.js
		// file.

		var launches = 0;
		console.log("calculating total launches...");

		// Pipe jq's output to awk filter to filter out duplicate events
		var awk = spawn("awk",["!x[$0]++"]);
		jq.stdout.pipe(awk.stdin);
		
		
		// Start the execution time for performance evaluation
		console.time("EXEC TIME (total launches)");

		// Read the jq's output stream line by line
		var stream = readline.createInterface({
			input     : awk.stdout,	
			terminal  : false
		});

		// Count the launches of the products
		stream.on('line', function(line) {
			launches++;
		});

		// Call the callback function when stream ends.
		stream.on('close',function() {
			console.timeEnd("EXEC TIME (total launches)")
			callback(launches);	
		});
	},
	getBestMaintenanceTime:function(filePath,callback)
	{

		// Spawn jq proccess that will be used in calculating best maintenance time
		var jq = spawn('jq',['{time}|tostring',filePath,'--raw-output']);

		// data is a 2D array that will contain the counts
		// of events for every day of the week for every hour
		// of the day. We will return the lowest hour in 
		// a 3 day window from that 2D array. This is ofcource 
		// not the best way calculate the maintenance day 
		// for international statistic but it is a rough 
		// estimation.
 
		data = [];
		for(var i=0;i<7;i++){
			data[i] = new Array(24)
			for(var j= 0;j<24;j++)
				data[i][j]=0;
		}

		console.log("finding best time for maintenance...");			

		// Start the execution time for performance evaluation
		console.time("EXEC TIME (time)");

		// Read the jq's output stream line by line
		var stream = readline.createInterface({
			input     : jq.stdout,	
			terminal  : false
		});

		// Record an occurence of an event in that day of week and hour of day
		stream.on('line', function(line) {
			var time = new Date(JSON.parse(line).time.create_timestamp);
			data[time.getDay()][time.getHours()]++;
		});

		// Call the callback function when stream ends.
		stream.on('close',function() {
			console.timeEnd("EXEC TIME (time)")
			var hr = 0;
			var day = null;
			var mini = Infinity;
			for(i in data){
				for(j in data[i]){
					if(data[i][j]+data[i][j+1]+data[i][j-1] < mini){
						hr = j;
						day = i;
						mini = (data[i][j]+data[i][j+1]+data[i][j-1]);
					}
				}
			}
			callback({day:days[day],hour:hr,mini:mini});	
		});
		
	},
	findLongestActivityDevice:function(filePath,callback)
	{
		// stream the file from begining to end saving the first
		// occurence of every device in an array. stream the file
		// from end to begining saving the first occurence of every
		// device. Subtract the start time and end time of every 
		// device and return the device id with tha biggest diffrence
		// which is the longest active time.

		var devices = [];
		var startTimes = [];
		var endTimes = [];

		var done = false;
		var jqQuery = '{device_id: .device.device_id,time:.time.create_timestamp}|tostring' ;
		var awkQuery = '!x[substr($0,14,44)]++';
		
		console.log("finding longest activity device...");
		console.time("EXEC TIME (longest activity device)");
		
		var cat = spawn('cat',[filePath])
		var tac = spawn('tac',[filePath])
		
		process(cat,startTimes,devices);
		process(tac,endTimes);

		function process(proc,times,devices) {
			var jq = spawn('jq',[jqQuery,'--raw-output']);
			var awk = spawn("awk",[awkQuery]);
	
			proc.stdout.pipe(jq.stdin);		
			jq.stdout.pipe(awk.stdin);

			var stream = readline.createInterface({
				input     : awk.stdout,	
				terminal  : false
			});
			stream.on('line', function(line) {
				var json = JSON.parse(line);
				if(devices)
					devices.push(json.device_id);
				times.push(parseInt(json.time));
			});
			stream.on('close',function() {
				if(done==true)
					callback(calculate());
				else
					done = true;
			});
		}

		function calculate(){
			var max = 0;
			var device;
			for(i in devices){
				if((startTimes[i]-endTimes[devices.length-i-1])>max){
					device = devices[i]
					max = startTimes[i] - endTimes[devices.length-i-1];				
				}
			}
			console.timeEnd("EXEC TIME (longest activity device)")
			return {device:device,time:max};
		}
	}
}

module.exports = Worker;
