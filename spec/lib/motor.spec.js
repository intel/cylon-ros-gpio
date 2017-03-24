"use strict";

var Motor = lib("motor");

describe("Motor", function() {
  var driver;

  beforeEach(function() {
    driver = new Motor({
      name: "motor",
      connection: { digitalWrite: spy(), pwmWrite: spy() },
      pin: 22
    });
  });

  describe("constructor", function() {
    it("sets @pin to the value of the passed pin", function() {
      expect(driver.pin).to.be.eql(22);
    });

    context("if no pin is specified", function() {
      it("throws an error", function() {
        var fn = function() { return new Motor({ name: "no-pin-motor" }); };
        expect(fn).to.throw("No pin specified for Motor. Cannot proceed");
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

    it("turn on Motor connected to pin 22", function(done) {
      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise("/turnOn_motor",
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      this.pub = pub;
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.Int32();
      msg.data = 1;
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

    it("turn off Motor connected to pin 22", function(done) {
      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise("/turnOff_motor",
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.Int32();
      msg.data = 0;
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

    it("toggle Motor connected to pin 22", function(done) {
      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise("/toggle_motor",
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.Int32();
      msg.data = 0;
      pub.publish(msg);

      setTimeout(() => {
        expect(driver._toggle).to.be.called;
        done();
      }, 200);
    });
  });

  describe("#speed", function() {
    beforeEach(function(done) {
      driver.start(function() {
        done();
      });
    });

    it("set speed of motor", function(done) {
      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise("/speed_motor",
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
        expect(driver.connection.pwmWrite).to.be.called;
        done();
      }, 500);
    });
  });
});
