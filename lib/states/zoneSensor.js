'use strict';

const State = require('./state.js');

/**
 *
 * @param {Adapter} adapter
 * @param {string} id
 * @constructor
 */
function ZoneSensor(adapter, id) {
    this.adapter = adapter;
    this.id = id;
    this.temperature = new State(adapter, this.id + '.temperature', false);
    this.humidity = new State(adapter, this.id + '.humidity', false);
    this.precipitation = new State(adapter, this.id + '.precipitation', true);
}

ZoneSensor.prototype.create = function() {
    this.temperature.create({
        common: {
            read: true,
            write: true,
            desc: "",
            type: "number",
            min: 0,
            max: 40,
            def: 0,
            unit: "°C",
            name: "temperture",
            role: "value"
        },
        native: {},
        type: 'state'
    }, false, this.temperature.value || 0);

    this.humidity.create({
        common: {
            read: true,
            write: true,
            desc: "",
            type: "number",
            min: 0,
            max: 100,
            def: 0,
            unit: "%",
            name: "humidity",
            role: "value"
        },
        native: {},
        type: 'state'
    }, false, this.humidity.value || 100);

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
    }, true, 0);
};

ZoneSensor.prototype.delete = function() {
    this.temperature.delete();
    this.humidity.delete();
    this.precipitation.delete();
};

module.exports = ZoneSensor;