"use strict";

var RGBLed = lib("rgb-led");

describe("RGBLed", function() {
  var driver;

  beforeEach(function() {
    driver = new RGBLed({
      name: "rgb-led",
      connection: { digitalWrite: spy(), pwmWrite: spy() },
      redPin: 3,
      greenPin: 5,
      bluePin: 6
    });
  });

  describe("constructor", function() {
    it("sets @pin to the values of the passed pin", function() {
      expect(driver._redPin).to.be.eql(3);
      expect(driver._greenPin).to.be.eql(5);
      expect(driver._bluePin).to.be.eql(6);
    });

    context("if no red pin is specified", function() {
      it("throws an error", function() {
        var fn = function() { return new RGBLed({ name: "no-pin-rgb-led" }); };
        var msg = "No red pin specified for RGB LED. Cannot proceed";
        expect(fn).to.throw(msg);
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

    it("turn on RGB LED", function(done) {
      var rosnodejs = require("rosnodejs");
      var pub = rosnodejs.getNodeHandle().advertise("/setRGB_rgb-led",
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      this.pub = pub;
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.Int32();
      msg.data = 3289650;
      pub.publish(msg);

      setTimeout(() => {
        expect(driver.connection.pwmWrite).to.be.called;
        done();
      }, 200);
    });
  });
});
