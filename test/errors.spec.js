var assert = require('assert');

var api = require('../index');

describe("vtt-adjust API sanity handling", function() {
  var testData = "WEBVTT\n\n00:00:10.000 --> 00:00:15.000\nHello\n\n00:00:20.000 --> 00:00:25.000\nHallo\n\n00:00:30.000 --> 00:00:35.000\nHullo";

  it("rejects move() that would bring cues into negatives", function() {
    var adjuster = api(testData);
    assert.throws(function() {
      adjuster.move(adjuster.cues[1], 0);
    }, /negative/);
  });

  it("rejects moveAndScale() that would bring cues into negatives", function() {
    var adjuster = api(testData);
    assert.throws(function() {
      adjuster.move(adjuster.cues[1], 20000, adjuster.cues[2], 600000);
    }, /negative/);
  });

  it("rejects moveAndScale() with same cue used as both refs", function() {
    var adjuster = api(testData);
    assert.throws(function() {
      adjuster.move(adjuster.cues[1], 20000, adjuster.cues[1], 600000);
    }, /same/);
  });
});
