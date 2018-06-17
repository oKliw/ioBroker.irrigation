'use strict'

const Irrigation = require(__dirname + '/../states/irrigation.js');

function IrrigationController(adapter, timeframes = [], zones = []) {
    this.adapter = adapter;
    this.irrigation = new Irrigation(adapter);
    this.timeframes = timeframes;
    this.zones = zones;
    this.timer = null;

    this.irrigation.create();

    let self = this;

    this.irrigation.isReady.onUpdate(function (state) {
        if(state.val === false) {
            self.zones.forEach(function (controller) {
                controller.stop();
            })
            self.irrigation.isRunning.value = false;
        }
    });

    this.irrigation.precipitation.onUpdate(function (state) {
        if(state.val > 0) {
            self.zones.forEach(function (controller) {
                controller.zone.present.value = Math.min(15, Math.max(0, controller.zone.present.value - state.val));
            })
        }
    });

    this.irrigation.temperature.onUpdate(function (state) {
        self.zones.forEach(function (controller) {
            controller.zone.temperature.value = state.val;
        })
    })


    this.zones.forEach(function (controller) {
        controller.zone.isScheduled.onUpdate(function (obj) {
            let isScheduled = false;
            self.zones.forEach(function (current) {
                if(current.zone.isScheduled.value === true) {
                    isScheduled = true;
                }
            });
            self.irrigation.isScheduled.value = isScheduled;
            if(isScheduled === true) {
                self.try();
            }
        })
    });
};

IrrigationController.prototype.try = function() {
    if(this.irrigation.isRunning.value === false && this.irrigation.isScheduled.value === true) {
        let self = this;
        let run = function(that, index) {
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
                }
            });

            controller.start();
        };

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

            if(this.irrigation.isReady.value === true) {
                this.irrigation.isReady.value = true;
            }
        }
    }
}

IrrigationController.prototype.isInside = function() {
    let isInside = false;
    let currentDate = new Date();
    let minuteOfDay = (currentDate.getHours() * 60) +  currentDate.getMinutes();

    this.timeframes.forEach(function (timeframe) {
        if(minuteOfDay >= timeframe.start.value && minuteOfDay <= timeframe.end.value) {
            isInside = true;
        }
    });

    return isInside;
};

IrrigationController.prototype.irrigate = function() {
    this.zones.forEach(function (controller) {
        controller.tick(60000);
    })
};

IrrigationController.prototype.start = function() {
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