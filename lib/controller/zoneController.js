'use strict';

/**
 * @param {Adapter} adapter
 * @param {Zone} zone
 *
 */
function ZoneController(adapter, zone) {
    this.adapter = adapter;
    this.zone = zone;
    this.zone.isRunning.value = false;
    this.zone.isScheduled.value = false;

    let self = this;
    this.zone.present.onUpdate(function () {
        self.calculate();
    });

    this.zone.settings.output.onUpdate(function () {
        self.calculate();
    });

    this.zone.settings.required.onUpdate(function () {
        self.calculate();
    });
}

ZoneController.prototype.start = function() {
    this.zone.isRunning.value = true;

    if(this.isLow() === false) {
        this.stop();
    }
};

ZoneController.prototype.stop = function() {
    this.zone.isRunning.value = false;
};

/**
 * @param {number} ms
 */
ZoneController.prototype.tick = function(ms = 60000) {
    let self = this;
    let currentUpdate = new Date().getTime();
    let minutes = Math.round((currentUpdate - this.zone.evapotranspiration.lastUpdate) / ms);

    if(minutes < 1) {
        return;
    }

    let coefficient = this.zone.settings.required.value / 60 / 24;
    coefficient = Math.pow(Math.max(1, this.zone.settings.temperature.value), 2) / coefficient;

    let isRunning = self.zone.isRunning.value;
    let isScheduled = self.zone.isScheduled.value;
    let base = Math.max(0, this.zone.temperature.value);

    self.zone.evapotranspiration.value = Math.round(((Math.pow(base, 2) / coefficient) * minutes) *100000) / 100000;

    if(isRunning === false) {
        self.zone.present.value = Math.max(0, self.zone.present.value - self.zone.evapotranspiration.value);
    } else {
        self.zone.present.value = self.zone.present.value + (self.zone.settings.output.value);
        if(self.zone.present.value >= self.zone.settings.required.value) {
            self.stop();
        }
    }

    self.calculate();
};

ZoneController.prototype.calculate = function() {
    let self = this;
    let minutes = (self.zone.settings.required.value - self.zone.present.value) / self.zone.settings.output.value;
    let humidity = (self.zone.present.value / self.zone.settings.required.value) * 100;

    self.zone.humidity.value = Math.round(humidity * 10) / 10;
    self.zone.minutes.value =  Math.max(0, Math.ceil(minutes));

    let isLow = self.isLow();

    self.zone.isScheduled.value = (self.zone.settings.isAutomatic.value && isLow) || self.zone.isRunning.value === true;
};

ZoneController.prototype.isLow = function() {
    return this.zone.settings.trigger.value >= this.zone.humidity.value;
};

module.exports = ZoneController;



