var readline = require('readline');
var spawn = require('child_process').spawn;

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


var Worker = {

    // Spawn a jq proccess that will filter the stream by product name and type
    // and pipe the output stream to an awk filter to get the first occurence
    // of every device launch for this particular product. Count the lines.
    countFirstLaunches:function(filePath,product,callback)
    {
        console.log("calculating first time launches of product...");
        console.time("EXEC TIME (first time launches)");

        var launches = 0;
        var jq = spawn('jq',['{type,source,device_id: .device.device_id}| \
            select(.type == "launch")|select(.source=="'+product+'")|tostring',
            filePath,'--raw-output']);
        var awk = spawn("awk",["!x[$0]++"]);
        var stream = readline.createInterface({input : awk.stdout});

        jq.stdout.pipe(awk.stdin);
        
        stream.on('line', function(line) {
            launches++;
        });
        
        stream.on('close',function() {
            console.timeEnd("EXEC TIME (first time launches)")
            callback(launches);    
        });

    },

    // Spawn a jq proccess that will filter the file by product name and type 
    // and pipe the output stream to an awk filter to get the first occurence 
    // of every event_id thus filtering out duplicate events. Count the lines.
    //
    // NOTE: I have asumed that duplicates should not be included while 
    // counting the launches. If this is not an issue skip the awk filter.
    countLanches:function(filePath,product,callback)
    {
        var launches = 0;
        console.log("calculating total launches of product...");
        console.time("EXEC TIME (total launches)");

        var jq = spawn('jq',['{event_id,type,source}| \
            select(.type == "launch")|select(.source=="'+product+'")|tostring',
            filePath,'--raw-output']);

        var awk = spawn("awk",["!x[$0]++"]);
        jq.stdout.pipe(awk.stdin);

        var stream = readline.createInterface({input : awk.stdout});

        stream.on('line', function(line) {
            launches++;
        });

        stream.on('close',function() {
            console.timeEnd("EXEC TIME (total launches)")
            callback(launches);    
        });
    },

    // Spawn a jq proccess that will stream the event ids only and apply
    // awk filter that counts the will outputs only the repeated ids.
    countDuplicates:function(filePath,callback)
    {
        var duplicates = 0;
        console.log("calculating total duplicates...");
        console.time("EXEC TIME (total duplicates)");

        var jq = spawn('jq',['{event_id}|tostring',filePath,'--raw-output']);

        var awk = spawn("awk",["x[$0]++>=1"]);
        jq.stdout.pipe(awk.stdin);

        var stream = readline.createInterface({input : awk.stdout});

        stream.on('line', function(line) {
            duplicates++;
        });

        stream.on('close',function() {
            console.timeEnd("EXEC TIME (total duplicates)")
            callback(duplicates);    
        });
    },

    // Spawn jq proccess that will parse only the time feild. For every 
    // timestamp, transform it to a local day of week and hour recording the 
    // occurence of an event in that hour in that day of the week. Returns the
    // least hour/day with events count in a 3 days window.
    getBestMaintenanceTime:function(filePath,callback)
    {
        console.log("finding best time for maintenance...");            
        console.time("EXEC TIME (time)");

        var data = [];
        for(var i=0;i<7;i++){
            data[i] = new Array(24)
            for(var j= 0;j<24;j++)
                data[i][j]=0;
        }

        var jq = spawn('jq',['{time}|tostring',filePath,'--raw-output']);
        
        var stream = readline.createInterface({ input: jq.stdout });

        stream.on('line', function(line) {
            var time = new Date(JSON.parse(line).time.create_timestamp);
            data[time.getDay()][time.getHours()]++;
        });

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

    // Stream the file from begining to the end saving the timestamp of the 
    // first occurence of every device. Also, stream the file from end to 
    // begining saving the timestamp of the first occurence (which is the 
    // last event) of every device. Subtract the start time and end time 
    // of every device and return the device id with tha biggest diffrence 
    // which is the longest active time of all devices.
    findLongestActivityDevice:function(filePath,callback)
    {
        var devices = [];
        var done = false;
        var jqQuery = '{device_id:.device.device_id,time:\
            .time.create_timestamp}|tostring';
        var awkQuery = '!x[substr($0,14,44)]++';

        var cat = spawn('cat',[filePath])
        var tac = spawn('tac',[filePath])
        
        console.log("finding longest activity device...");
        console.time("EXEC TIME (longest activity device)");

        process(cat,devices,'startTime');
        process(tac,devices,'endTime');

        function process(proc,devices,att) {
            var jq = spawn('jq',[jqQuery,'--raw-output']);
            var awk = spawn("awk",[awkQuery]);
    
            proc.stdout.pipe(jq.stdin);        
            jq.stdout.pipe(awk.stdin);

            var stream = readline.createInterface({ input : awk.stdout });
            stream.on('line', function(line) {
                var json = JSON.parse(line);
                if(json.device_id in devices)
                    devices[json.device_id][att] = parseInt(json.time);
                else
                    devices[json.device_id] = {[att]:parseInt(json.time)}
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
            for(var i in devices){
                if(devices[i].endTime - devices[i].startTime > max) {
                    device = i;
                    max = devices[i].endTime - devices[i].startTime;                
                }
            }
            console.timeEnd("EXEC TIME (longest activity device)")
            return {device:device,time:max};
        }
    }
}

module.exports = Worker;
