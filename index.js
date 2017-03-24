"use strict";

var Drivers = {
  "ros-analog-sensor": require("./lib/analog-sensor"),
  "ros-button": require("./lib/button"),
  "ros-continuous-servo": require("./lib/continuous-servo"),
  "ros-led": require("./lib/led"),
  "ros-servo": require("./lib/servo"),
  "ros-direct-pin": require("./lib/direct-pin"),
  "ros-motor": require("./lib/motor"),
  "ros-relay": require("./lib/relay"),
  "ros-maxbotix": require("./lib/maxbotix"),
  "ros-temperature-sensor": require("./lib/temperature-sensor"),
  "ros-rgb-led": require("./lib/rgb-led")
};

module.exports = {
  drivers: Object.keys(Drivers),

  driver: function(opts) {
    opts = opts || {};

    if (!Drivers[opts.driver]) {
      return null;
    }

    return new Drivers[opts.driver](opts);
  }
};
