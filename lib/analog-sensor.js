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

var Cylon = require("cylon");
var rosnodejs = require("rosnodejs");

var AnalogSensor = module.exports = function AnalogSensor(opts) {
  AnalogSensor.__super__.constructor.apply(this, arguments);

  this._upperLimit = opts.upperLimit || 256;
  this._lowerLimit = opts.lowerLimit || 0;
  this._analogVal = null;
  this._name = opts.name;
  this._rosNode = null;

  if (this.pin == null) {
    throw new Error("No pin specified for Analog Sensor. Cannot proceed");
  }
};

Cylon.Utils.subclass(AnalogSensor, Cylon.Driver);

AnalogSensor.prototype.start = function(callback) {
  this._topics = [
    "analogRead_" + this._name,
    "upperLimit_" + this._name,
    "lowerLimit_" + this._name
  ];

  rosnodejs.initNode("/cylon-ros", {
    messages: ["std_msgs/String", "std_msgs/Bool", "std_msgs/Int32",
        "std_msgs/Float32"]
  }).then((rosNode) => {
    this._rosNode = rosNode;
    this.connection.analogRead(this.pin, (err, val) => {
      if (err) { return; }

      this._analogVal = val;
      var topic = "";

      if (val >= this._upperLimit) {
        topic = "/upperLimit_" + this._name;
      } else if (val <= this._lowerLimit) {
        topic = "/lowerLimit_" + this._name;
      } else {
        topic = "/analogRead_" + this._name;
      }

      var pub = this._rosNode.advertise(topic,
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      const StdMsgs = rosnodejs.require("std_msgs").msg;
      const msg = new StdMsgs.Int32();
      msg.data = this._analogVal;
      pub.publish(msg);
    });
    callback();
  });
};

AnalogSensor.prototype.halt = function(callback) {
  this._topics.forEach((topic) => {
    this._rosNode.unsubscribe("/" + topic);
  });
  callback();
};
