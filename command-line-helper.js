
const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');

const optionDefinitions = [
  { name: 'input', alias: 'i', type: String},
  { name: 'product', alias: 'p', type: String },
  { name: 'duplicates', alias:'d' , type: Boolean },
  { name: 'maintenance', alias:'m', type: Boolean },
  { name: 'device', alias:'l',type: Boolean },
  { name: 'help', alias: 'h' ,type: Boolean }
];

const sections = [
  {
    header: 'F-secure json log processor',
    content: 'Processes JSON log file and answars questions [italic]{1,2,6,7}.'
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'input',
        typeLabel: '[underline]{file}',
        alias: 'i',
        description: 'The input file to process.'
      },
      {
        name: 'product',
        typeLabel: '[underline]{product-name}',
        alias: 'p', 
        description: 'Calculates the total and first-time launches of this \
          product.'
      },
      {
        name: 'duplicates',
        alias: 'd', 
        description: 'Calculate number of duplicate events.'
      },
      {
        name: 'maintenance',
        alias: 'm' ,
        description: 'Calculates the best time for maintenance.'
      },
      {
        name: 'device', 
        alias: 'l',
        description: 'Calculates the device id with the longest active time.'
      },
      {
        name: 'help',
        alias: 'h', 
        description: 'Print this usage guide.'
      }
    ]
  }
];

var Helper = {
  printHelp:function(){
    console.log(getUsage(sections));
  },
  options:commandLineArgs(optionDefinitions)
}

module.exports = Helper;

