'use strict';

const State = require('./state.js');

/**
 *
 * @param {Adapter} adapter
 * @param {string} id
 * @constructor
 */
function ZoneSettings(adapter, id) {
    this.adapter = adapter;
    this.id = id;
    this.required = new State(adapter, this.id + '.required', false);
    this.output = new State(adapter, this.id + '.output', false);
    this.temperature = new State(adapter, this.id + '.temperature', false);
    this.trigger = new State(adapter, this.id + '.trigger', false);
    this.isAutomatic = new State(adapter, this.id + '.isAutomatic', false);

    // delete previous states
    new State(adapter, this.id + '.isSeedTime', false).delete();
}

ZoneSettings.prototype.create = function() {
    this.required.create({
            common: {
                name: 'required',
                read: true,
                write: true,
                desc: "",
                type: "number",
                min: 0,
                max: 255,
                def: 0,
                unit: "mm/d",
                role: 'value'
            },
            native: {},
            type: 'state'
        }, false, this.required.value || 15);

    this.output.create({
        common: {
            read: true,
            write: true,
            desc: "",
            type: "number",
            min: 0.1,
            max: 1,
            def: 0,
            unit: "mm/min",
            name: "output",
            role: "value"
          },
          native: {},
          type: 'state'
    }, false, this.output.value || 0.1111);

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
    }, false, this.temperature.value || 35);

    this.trigger.create({
        common: {
            read: true,
            write: true,
            desc: "",
            type: "number",
            min: 0,
            max: 100,
            def: 0,
            unit: "%",
            name: "trigger",
            role: "value"
        },
        native: {},
        type: 'state'
    }, false, this.trigger.value || 15);

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
    }, false, this.isAutomatic.value || true);
};

ZoneSettings.prototype.delete = function() {
    this.required.delete();
    this.output.delete();
    this.temperature.delete();
    this.trigger.delete();
    this.isAutomatic.delete();
};

module.exports = ZoneSettings;