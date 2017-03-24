/*
 * Copyright 2017 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
