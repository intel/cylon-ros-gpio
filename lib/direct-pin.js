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

let DirectPin = module.exports = function DirectPin(opts) {
  DirectPin.__super__.constructor.apply(this, arguments);

  this._name = opts.name;
  this._rosNode = null;

  if (this.pin == null) {
    throw new Error("No pin specified for Direct Pin. Cannot proceed");
  }
};

Cylon.Utils.subclass(DirectPin, Cylon.Driver);

DirectPin.prototype.start = function(callback) {
  this._topicHandlers = [
    { topic: "digitalRead_" + this._name, handler: this._digitalRead },
    { topic: "digitalWrite_" + this._name, handler: this._digitalWrite },
    { topic: "analogRead_" + this._name, handler: this._analogRead },
    { topic: "analogWrite_" + this._name, handler: this._analogWrite },
    { topic: "pwmWrite_" + this._name, handler: this._pwmWrite },
    { topic: "servoWrite_" + this._name, handler: this._servoWrite }
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

DirectPin.prototype.halt = function(callback) {
  this._topicHandlers.forEach((topicHandler) => {
    this._rosNode.unsubscribe("/" + topicHandler.topic);
  });
  callback();
};

DirectPin.prototype._digitalRead = function() {
  this.connection.digitalRead(this.pin, (err, data) => {
    if (err) { return; }

    const StdMsgs = rosnodejs.require("std_msgs").msg;
    const msg = new StdMsgs.Int32();
    msg.data = data;

    let pub = this._rosNode.advertise("/digitalRead_" + this._name + "_result",
        "std_msgs/Int32", {
            queueSize: 1,
            latching: true,
            throttleMs: 1
    });
    pub.publish(msg);
  });
};

DirectPin.prototype._analogRead = function() {
  this.connection.analogRead(this.pin, (err, data) => {
    if (err) { return; }

    const StdMsgs = rosnodejs.require("std_msgs").msg;
    const msg = new StdMsgs.Int32();
    msg.data = data;
    let pub = this._rosNode.advertise("/analogRead_" + this._name + "_result",
        "std_msgs/Int32", {
            queueSize: 1,
            latching: true,
            throttleMs: 1
    });
    pub.publish(msg);
  });
};

DirectPin.prototype._digitalWrite = function(value) {
  this.connection.digitalWrite(this.pin, value);
};

DirectPin.prototype._analogWrite = function(value) {
  this.connection.analogWrite(this.pin, value);
};

DirectPin.prototype._pwmWrite = function(value) {
  return this.connection.pwmWrite(this.pin, value);
};

DirectPin.prototype._servoWrite = function(value) {
  return this.connection.servoWrite(this.pin, value);
};
