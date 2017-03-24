"use strict";

var Button = lib("button");

describe("Button", function() {
  var driver;

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
        var fn = function() { return new Button({ name: "no-pin-button" }); };
        expect(fn).to.throw("No pin specified for Button. Cannot proceed");
      });
    });
  });

  describe("on the 'pressed & released' event", function() {
    var spyCallback = spy();

    beforeEach(function(done) {
      driver.connection = { digitalRead: stub() };
      var callback = function() {
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
        var pressed = spy();
        var rosnodejs = require("rosnodejs");
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
        var pressed = spy();
        var rosnodejs = require("rosnodejs");
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
