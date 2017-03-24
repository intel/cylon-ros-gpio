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
