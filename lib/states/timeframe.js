const State = require('./state.js');

/**
 *
 * @param {Adapter} adapter
 * @param {string} id
 * @constructor
 */
function Timeframe(adapter, id) {
    this.adapter = adapter;
    this.id = id;

    this.start = new State(adapter, this.id + '.start', false);
    this.end = new State(adapter, this.id + '.end', false);
}

Timeframe.prototype.create = function() {

    this.adapter.setObject(this.id, {
        common: {
            name: this.id,
            role: 'channel'
        },
        native: {},
        type: 'channel'
    });

    this.start.create({
        common: {
            read: true,
            write: true,
            desc: "Minute of the day",
            type: "number",
            min: -1,
            max: 1440,
            def: 0,
            unit: "min",
            name: "start",
            role: "value"
        },
        native: {},
        type: 'state'
    }, true, this.start.value || -1);

    this.end.create({
        common: {
            read: true,
            write: true,
            desc: "Minute of the day",
            type: "number",
            min: 0,
            max: 1440,
            def: 0,
            unit: "min",
            name: "end",
            role: "value"
        },
        native: {},
        type: 'state'
    }, true, this.end.value || -1);
};

Timeframe.prototype.delete = function() {
    this.start.delete();
    this.end.delete();

    this.adapter.delObject(this.id);
};

module.exports = Timeframe;