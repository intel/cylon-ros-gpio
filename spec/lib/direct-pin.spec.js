
"use strict";

var DirectPin = lib("direct-pin");

describe("DirectPin", function() {
  var driver;
  var rosnodejs = require("rosnodejs");

  beforeEach(function() {
    driver = new DirectPin({
      name: "direct-pin",
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
        var fn = function() { return new DirectPin(
            { name: "no-pin-direct-pin" }); };
        expect(fn).to.throw("No pin specified for Direct Pin. Cannot proceed");
      });
    });
  });

  describe("write/read the analog value", function() {
    var spyCallback = spy();
    beforeEach(function(done) {
      var callback = function() {
        spyCallback();
        done();
      };
      driver.start(callback);
    });

    it("write analog value", function(done) {
      var pub = rosnodejs.getNodeHandle().advertise("/analogWrite_direct-pin",
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.Int32();
      msg.data = 10;
      pub.publish(msg);

      setTimeout(() => {
        expect(driver.connection.analogWrite).to.be.calledWith(22, 10);
        expect(driver.connection.analogWrite).to.be.calledOnce;
        done();
      }, 200);
    });

    context("read analog value", function() {
      beforeEach(function(done) {
        var pub = rosnodejs.getNodeHandle().advertise(
            "/analogRead_direct-pin",
            "std_msgs/Int32", {
                queueSize: 1,
                latching: true,
                throttleMs: 1
        });

        const std_msgs = rosnodejs.require("std_msgs").msg;
        const msg = new std_msgs.Int32();
        msg.data = 10;
        pub.publish(msg);

        setTimeout(() => {
          driver.connection.analogRead.yield(null, 10);
          done();
        }, 200);
      });

      it("read the value", function(done) {
        var readValue = stub();
        rosnodejs.getNodeHandle().subscribe(
            "/analogRead_direct-pin_result",
            "std_msgs/Int32",
            (data) => { readValue(data.data); },
            { queueSize: 1,
              latching: true,
              throttleMs: 1
        });

        setTimeout(() => {
          expect(readValue).to.be.calledWith(10);
          expect(readValue).to.be.calledOnce;
          done();
        }, 200);
      });
    });

    afterEach(function() {
      driver.halt(stub());
    });
  });


  describe("write/read the digital value", function() {
    var spyCallback = spy();
    beforeEach(function(done) {
      var callback = function() {
        spyCallback();
        done();
      };
      driver.start(callback);
    });

    it("write the value", function(done) {
      var pub = rosnodejs.getNodeHandle().advertise(
          "/digitalWrite_direct-pin",
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });

      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.Int32();
      msg.data = 1;
      pub.publish(msg);

      setTimeout(() => {
        expect(driver.connection.digitalWrite).to.be.calledWith(22, 1);
        expect(driver.connection.digitalWrite).to.be.calledOnce;
        done();
      }, 200);
    });

    context("read digital value", function() {
      beforeEach(function(done) {
        var pub = rosnodejs.getNodeHandle().advertise(
            "/digitalRead_direct-pin",
            "std_msgs/Int32", {
                queueSize: 1,
                latching: true,
                throttleMs: 1
        });
        const std_msgs = rosnodejs.require("std_msgs").msg;
        const msg = new std_msgs.Int32();
        msg.data = 10;
        pub.publish(msg);

        setTimeout(() => {
          driver.connection.digitalRead.yield(null, 10);
          done();
        }, 200);
      });

      it("read the value", function(done) {
        var readValue = stub();
        rosnodejs.getNodeHandle().subscribe(
            "/digitalRead_direct-pin_result",
            "std_msgs/Int32",
            (data) => { readValue(data.data); },
            { queueSize: 1,
              latching: true,
              throttleMs: 1
        });

        setTimeout(() => {
          expect(readValue).to.be.calledWith(10);
          expect(readValue).to.be.calledOnce;
          done();
        }, 200);
      });
    });

    afterEach(function() {
      driver.halt(stub());
    });
  });

  describe("write pwm value", function() {
    var spyCallback = spy();

    beforeEach(function(done) {
      var callback = function() {
        spyCallback();
        done();
      };
      driver.start(callback);
    });

    it("write the value", function(done) {
      var pub = rosnodejs.getNodeHandle().advertise("/pwmWrite_direct-pin",
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });

      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.Int32();
      msg.data = 1;
      pub.publish(msg);

      setTimeout(() => {
        expect(driver.connection.pwmWrite).to.be.calledWith(22, 1);
        expect(driver.connection.pwmWrite).to.be.calledOnce;
        done();
      }, 200);
    });

    afterEach(function() {
      driver.halt(stub());
    });
  });

  describe("write servo value", function() {
    var spyCallback = spy();
    beforeEach(function(done) {
      var callback = function() {
        spyCallback();
        done();
      };
      driver.start(callback);
    });

    it("write the value", function(done) {
      var pub = rosnodejs.getNodeHandle().advertise("/servoWrite_direct-pin",
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });

      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.Int32();
      msg.data = 1;
      pub.publish(msg);

      setTimeout(() => {
        expect(driver.connection.servoWrite).to.be.calledWith(22, 1);
        expect(driver.connection.servoWrite).to.be.calledOnce;
        done();
      }, 200);
    });

    afterEach(function() {
      driver.halt(stub());
    });
  });
});
