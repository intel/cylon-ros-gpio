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

let TemperatureSensor = lib("temperature-sensor");

describe("TemperatureSensor", function() {
  let driver;
  let rosnodejs = require("rosnodejs");

  beforeEach(function() {
    driver = new TemperatureSensor({
      name: "temperature-sensor",
      connection: {},
      pin: 22,
    });
    driver.connection = { servoWrite: stub(), analogRead: stub(),
      analogWrite: stub(), digitalRead: stub(), digitalWrite: stub(),
      pwmWrite: stub() };
  });

  describe("constructor", function() {
    it("sets @pin to the value of the passed pin", function() {
      expect(driver.pin).to.be.eql(22);
    });

    context("if no pin is specified", function() {
      it("throws an error", function() {
        let fn = function() { return new TemperatureSensor(
            { name: "no-pin-temperature-sensor" }); };
        expect(fn).to.throw(
            "No pin specified for Analog Sensor. Cannot proceed");
      });
    });
  });

  describe("read temperature", function() {
    beforeEach(function(done) {
      let callback = function() {
        driver.connection.analogRead.yield(null, 512);
        done();
      };
      driver.start(callback);
    });

    it("read analog value", function(done) {
      let readValue = stub();
      rosnodejs.getNodeHandle().subscribe(
          "/celsius_temperature-sensor",
          "std_msgs/Int32",
          (data) => { readValue(data.data); },
          { queueSize: 1,
            latching: true,
            throttleMs: 1
      });

      setTimeout(() => {
        expect(readValue).to.be.calledWith(25);
        expect(readValue).to.be.calledOnce;
        done();
      }, 200);
    });

    afterEach(function() {
      driver.halt(stub());
    });
  });
});
