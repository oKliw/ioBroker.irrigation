'use strict';

const ZoneSettings = require('./zoneSettings.js');
const ZoneSensor = require('./zoneSensor');
const State = require('./state.js');

/**
 *
 * @param {Adapter} adapter
 * @param {string} zoneID
 * @constructor
 */
function Zone(adapter, zoneID) {
    this.adapter = adapter;
    this.id = zoneID;
    this.settings = new ZoneSettings(adapter, this.id + '.settings');
    this.sensor = new ZoneSensor(adapter, this.id + '.sensor');
    this.humidity = new State(adapter, this.id + '.humidity', true);
    this.present = new State(adapter, this.id + '.present', true);
    this.isScheduled = new State(adapter, this.id + '.isScheduled', true);
    this.minutes = new State(adapter, this.id + '.minutes', true);
    this.evaporation = new State(adapter, this.id + '.evaporation', true, adapter.log.debug);
    this.isRunning = new State(adapter, this.id + '.isRunning', true);

    // delete old previous states
    new State(adapter, this.id + '.evapotranspiration', true, adapter.log.warn).delete();
    new State(adapter, this.id + '.isSeedTime', true, adapter.log.warn).delete();
    new State(adapter, this.id + '.temperature', true, adapter.log.warn).delete();
}

Zone.prototype.create = function() {
    this.adapter.log.info('create zone ' + this.id);
    this.settings.create();
    this.sensor.create();

    this.adapter.setObject(this.id, {
        common: {
            name: this.id,
            role: 'channel'
        },
        native: {},
        type: 'channel'
    });

    this.humidity.create({
        common: {
            name: "humidity",
            desc: "",
            type: "number",
            unit: "%",
            role: "value",
            min: 0,
            def: 0,
            read: true,
            write: false
        },
        native: {},
        type: 'state'
    }, false,  this.humidity.value || 0);

    this.isScheduled.create({
        common: {
            name: "isScheduled",
            desc: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: false
        },
        native: {},
        type: 'state'
    }, true, false);

    this.minutes.create({
        common: {
            name: "minutes",
            desc: "",
            type: "number",
            unit: "min",
            role: "value",
            min: 0,
            def: 0,
            read: true,
            write: false
        },
        native: {},
        type: 'state'
    }, false, this.minutes.value || 0);

    this.evaporation.create({
        common: {
            read: true,
            write: false,
            desc: "",
            type: "number",
            min: 0,
            max: 1,
            def: 0,
            unit: "mm",
            name: "evapotranspiration",
            role: "value"
        },
        native: {},
        type: 'state'
    }, false, this.evaporation.value || 0);

    this.present.create({
        common: {
            read: true,
            write: true,
            desc: "",
            type: "number",
            min: 0,
            max: 15,
            def: 0,
            unit: "mm",
            name: "present",
            role: "value"
        },
        native: {},
        type: 'state'
    }, false, this.present.value || 15);

    this.isRunning.create({
        common: {
            name: "isRunning",
            desc: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: false
        },
        native: {},
        type: 'state'
    }, true, false);
};

Zone.prototype.delete = function() {
    this.adapter.log.info('delete zone ' + this.id);

    this.settings.delete();
    this.sensor.delete();
    this.humidity.delete();
    this.isScheduled.delete();
    this.minutes.delete();
    this.evaporation.delete();
    this.present.delete();
    this.isRunning.delete();

    this.adapter.delObject(this.id);
};

module.exports = Zone;