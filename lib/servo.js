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

let Servo = module.exports = function Servo(opts) {
  Servo.__super__.constructor.apply(this, arguments);

  this._angleValue = 0;
  this._rosNode = null;
  this._name = opts.name;
  this._angleRange = opts.range || { min: 20, max: 160 };
  this._freq = opts.freq || null;
  this._pulseWidth = opts.pulseWidth || { min: 500, max: 2400 };
  this._pwmScale = opts.pwmScale || { bottom: 0, top: 180 };

  if (this.pin == null) {
    throw new Error("No pin specified for Servo. Cannot proceed");
  }
};

Cylon.Utils.subclass(Servo, Cylon.Driver);

Servo.prototype.start = function(callback) {
  this._topicHandlers = [
    { topic: "angle_" + this._name, handler: this._angle }
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

Servo.prototype.halt = function(callback) {
  this._topicHandlers.forEach((topicHandler) => {
    this._rosNode.unsubscribe("/" + topicHandler.topic);
  });
  callback();
};

Servo.prototype._angle = function(value) {
  let scaledDuty = (this.safeAngle(value)).fromScale(
    this._pwmScale.bottom,
    this._pwmScale.top
  );

  this.connection.servoWrite(
    this.pin,
    scaledDuty,
    this._freq,
    this._pulseWidth,
    null
  );
  this._angleValue = value;
};

Servo.prototype.safeAngle = function(value) {
  if (value < this._angleRange.min) {
    value = this._angleRange.min;
  } else if (value > this._angleRange.max) {
    value = this._angleRange.max;
  }

  return value;
};
