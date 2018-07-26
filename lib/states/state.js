'use strict';

const SubscriptionType = {
    ON_CHANGE : 1,
    ON_UPDATE : 2
};

const AcknowledgeType = {
    FALSE: false,
    TRUE : true,
    ANY : null
};

/**
 *
 * @param {Adapter} adapter
 * @param {string} stateID
 * @param {boolean|null} ack
 * @param {function} logger
 * @constructor
 */
function State(adapter, stateID, ack = false, logger = adapter.log.debug) {
    this.id = stateID;
    this.namespace = adapter.namespace + '.' + stateID;
    this.adapter = adapter;

    if(typeof ack === 'function') {
        this.ack = false;
        this.logger = adapter.log.debug;
    } else {
        this.ack = ack;
        this.logger = logger;
    }

    this.state = { val:null, ack:this.ack, ts: new Date().getTime() };
    this.subscriptions = [];

    let self = this;

    this.adapter.subscribeStates(this.id);
    this.adapter.on('stateChange', function (id, state) {
        //self.adapter.log.debug(id);
        //self.adapter.log.debug(self.id);

        if(id === self.namespace) {
            self.logger('stateChanged: ' + id + ' ' + JSON.stringify(state));

            if(state == null) {
                return;
            }

            let oldState = self.state;
            self.state = state;
            let isChanged = state.val !== oldState.val;

            self.subscriptions.forEach(function(current) {
                if( current.ack === AcknowledgeType.ANY || current.ack === state.ack) {
                    if(current.type === SubscriptionType.ON_UPDATE || isChanged === true) {
                        let callback = current.callback;
                        if(typeof callback === 'function') {
                            callback(state);
                        }
                    }
                }
            });
        }
    });

    this.getValue(function(err, state) {
        self.logger('getValue: ' + self.id + ' ' + JSON.stringify(state));
        if(state) {
            self.state = state;
        }
    });
}

State.prototype.getValue = function(callback) {
    if(typeof callback === 'function') {
        this.adapter.getState(this.id, callback);
    } else {
        this.logger('State(' + this.id + ').getValue() returns ' + this.state.val);
        return this.state.val;
    }
};

State.prototype.setValue = function(value, ack) {
    if(typeof ack === 'undefined') {
        ack = this.ack;
    }

    this.logger('State(' + this.id + ').setValue(' + value + ', ' + ack + ')');

    this.state.val = value;
    this.state.ack = ack;
    this.adapter.setState(this.id, value, ack);
};

State.prototype.onChange = function(callback, ack = AcknowledgeType.ANY) {
    return this.subscribe({type: SubscriptionType.ON_CHANGE, ack: ack, callback: callback});
};

State.prototype.onUpdate = function(callback, ack = AcknowledgeType.ANY) {
    return this.subscribe({type: SubscriptionType.ON_UPDATE, ack: ack,  callback: callback});
};

State.prototype.subscribe = function(subscription) {
    this.subscriptions.push(subscription);
    this.logger(this.namespace + ' has active subscriptions: ' + this.subscriptions.length);
    return subscription;
};

State.prototype.unsubscribe = function(subscription) {
    let index = this.subscriptions.indexOf(subscription);
    this.subscriptions.splice(index, 1);

    this.logger(this.namespace + ' remove subscription with index: ' + index);
    this.logger(this.namespace + ' has active subscriptions: ' + this.subscriptions.length);
};

State.prototype.create = function(json, force = true, def) {
    let self = this;
    json.common.name = this.namespace;
    this.exists(function (result) {
        if(result === false || (result === true && force === true)) {
            self.logger('create state ' + self.id);
            self.adapter.setObject(self.id, json);

            if(typeof def !== 'undefined') {
                self.value = def;
            }
        }
    });
};

State.prototype.delete = function() {
    this.logger('delete state ' + this.id);

    this.subscriptions = [];
    this.adapter.unsubscribeStates(this.id);
    this.adapter.delState(this.id);
    this.adapter.delObject(this.id);
};

State.prototype.exists = function(callback) {
    if(typeof callback !== 'function') {
        return;
    }

    let self = this;
    this.adapter.getState(this.id, function (err, state) {
        if(err) {
            self.logger('state ' + self.namespace + ' does not exists');
            callback(false);
        } else {
            self.logger(JSON.stringify(state));
            if(state === null) {
                self.logger('state ' + self.namespace + ' does not exists');
                callback(false);
            } else {
                self.logger('state ' + self.namespace + ' does exists');
                callback(true);
            }
        }
    });
};

Object.defineProperty(State.prototype, 'value', {
    get: function() { return this.getValue() },
    set: function(value) { this.setValue(value) }
});

Object.defineProperty(State.prototype, 'lastUpdate', {
    get: function() {
        this.logger('State(' + this.id + ').lastUpdate returns ' + this.state.ts);
        return this.state.ts;
    },
});

module.exports = State;
