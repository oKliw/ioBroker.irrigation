'use strict';

const State = require('./state.js');

/**
 *
 * @param {Adapter} adapter
 * @constructor
 */
function Irrigation(adapter) {
    this.adapter = adapter;
    this.isScheduled = new State(adapter, 'isScheduled', true);
    this.isReady = new State(adapter, 'isReady', true);
    this.isRunning = new State(adapter, 'isRunning', true);
    this.isAutomatic = new State(adapter, 'isAutomatic', true);
    this.isSeedTime = new State(adapter, 'isSeedTime', true);
    this.temperature = new State(adapter, 'temperature', true);
    this.precipitation = new State(adapter, 'precipitation', true);
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

    this.isAutomatic.create({
        common: {
            name: "isAutomatic",
            desc: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: true
        },
        native: {},
        type: 'state'
    }, false, false);

    this.isSeedTime.create({
        common: {
            name: "isSeedTime",
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

    this.precipitation.create({
        common: {
            read: true,
            write: true,
            desc: "",
            type: "number",
            min: 0,
            def: 0,
            unit: "mm",
            name: "precipitation",
            role: "value"
        },
        native: {},
        type: 'state'
    }, false, 0);
};

Irrigation.prototype.delete = function() {
    this.isScheduled.delete();
    this.isReady.delete();
    this.isRunning.delete();
    this.isAutomatic.delete();
    this.temperature.delete();
    this.isSeedTime.delete();
};

module.exports = Irrigation;