'use strict';

const State = require('./state.js');

function ZoneSettings(adapter, id) {
    this.adapter = adapter;
    this.id = id;
    this.required = new State(adapter, id + '.required', false);
    this.output = new State(adapter, id + '.output', false);
    this.temperature = new State(adapter, id + '.temperature', false);
    this.trigger = new State(adapter, id + '.trigger', false);
    this.isAutomatic = new State(adapter, id + '.isAutomatic', false);
};

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
        }
    );

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
    });

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
    });

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
    });

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
    });

    this.required.value = 10;
    this.output.value = 0.1111;
    this.temperature.value = 30;
    this.trigger.value = 33.3;
    this.isAutomatic.value = true;
};

ZoneSettings.prototype.delete = function() {
    this.required.delete();
    this.output.delete();
    this.temperature.delete();
    this.trigger.delete();
    this.isAutomatic.delete();
};

module.exports = ZoneSettings;