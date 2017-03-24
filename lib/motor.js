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

var Motor = module.exports = function Motor(opts) {
  Motor.__super__.constructor.apply(this, arguments);

  this._rosNode = null;
  this._isOn = false;
  this._name = opts.name;
  this._freq = opts.freq || null;
  this._pwmScale = opts.pwmScale || { bottom: 0, top: 255 };

  if (this.pin == null) {
    throw new Error("No pin specified for Motor. Cannot proceed");
  }
};

Cylon.Utils.subclass(Motor, Cylon.Driver);

Motor.prototype.start = function(callback) {
  this._topicHandlers = [
    { topic: "turnOn_" + this._name, handler: this._turnOn },
    { topic: "turnOff_" + this._name, handler: this._turnOff },
    { topic: "toggle_" + this._name, handler: this._toggle },
    { topic: "speed_" + this._name, handler: this._speed }
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

Motor.prototype.halt = function(callback) {
  this._topicHandlers.forEach((topicHandler) => {
    this._rosNode.unsubscribe("/" + topicHandler.topic);
  });
  callback();
};

Motor.prototype._turnOn = function() {
  this._isOn = true;
  this.connection.digitalWrite(this.pin, 1, null);
};

Motor.prototype._turnOff = function() {
  this._isOn = false;
  this.connection.digitalWrite(this.pin, 0, null);
};

Motor.prototype._toggle = function() {
  if (this._isOn) {
    this._turnOff();
  } else {
    this._turnOn();
  }
};

Motor.prototype._speed = function(value) {
  var scaledDuty = (value).fromScale(this._pwmScale.bottom, this._pwmScale.top);

  this.connection.pwmWrite(this.pin, scaledDuty, this. freq, null, null, null);
  this._isOn = value > 0;
};
