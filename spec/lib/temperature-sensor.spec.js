
"use strict";

var TemperatureSensor = lib("temperature-sensor");

describe("TemperatureSensor", function() {
  var driver;
  var rosnodejs = require("rosnodejs");

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
        var fn = function() { return new TemperatureSensor(
            { name: "no-pin-temperature-sensor" }); };
        expect(fn).to.throw(
            "No pin specified for Analog Sensor. Cannot proceed");
      });
    });
  });

  describe("read temperature", function() {
    beforeEach(function(done) {
      var callback = function() {
        driver.connection.analogRead.yield(null, 512);
        done();
      };
      driver.start(callback);
    });

    it("read analog value", function(done) {
      var readValue = stub();
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
