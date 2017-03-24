"use strict";

var Servo = lib("servo");

describe("Servo", function() {
  var driver;

  beforeEach(function() {
    driver = new Servo({
      name: "servo",
      connection: { digitalWrite: spy(), servoWrite: spy(), pwmWrite: spy() },
      pin: 22
    });
  });

  describe("constructor", function() {
    it("sets @pin to the value of the passed pin", function() {
      expect(driver.pin).to.be.eql(22);
    });

    context("if no pin is specified", function() {
      it("throws an error", function() {
        var fn = function() { return new Servo({ name: "no-pin-servo" }); };
        expect(fn).to.throw("No pin specified for Servo. Cannot proceed");
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

  describe("#angle", function() {
    beforeEach(function(done) {
      stub(driver, "_angle");
      driver.start(function() {
        done();
      });
    });

    it("set angle of servo", function(done) {
      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise("/angle_servo",
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      this.pub = pub;
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.Int32();
      msg.data = 45;
      pub.publish(msg);
      setTimeout(() => {
        expect(driver._angle).to.be.calledWith(45);
        done();
      }, 500);
    });
  });
});
