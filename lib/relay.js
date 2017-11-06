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

let Relay = module.exports = function Relay(opts) {
  Relay.__super__.constructor.apply(this, arguments);

  this._rosNode = null;
  this._name = opts.name;
  this._type = opts.type || "open";
  this._isOn = false;

  if (this.pin == null) {
    throw new Error("No pin specified for Relay. Cannot proceed");
  }
};

Cylon.Utils.subclass(Relay, Cylon.Driver);

Relay.prototype.start = function(callback) {
  this._topicHandlers = [
    { topic: "turnOn_" + this._name, handler: this._turnOn },
    { topic: "turnOff_" + this._name, handler: this._turnOff },
    { topic: "toggle_" + this._name, handler: this._toggle }
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

Relay.prototype.halt = function(callback) {
  this._topicHandlers.forEach((topicHandler) => {
    this._rosNode.unsubscribe("/" + topicHandler.topic);
  });
  callback();
};

Relay.prototype._turnOn = function() {
  let newValue;
  if (this._type === "open") {
    newValue = 1;
  } else {
    newValue = 0;
  }

  this.connection.digitalWrite(this.pin, newValue, null);
  this._isOn = true;
};

Relay.prototype._turnOff = function() {
  let newValue;
  if (this._type === "open") {
    newValue = 0;
  } else {
    newValue = 1;
  }

  this.connection.digitalWrite(this.pin, newValue, null);
  this._isOn = false;
};

Relay.prototype._toggle = function() {
  if (this._isOn) {
    this._turnOff();
  } else {
    this._turnOn();
  }
};
