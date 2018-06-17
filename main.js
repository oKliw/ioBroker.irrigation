/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

// you have to require the utils module and call adapter function
const utils = require(__dirname + '/lib/utils'); // Get common adapter utils
const ZoneController = require(__dirname + '/lib/controller/zoneController.js');
const IrrigationController = require(__dirname + '/lib/controller/irrigationController.js');
const Zone = require(__dirname + '/lib/states/zone.js');
const Timeframe = require(__dirname + '/lib/states/timeframe.js');
let controllers = [];

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.irrigation.0
let adapter = new utils.Adapter('irrigation');
let timer = null;

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        if(timer !== null) {
            clearInterval(timer);
        }

        controllers.forEach(function (controller) {
            controller.stop();
        });

        callback();
    } catch (e) {
        callback();
    }
});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
// adapter.on('stateChange', function (id, state) {
//     // Warning, state can be null if it was deleted
//     adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));
//
//     // you can use the ack flag to detect if it is status (true) or command (false)
//     if (state && !state.ack) {
//         adapter.log.info('ack is not set!');
//     }
// });

// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj === 'object' && obj.message) {
        if (obj.command === 'send') {
            // e.g. send email or pushover or whatever
            console.log('send command');

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    main();
});

function main() {
    adapter.log.info('Start irrigation adapter');
    controllers = [];
    let semaphore = require('semaphore')(1);

    adapter.setObject('zone', {
        common: {
            name: 'zone',
            role: 'device'
        },
        native: {},
        type: 'device'
    });

    adapter.setObject('timeframe', {
        common: {
            name: 'timeframe',
            role: 'device'
        },
        native: {},
        type: 'device'
    });

    //adapter.log.info('timeframes: ' + adapter.config.timeframes);

    let timeframes = [];
    let configured = [];

    for(let i = 0; i < adapter.config.timeframes; i++) {
        let timeframe = new Timeframe(adapter, 'timeframe.' + i);
        configured.push(timeframe);
    }

    adapter.getChannels('timeframe', function (err, channels) {
        for(let i = 0; i < channels.length; i++) {
            if(i >= adapter.config.timeframes) {
                let timeframe = new Timeframe(adapter, channels[i]._id);
                timeframe.delete();
            } else {
                timeframes.push(configured.shift());
            }
        }

        configured.forEach(function(current) {
            current.create();
            timeframes.push(current);
        });

        adapter.log.info(adapter.namespace + ' has ' + timeframes.length + ' configured timeframes');

        configured = [];

        for(let i = 0; i < adapter.config.zones; i++) {
            let zone = new Zone(adapter, 'zone.' + i);
            configured.push(zone);
        }

        adapter.getChannels('zone', function(err, channels) {
            //adapter.log.info(err);
            for(let i = 0; i < channels.length; i++) {
                if(i >= adapter.config.zones) {
                    let zone = new Zone(adapter, channels[i]._id);
                    zone.delete();
                } else {
                    controllers.push(new ZoneController(adapter, configured.shift(), semaphore));
                }
            }

            configured.forEach(function(current) {
                current.create();
                controllers.push(new ZoneController(adapter, current, semaphore));
            });

            configured = [];

            controllers.forEach(function (controller) {
                configured.push(controller.zone);
            });

            let irrigationController = new IrrigationController(adapter, timeframes, controllers);
            irrigationController.start();
            adapter.log.info(adapter.namespace + ' has ' + irrigationController.zones.length + ' configured zones');
        });
    });
}
