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

let Button = lib("button");

describe("Button", function() {
  let driver;

  beforeEach(function() {
    driver = new Button({
      name: "button",
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
        let fn = function() { return new Button({ name: "no-pin-button" }); };
        expect(fn).to.throw("No pin specified for Button. Cannot proceed");
      });
    });
  });

  describe("on the 'pressed & released' event", function() {
    let spyCallback = spy();

    beforeEach(function(done) {
      driver.connection = { digitalRead: stub() };
      let callback = function() {
        spyCallback();
        done();
      };
      driver.start(callback);
    });

    context("when the button is pressed", function() {
      beforeEach(function() {
        driver.connection.digitalRead.yield(null, 1);
      });

      it("publish topic 'pressed_button' when first pressed", function(done) {
        let pressed = spy();
        let rosnodejs = require("rosnodejs");
        rosnodejs.getNodeHandle().subscribe("/pressed_button",
            "std_msgs/Bool",
            (data) => { pressed(data.data); },
            { queueSize: 1,
              latching: true,
              throttleMs: 1
        });

        setTimeout(() => {
          expect(pressed).to.be.calledWith(true);
          expect(pressed).to.be.calledOnce;
          done();
        }, 200);
      });
    });

    context("when the button is released", function() {
      beforeEach(function() {
        driver.connection.digitalRead.yield(null, 0);
      });

      it("publish topic 'pressed_button' when first released", function(done) {
        let pressed = spy();
        let rosnodejs = require("rosnodejs");
        rosnodejs.getNodeHandle().subscribe("/pressed_button",
            "std_msgs/Bool",
            (data) => { pressed(data.data); },
            { queueSize: 1,
              latching: true,
              throttleMs: 1
        });

        setTimeout(() => {
          expect(pressed).to.be.calledWith(false);
          expect(pressed).to.be.calledOnce;
          done();
        }, 200);
      });
    });
  });
});
