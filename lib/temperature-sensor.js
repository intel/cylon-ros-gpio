/*
 *    Copyright 2016 Minggang Wang
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

"use strict";

var Cylon = require("cylon");
var rosnodejs = require("rosnodejs");

var TemperatureSensor = module.exports = function TemperatureSensor(opts) {
  TemperatureSensor.__super__.constructor.apply(this, arguments);

  this._rosNode = null;
  this._name = opts.name;
  this._bValue = opts.bValue || 4275;

  if (this.pin == null) {
    throw new Error("No pin specified for Analog Sensor. Cannot proceed");
  }
};

Cylon.Utils.subclass(TemperatureSensor, Cylon.Driver);

TemperatureSensor.prototype.start = function(callback) {
  rosnodejs.initNode("/cylon-ros", {
    messages: ["std_msgs/String", "std_msgs/Bool", "std_msgs/Int32",
        "std_msgs/Float32"]
  }).then((rosNode) => {
    this._rosNode = rosNode;

    this.connection.analogRead(this.pin, (err, val) => {
      if (err) { return; }
      this._analogVal = val;
      this._celsius();
    });
    callback();
  });
};

TemperatureSensor.prototype.halt = function(callback) {
  this._rosNode.unsubscribe("/celsius_" + this._name);
  callback();
};

TemperatureSensor.prototype._celsius = function() {
  var val = this._analogVal;
  var r = (1023 - val) * 10000 / val;
  var t = 1 / (Math.log(r / 10000) / this._bValue + 1 / 298.15) - 273.15;
  var temp = Math.round(t);

  const StdMsgs = rosnodejs.require("std_msgs").msg;
  const msg = new StdMsgs.Int32();
  msg.data = temp;

  var pub = this._rosNode.advertise("/celsius_" + this._name,
      "std_msgs/Int32", {
          queueSize: 1,
          latching: true,
          throttleMs: 1
  });
  pub.publish(msg);
};
