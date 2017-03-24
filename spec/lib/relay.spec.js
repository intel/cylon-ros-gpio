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

var Relay = lib("relay");

describe("Relay", function() {
  var driver;

  beforeEach(function() {
    driver = new Relay({
      name: "relay",
      connection: { digitalWrite: spy() },
      pin: 22
    });
  });

  describe("constructor", function() {
    it("sets @pin to the value of the passed pin", function() {
      expect(driver.pin).to.be.eql(22);
    });

    context("if no pin is specified", function() {
      it("throws an error", function() {
        var fn = function() { return new Relay({ name: "no-pin-relay" }); };
        expect(fn).to.throw("No pin specified for Relay. Cannot proceed");
      });
    });
  });

  describe("#start", function() {
    var spyCallback = spy();

    beforeEach(function(done) {
      var callback = function() {
        spyCallback();
        done();
      };
      driver.start(callback);
    });

    it("triggers the callback", function() {
      expect(spyCallback).to.be.calledOnce;
    });
  });

  describe("#halt", function() {
    var spyCallback = spy();

    beforeEach(function(done) {
      driver.start(() => {
        var callback = function() {
          spyCallback();
          done();
        };
        driver.halt(callback);
      });
    });

    it("triggers the callback", function() {
      expect(spyCallback).to.be.calledOnce;
    });
  });

  describe("#turnOn", function() {
    beforeEach(function(done) {
      driver.start(function() {
        done();
      });
    });

    it("turn on Relay connected to pin 22", function(done) {
      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise("/turnOn_relay",
          "std_msgs/String", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      this.pub = pub;
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.String();
      msg.data = "turnOn";
      pub.publish(msg);

      setTimeout(() => {
        expect(driver._isOn).to.be.true;
        expect(driver.connection.digitalWrite).to.be.calledWith(22, 1);
        done();
      }, 200);
    });
  });

  describe("#turnOff", function() {
    beforeEach(function(done) {
      driver.start(function() {
        driver._isOn = true;
        done();
      });
    });

    it("turn off Relay connected to pin 22", function(done) {
      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise("/turnOff_relay",
          "std_msgs/String", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.String();
      msg.data = "turnOff";
      pub.publish(msg);

      setTimeout(() => {
        expect(driver._isOn).to.be.false;
        expect(driver.connection.digitalWrite).to.be.calledWith(22, 0);
        done();
      }, 200);
    });
  });

  describe("#toggle", function() {
    beforeEach(function() {
      stub(driver, "_toggle");
      driver.start();
    });

    it("toggle Relay connected to pin 22", function(done) {
      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise("/toggle_relay",
          "std_msgs/String", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.String();
      msg.data = "toggle";
      pub.publish(msg);

      setTimeout(() => {
        expect(driver._toggle).to.be.called;
        done();
      }, 200);
    });
  });
});
