'use strict';

const State = require('./state.js');

function Irrigation(adapter) {
    this.adapter = adapter;
    this.isScheduled = new State(adapter, 'isScheduled', true);
    this.isReady = new State(adapter, 'isReady', true);
    this.isRunning = new State(adapter, 'isRunning', true);
    this.temperature = new State(adapter, 'temperature', true, adapter.log.info);
}

Irrigation.prototype.create = function() {
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

    this.isReady.create({
        common: {
            name: "isReady",
            desc: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: true
        },
        native: {},
        type: 'state'
    }, true, false);

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

    this.temperature.create({
        common: {
            read: true,
            write: true,
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
    }, false, 25.0);

    // this.isRunning.value = false;
    // this.isScheduled.value = false;
    // this.isReady.value = false;
}

Irrigation.prototype.delete = function() {
    this.isScheduled.delete();
    this.isReady.delete();
    this.isRunning.delete();
    this.temperature.delete();
}

module.exports = Irrigation;