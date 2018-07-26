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

    // delete previous states
    new State(adapter, 'isSeedTime', true).delete();
    new State(adapter, 'precipitation', true).delete();
    new State(adapter, 'temperature', true).delete();
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
};

Irrigation.prototype.delete = function() {
    this.isScheduled.delete();
    this.isReady.delete();
    this.isRunning.delete();
    this.isAutomatic.delete();
};

module.exports = Irrigation;