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

    this.zone.sensor.precipitation.onUpdate(function (state) {
        let value = state.val;

        if(value != null && value > 0) {
            self.zone.present.value = Math.min(15, Math.max(0, self.zone.present.value + value));
        }
    });

    this.zone.sensor.temperature.onUpdate(function (state) {
        self.zone.sensor.temperature.value = state.val;
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
    let isRunning = self.zone.isRunning.value;
    let isScheduled = self.zone.isScheduled.value;
    let currentUpdate = new Date().getTime();
    let minutes = Math.round((currentUpdate - this.zone.evaporation.lastUpdate) / ms);

    self.zone.evaporation.value = Math.round(self.haudeEvaporation(minutes) *10000000) / 10000000;

    if(isRunning === false) {
        self.zone.present.value = Math.max(0, self.zone.present.value - self.zone.evaporation.value);
    } else {
        self.zone.present.value = self.zone.present.value + (self.zone.settings.output.value);
        if(self.zone.present.value >= self.zone.settings.required.value) {
            self.stop();
        }
    }

    self.calculate();
};

ZoneController.prototype.haudeEvaporation = function(minutes) {
    const haudeVector = [0.2, 0.2, 0.23, 0.24, 0.29, 0.29, 0.28, 0.26, 0.23, 0.2, 0.2, 0.2];
    const haudeFactor = haudeVector[new Date().getMonth()];
    const temperature = this.zone.sensor.temperature.value;
    const saturationPressure = 6.11 * Math.pow(Math.E, ((17.62 * temperature) / (243.12 + temperature)));
    const humidity = this.zone.sensor.humidity.value;

    let result =  ((haudeFactor * saturationPressure * (1 - (humidity / 100))) / 1440) * minutes;
    this.adapter.log.debug('Haude result for zone ' + this.zone.id + ': ' + result + ' mm/min');

    return result;
};

ZoneController.prototype.linearEvaporation = function(minutes) {
    // linear function
    // y (required per min) = m (factor by current temperature) * x (required per min by temperature)

    let y = this.zone.settings.required.value / 1440;
    let x = this.zone.settings.temperature.value;
    let m = y / x;
    let temperature = Math.max(0, this.zone.sensor.temperature.value);
    let result = Math.min(temperature * m, y) * minutes;

    this.adapter.log.debug('Linear result for zone ' + this.zone.id + ': ' + result + ' mm/min');

    return result;
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



