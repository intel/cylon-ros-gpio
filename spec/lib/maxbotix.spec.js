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

var Maxbotix = lib("maxbotix");

describe("Maxbotix", function() {
  var driver;

  beforeEach(function() {
    driver = new Maxbotix({
      name: "maxbotix",
      connection: {},
      pin: 22
    });
  });

  describe("constructor", function() {
    it("sets @pin to the value of the passed pin", function() {
      expect(driver.pin).to.be.eql(22);
    });

    context("if no pin is specified", function() {
      it("throws an error", function() {
        var fn = function() {
            return new Maxbotix({ name: "no-pin-maxbotix" }); };
        expect(fn).to.throw("No pin specified for Maxbotix. Cannot proceed");
      });
    });
  });

  describe("maxbotix range/rangeCm", function() {
    var spyCallback = spy();

    beforeEach(function(done) {
      driver.connection = { analogRead: stub() };
      var callback = function() {
        spyCallback();
        done();
      };
      driver.start(callback);
    });

    context("maxbotix range/rangeCm", function() {
      beforeEach(function() {
        driver.connection.analogRead.yield(null, 10.5);
      });

      it("range/rangeCm", function(done) {
        var range = spy();
        var rangeCm = spy();
        var rosnodejs = require("rosnodejs");

        rosnodejs.getNodeHandle().subscribe("/range_maxbotix",
            "std_msgs/Float32",
            (data) => { range(data.data); },
            { queueSize: 1,
              latching: true,
              throttleMs: 1
        });
        rosnodejs.getNodeHandle().subscribe("/rangeCm_maxbotix",
            "std_msgs/Float32",
            (data) => { rangeCm(data.data); },
            { queueSize: 1,
              latching: true,
              throttleMs: 1
        });

        setTimeout(() => {
          expect(range).to.be.calledOnce;
          expect(rangeCm).to.be.calledOnce;
          done();
        }, 200);
      });
    });
  });
});
