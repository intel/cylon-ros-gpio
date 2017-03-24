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

var Maxbotix = module.exports = function Maxbotix(opts) {
  Maxbotix.__super__.constructor.apply(this, arguments);

  this._rosNode = null;
  this._name = opts.name;
  this._analogValue = 0;
  this._model = opts.model || "lv";

  if (this.pin == null) {
    throw new Error("No pin specified for Maxbotix. Cannot proceed");
  }
};

Cylon.Utils.subclass(Maxbotix, Cylon.Driver);

Maxbotix.prototype.start = function(callback) {
  rosnodejs.initNode("/cylon-ros", {
    messages: ["std_msgs/String", "std_msgs/Bool", "std_msgs/Int32",
        "std_msgs/Float32"]
  }).then((rosNode) => {
    this._rosNode = rosNode;
    this.connection.analogRead(this.pin, (err, readVal) => {
      if (err) { return; }
      this._analogValue = readVal;

      this._publicTopic("/range_" + this._name, this._range());
      this._publicTopic("/rangeCm_" + this._name, this._rangeCm());
    });
    callback();
  });
};

Maxbotix.prototype.halt = function(callback) {
  this._rosNode.unsubscribe("/range_" + this._name);
  this._rosNode.unsubscribe("/rangeCm_" + this._name);
  callback();
};

Maxbotix.prototype._publicTopic = function(topic, value) {
  const StdMsgs = rosnodejs.require("std_msgs").msg;
  const floatValue = new StdMsgs.Float32();
  floatValue.data = value;

  var pub = this._rosNode.advertise(topic, "std_msgs/Float32", {
      queueSize: 1,
      latching: true,
      throttleMs: 1
  });
  pub.publish(floatValue);
};

Maxbotix.prototype._range = function() {
  var models = ["lv", "xl", "xl-long", "hr", "hr-long"],
      distance = this._rangeCm();

  if (models.indexOf(this._model) > -1) {
    distance = distance * 0.3937;
  }

  return distance;
};

Maxbotix.prototype._rangeCm = function() {
  var distance;

  switch (this._model) {
    case "lv":
      distance = (this._analogValue / 2.0) / 0.3937;
      break;
    case "xl-long":
      distance = this._analogValue * 2.0;
      break;
    case "hr":
      distance = this._analogValue * 0.5;
      break;
    case "xl":
    case "hr-long":
      distance = this._analogValue;
      break;
    default:
      distance = this._analogValue;
  }

  return distance;
};
