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

var ContinuousServo = module.exports = function ContinuousServo(opts) {
  ContinuousServo.__super__.constructor.apply(this, arguments);

  this._rosNode = null;
  this._name = opts.name;
  this._freq = opts.freq || null;
  this._pwmScale = opts.pwmScale || { bottom: 0, top: 180 };
  this._pulseWidth = opts.pulseWidth || { min: 500, max: 2400 };

  if (this.pin == null) {
    throw new Error("No pin specified for Continuous Servo. Cannot proceed");
  }
};

Cylon.Utils.subclass(ContinuousServo, Cylon.Driver);

ContinuousServo.prototype.start = function(callback) {
  this._topicHandlers = [
    { topic: "clockwise_" + this._name, handler: this._clockwise },
    { topic: "counter_clockwise_" + this._name,
      handler: this._counterClockwise },
    { topic: "stop_" + this._name, handler: this._stop }
  ];

  rosnodejs.initNode("/cylon-ros", {
    messages: ["std_msgs/String", "std_msgs/Bool", "std_msgs/Int32",
        "std_msgs/Float32"]
  }).then((rosNode) => {
    this._rosNode = rosNode;
    this._topicHandlers.forEach((topicHandler) => {
      rosNode.subscribe(
        "/" + topicHandler.topic,
        "std_msgs/String",
        (data) => { topicHandler.handler.call(this, data.data); },
        { queueSize: 1,
         latching: true,
         throttleMs: 1 });
    });
    callback();
  });
};

ContinuousServo.prototype.halt = function(callback) {
  this._topicHandlers.forEach((topicHandler) => {
    this._rosNode.unsubscribe("/" + topicHandler.topic);
  });
  callback();
};

ContinuousServo.prototype._clockwise = function() {
  this._rotate(180);
};

ContinuousServo.prototype._counterClockwise = function() {
  this._rotate(0);
};

ContinuousServo.prototype._stop = function() {
  this._rotate(90);
};

ContinuousServo.prototype._rotate = function(spin) {
  var scaledDuty = (spin).fromScale(
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
};
