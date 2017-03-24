"use strict";

var AnalogSensor = lib("analog-sensor");

describe("Analog Sensor", function() {
  var driver;

  beforeEach(function() {
    driver = new AnalogSensor({
      name: "analog-sensor",
      connection: {},
      pin: 22,
      upperLimit: 256,
      lowerLimit: 0
    });
  });

  describe("constructor", function() {
    it("sets @pin to the value of the passed pin", function() {
      expect(driver.pin).to.be.eql(22);
    });

    context("if no pin is specified", function() {
      it("throws an error", function() {
        var fn = function() { return new AnalogSensor(
            { name: "no-pin-analog-sensor" }); };
        expect(fn).to.throw(
            "No pin specified for Analog Sensor. Cannot proceed");
      });
    });
  });

  describe("read the analog value", function() {
    var spyCallback = spy();

    beforeEach(function(done) {
      driver.connection = { analogRead: stub() };
      var callback = function() {
        spyCallback();
        done();
      };
      driver.start(callback);
    });

    context("when the value exceeded upper limit", function() {
      beforeEach(function() {
        driver.connection.analogRead.yield(null, 500);
      });

      it("read the value", function(done) {
        var readValue = spy();
        var rosnodejs = require("rosnodejs");
        rosnodejs.getNodeHandle().subscribe("/upperLimit_analog-sensor",
            "std_msgs/Int32",
            (data) => { readValue(data.data); },
            { queueSize: 1,
              latching: true,
              throttleMs: 1
        });

        setTimeout(() => {
          expect(readValue).to.be.calledWith(500);
          expect(readValue).to.be.calledOnce;
          done();
        }, 200);
      });
    });

    context("when the value exceeded lower limit", function() {
      beforeEach(function() {
        driver.connection.analogRead.yield(null, -500);
      });

      it("read the value", function(done) {
        var readValue = spy();
        var rosnodejs = require("rosnodejs");
        rosnodejs.getNodeHandle().subscribe("/lowerLimit_analog-sensor",
            "std_msgs/Int32",
            (data) => { readValue(data.data); },
            { queueSize: 1,
              latching: true,
              throttleMs: 1
        });

        setTimeout(() => {
          expect(readValue).to.be.calledWith(-500);
          expect(readValue).to.be.calledOnce;
          done();
        }, 200);
      });
    });

    context("when the value is normal", function() {
      beforeEach(function() {
        driver.connection.analogRead.yield(null, 50);
      });

      it("read the value", function(done) {
        var readValue = spy();
        var rosnodejs = require("rosnodejs");
        rosnodejs.getNodeHandle().subscribe("/analogRead_analog-sensor",
            "std_msgs/Int32",
            (data) => { readValue(data.data); },
            { queueSize: 1,
              latching: true,
              throttleMs: 1
        });

        setTimeout(() => {
          expect(readValue).to.be.calledWith(50);
          expect(readValue).to.be.calledOnce;
          done();
        }, 200);
      });
    });
  });
});
