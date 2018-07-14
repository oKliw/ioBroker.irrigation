'use strict';

const Irrigation = require('./../states/irrigation.js');

function IrrigationController(adapter, timeframes = [], zones = []) {
    this.adapter = adapter;
    this.irrigation = new Irrigation(adapter);
    this.timeframes = timeframes;
    this.zones = zones;
    this.timer = null;

    this.irrigation.create();

    /** @type IrrigationController **/
    let self = this;

    this.irrigation.isReady.onUpdate(function (state) {
        if(state.val === false) {
            self.zones.forEach(function (controller) {
                controller.stop();
            });
            self.irrigation.isRunning.value = false;
        }
    });

    this.irrigation.isAutomatic.onUpdate(function(state) {
        self.zones.forEach(function (controller) {
            controller.zone.settings.isAutomatic.value = state.val;
        })
    });

    this.irrigation.precipitation.onUpdate(function (state) {
        let value = state.val;

        if(value != null && value > 0) {
            self.zones.forEach(function (controller) {
                controller.zone.present.value = Math.min(15, Math.max(0, controller.zone.present.value + value));
            })
        }
    });

    this.irrigation.temperature.onUpdate(function (state) {
        self.zones.forEach(function (controller) {
            controller.zone.temperature.value = state.val;
        })
    });


    this.zones.forEach(function (controller) {
        controller.zone.isScheduled.onUpdate(function () {
            let isScheduled = self.zones.some(function (current) {
                return current.zone.isScheduled.value === true;
            });

            self.irrigation.isScheduled.value = isScheduled;
            if(isScheduled === true) {
                self.try();
            } else {
                self.irrigation.isRunning.value = false;
            }
        });
    });
}

IrrigationController.prototype.try = function() {
    if(this.irrigation.isRunning.value === false && this.irrigation.isScheduled.value === true) {
        /** @type IrrigationController **/
        let self = this;

        // run function and queue handling
        let run = function(that, index) {
            /** @type ZoneController **/
            let controller = that.zones[index];

            that.adapter.log.info('current controller index: ' + index);
            that.adapter.log.info('controller ' + controller.zone.id + ' started');

            let onIsRunning = controller.zone.isRunning.onUpdate(function (obj) {
                if(obj.val === false) {
                    that.adapter.log.info('controller ' + controller.zone.id + ' stopped');
                    controller.zone.isRunning.unsubscribe(onIsRunning);

                    let next = index + 1;
                    if(next < that.zones.length) {
                        that.adapter.log.info('run with next index: ' + next);
                        run(that, next);
                    } else {
                        that.irrigation.isRunning.value = false;
                    }
                }
            });

            let onIsReady = that.irrigation.isReady.onUpdate(function (obj) {
                if(obj.val === false) {
                    that.irrigation.isReady.unsubscribe(onIsReady);
                    controller.zone.isRunning.unsubscribe(onIsRunning);
                    controller.stop();
                }
            });

            controller.start();
        };

        // start irrigation if its inside timeframe.
        if(this.isInside() === true) {
            this.irrigation.isRunning.value = true;
            let onIsReady = this.irrigation.isReady.onUpdate(function (obj) {
                if(obj.val === true) {
                    self.irrigation.isReady.unsubscribe(onIsReady);

                    if(self.isInside() === true) {
                        if (self.zones.length > 0) {
                            run(self, 0);
                        }
                    } else {
                        self.irrigation.isRunning.value = false;
                    }
                }
            });

            // touch isReady if its true, to trigger the event isReady.onUpdate()
            if(this.irrigation.isReady.value === true) {
                this.irrigation.isReady.value = true;
            }
        }
    }
};

IrrigationController.prototype.isInside = function() {
    let currentDate = new Date();
    let minuteOfDay = (currentDate.getHours() * 60) +  currentDate.getMinutes();

    return this.timeframes.some(function (timeframe) {
        return minuteOfDay >= timeframe.start.value && minuteOfDay <= timeframe.end.value;
    });
};

IrrigationController.prototype.irrigate = function() {
    this.zones.forEach(function (controller) {
        controller.tick(60000);
    })
};

IrrigationController.prototype.start = function() {
    /** @type IrrigationController **/
    let self = this;

    if(this.timer !== null) {
        clearInterval(this.timer);
        this.timer = null;
    }

    this.timer = setInterval(function() {
        self.irrigate();
    }, 60000);
};

module.exports = IrrigationController;