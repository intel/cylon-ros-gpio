# Cylon ROS Driver For GPIO

Cylon.js (http://cylonjs.com) is a JavaScript framework for robotics, physical computing, and the Internet of Things (IoT).

This module provides drivers for General Purpose Input/Output (GPIO) devices (https://en.wikipedia.org/wiki/General_Purpose_Input/Output) in ROS (http://www.ros.org/). Thus by pub/sub a topic in ROS, you can control the GPIO devices by creating the according drivers in Cylon.JS.

It must be used along with an adaptor module such as `intel-iot` (https://github.com/hybridgroup/cylon-intel-iot) that supports the needed interfaces for GPIO devices.

[![Build Status](https://travis-ci.org/minggangw/cylon-ros-gpio.svg?branch=master)](http://travis-ci.org/minggangw/cylon-ros-gpio) [![Code Climate](https://codeclimate.com/github/minggangw/cylon-ros-gpio/badges/gpa.svg)](https://codeclimate.com/github/minggangw/cylon-ros-gpio) [![Test Coverage](https://codeclimate.com/github/minggangw/cylon-ros-gpio/badges/coverage.svg)](https://codeclimate.com/github/minggangw/cylon-ros-gpio/coverage)

## Getting Started
Note you must install whichever adaptor you want to use, such as: `npm install cylon-intel-iot`. Also, you have to confirm below:
  * You have to become a superuser when executing node in order to WRITE in path `/sys/class/gpio`
  * Make sure you have all necessary ROS environment variables for the superuser. Often, you can source the .bash file like:
  ```
    $ source /opt/ros/indigo/setup.bash
  ```

## Example

   In ROS, create a node which will publish a topic, named `toggle_led`, every one second.

```javascript
var rosnodejs = require('rosnodejs');

rosnodejs.initNode('/my_node', {
  messages: ['std_msgs/String']
}).then((rosNode) => {
  var std_msgs = rosnodejs.require('std_msgs').msg;
  var msg = new std_msgs.String();
  var pub = rosNode.advertise('/toggle_led','std_msgs/String', {
    queueSize: 1,
    latching: true,
    throttleMs: 9
  });

  setInterval(() => {
    msg.data = 'toggle LED';
    pub.publish(msg);
  }, 1000);
});
```

  On the Clyon side, create a LED device which will use the driver `ros-led` in module `cylon-ros-gpio` and the adaptor `intel-iot` is being used.

```javascript
var Cylon = require('cylon');

// Initialize the robot
Cylon.robot({
  connections: {
    minnowboard: { adaptor: 'intel-iot' }
  },

  devices: {
    led: { driver: 'ros-led', module: 'cylon-ros-gpio', pin: 25 },
  },

  work: function(my) {
  }
}).start();
```
