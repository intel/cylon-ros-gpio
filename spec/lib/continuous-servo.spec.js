"use strict";

var ContinuousServo = lib("continuous-servo");

describe("Continuous Servo", function() {
  var driver;

  beforeEach(function() {
    driver = new ContinuousServo({
      name: "continuous-servo",
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
        var fn = function() {
          return new ContinuousServo({ name: "no-pin-servo" });
        };
        expect(fn).to.throw(
          "No pin specified for Continuous Servo. Cannot proceed");
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

  describe("#rotate", function() {
    beforeEach(function(done) {
      driver.start(function() {
        done();
      });
    });

    it("clockwise", function(done) {
      stub(driver, "_rotate");

      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise(
          "/clockwise_continuous-servo",
          "std_msgs/String", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      this.pub = pub;
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.String();
      msg.data = "clockwise";
      pub.publish(msg);

      setTimeout(() => {
        expect(driver._rotate).to.be.calledWith(180);
        done();
      }, 200);
    });

    it("counter clockwise", function(done) {
      stub(driver, "_rotate");

      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise(
          "/counter_clockwise_continuous-servo",
          "std_msgs/String", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      this.pub = pub;
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.String();
      msg.data = "conter clockwise";
      pub.publish(msg);

      setTimeout(() => {
        expect(driver._rotate).to.be.calledWith(0);
        done();
      }, 200);
    });

    it("stop", function(done) {
      stub(driver, "_rotate");

      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise(
          "/stop_continuous-servo",
          "std_msgs/String", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      this.pub = pub;
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.String();
      msg.data = "stop";
      pub.publish(msg);

      setTimeout(() => {
        expect(driver._rotate).to.be.calledWith(90);
        done();
      }, 200);
    });
  });
});
