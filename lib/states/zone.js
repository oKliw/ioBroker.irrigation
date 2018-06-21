'use strict';

const Settings = require('./zoneSettings.js');
const State = require('./state.js');

function Zone(adapter, zoneID) {
    this.adapter = adapter;
    this.id = zoneID;
    this.settings = new Settings(adapter, this.id + '.settings');
    this.humidity = new State(adapter, this.id + '.humidity', true);
    this.present = new State(adapter, this.id + '.present', true);
    this.isScheduled = new State(adapter, this.id + '.isScheduled', true);
    this.minutes = new State(adapter, this.id + '.minutes', true);
    this.evapotranspiration = new State(adapter, this.id + '.evapotranspiration', true, adapter.log.debug);
    this.temperature = new State(adapter, this.id + '.temperature', true);
    this.isRunning = new State(adapter, this.id + '.isRunning', true);
}

Zone.prototype.create = function() {
    this.adapter.log.info('create zone ' + this.id);
    this.settings.create();

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
    });

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
    });

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
    });

    this.evapotranspiration.create({
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
    });

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
    });

    this.temperature.create({
        common: {
            read: true,
            write: false,
            desc: "",
            type: "number",
            min: 0,
            def: 0,
            unit: "°C",
            name: "temperature",
            role: "value"
        },
        native: {},
        type: 'state'
    });

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
    });

    this.humidity.value = 0;
    this.isScheduled.value = false;
    this.minutes.value = 0;
    this.evapotranspiration.value = 0;
    this.present.value = this.settings.required.value;
    this.temperature.value = 25;
    this.isRunning.value = false;
};

Zone.prototype.delete = function() {
    this.adapter.log.info('delete zone ' + this.id);

    this.settings.delete();
    this.humidity.delete();
    this.isScheduled.delete();
    this.minutes.delete();
    this.evapotranspiration.delete();
    this.present.delete();
    this.temperature.delete();
    this.isRunning.delete();

    this.adapter.delObject(this.id);
};

module.exports = Zone;