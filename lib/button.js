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

let Button = module.exports = function Button(opts) {
  Button.__super__.constructor.apply(this, arguments);

  this._rosNode = null;
  this._name = opts.name;
  this._pressed = false;

  if (this.pin == null) {
    throw new Error("No pin specified for Button. Cannot proceed");
  }
};

Cylon.Utils.subclass(Button, Cylon.Driver);

Button.prototype.start = function(callback) {

  rosnodejs.initNode("/cylon-ros", {
    messages: ["std_msgs/String", "std_msgs/Bool", "std_msgs/Int32",
        "std_msgs/Float32"]
  }).then((rosNode) => {
    this._rosNode = rosNode;
    this.connection.digitalRead(this.pin, (err, data) => {
      if (err) { return; }

      let previouslyPressed = this._pressed;
      this._pressed = (data === 1);

      const StdMsgs = rosnodejs.require("std_msgs").msg;
      const msg = new StdMsgs.Bool();

      let pub = this._rosNode.advertise("/pressed_" + this._name,
          "std_msgs/Bool", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });

      if (this._pressed && !previouslyPressed) {
        this._pressed = true;
        msg.data = true;
      } else if (!this._pressed && previouslyPressed) {
        this._pressed = false;
        msg.data = false;
      }

      pub.publish(msg);
    });
    callback();
  });
};

Button.prototype.halt = function(callback) {
  this._rosNode.unadvertise("/pressed_" + this._name);
  callback();
};
