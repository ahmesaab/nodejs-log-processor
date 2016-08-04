Q3: Do you observe anything weird in timestamps?

Yes, starting from line 184723 till the end of the file, the timestamp is ubsent in the json. 
This is probably due to an update that was deployed at timestamp 1443008188103 which is the 
last timestamp present.

Q4: What kind of statistics do you think are interesting? How could you visualize this?

The location feilds (country & geo) is very intresting because we can use that to detect
products usage around the world. The event_id is important to identify duplicate events.
I also find the view type intresting because we can use this data to deduce the most 
viewed pages in a product to know what views makes the most influence on the users. 
Also the device feild can be used to detect what kind of device market is the company 
most influential in and what market should we focus on. You can run the proccessor with
the -l flag to get statistics about the most influential locations.


Q5: How would you store the data so that further processing and/or analysis would be easy?

I think json is one of the best formats for log files so i will stick with the json format.
I would filter out the fields that are not necessary and the feilds that are always null.
How I would do that is by jq and > only. This operation is a oneliner but we can let the 
proccessor do that also.

$ jq '{type,event_id,source,time,device,location:{country:.sender_info.geo.country,l
l:.sender_info.geo.ll}}|tostring' obfuscated_data --raw-output > newlog

