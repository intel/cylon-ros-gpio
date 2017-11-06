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

const Cylon = require("cylon");
const rosnodejs = require("rosnodejs");

let RGBLed = module.exports = function RGBLed(opts) {
  RGBLed.__super__.constructor.apply(this, arguments);

  this._name = opts.name;
  this._rosNode = null;

  this._redPin = opts.redPin || null;
  this._greenPin = opts.greenPin || null;
  this._bluePin = opts.bluePin || null;

  this._cathode = opts.cathode || false;

  if (this._redPin == null) {
    throw new Error("No red pin specified for RGB LED. Cannot proceed");
  }

  if (this._greenPin == null) {
    throw new Error("No green pin specified for RGB LED. Cannot proceed");
  }

  if (this._bluePin == null) {
    throw new Error("No blue pin specified for RGB LED. Cannot proceed");
  }
};

Cylon.Utils.subclass(RGBLed, Cylon.Driver);

RGBLed.prototype.start = function(callback) {
  this._topicHandlers = [
    { topic: "setRGB_" + this._name, handler: this._setRGB }
  ];

  rosnodejs.initNode("/cylon-ros", {
    messages: ["std_msgs/String", "std_msgs/Bool", "std_msgs/Int32",
        "std_msgs/Float32"]
  }).then((rosNode) => {
    this._rosNode = rosNode;
    this._topicHandlers.forEach((topicHandler) => {
      rosNode.subscribe(
          "/" + topicHandler.topic,
          "std_msgs/Int32",
          (data) => { topicHandler.handler.call(this, data.data); },
          { queueSize: 1,
            latching: true,
            throttleMs: 1 });
    });
    callback();
  });
};

RGBLed.prototype.halt = function(callback) {
  this._topicHandlers.forEach((topicHandler) => {
    this._rosNode.unsubscribe("/" + topicHandler.topic);
  });
  callback();
};

RGBLed.prototype._setRGB = function(hex) {
  let val = this._hexToRgb(hex);
  this.isHigh = true;
  this.connection.pwmWrite(this._redPin, this._negateOnCathode(val.r));
  this.connection.pwmWrite(this._greenPin, this._negateOnCathode(val.g));
  this.connection.pwmWrite(this._bluePin, this._negateOnCathode(val.b));
};

RGBLed.prototype._hexToRgb = function(hex) {
  let param = hex.toString(16);
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(param);

  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  return { r: 0, g: 0, b: 0 };
};

RGBLed.prototype._negateOnCathode = function(val) {
  let outVal;
  if (this.cathode) {
    outVal = 255 - val;
  } else {
    outVal = val;
  }
  return outVal;
};
