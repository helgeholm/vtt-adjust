var assert = require('assert');

var api = require('../index');

describe("vtt-adjust API", function() {
  var testData = "WEBVTT\n\n00:00:10.000 --> 00:00:15.000\nHello\n\n00:00:20.000 --> 00:00:25.000\nHallo\n\n00:00:30.000 --> 00:00:35.000\nHullo";

  it("exists", function() {
    assert.ok(api);
  });

  it("is callable as a constructor", function() {
    var adjuster = api(testData);
    assert.ok(adjuster);
  });

  it("can yield data via toString()", function() {
    var adjuster = api(testData);
    assert.equal(testData, adjuster.toString());
  });

  it("can list cues", function() {
    var adjuster = api(testData);
    assert.ok(adjuster.cues);
    assert.equal(adjuster.cues.length, 3);
    assert.equal(adjuster.cues[1].start, 20000);
    assert.equal(adjuster.cues[1].text, "Hallo");
  });

  it("can move cues", function() {
    var adjuster = api(testData);
    adjuster.move(adjuster.cues[0], 0);
    var output = adjuster.toString();
    assert.equal(
      output,
      "WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nHello\n\n00:00:10.000 --> 00:00:15.000\nHallo\n\n00:00:20.000 --> 00:00:25.000\nHullo"
    );
  });

  it("can move and scale cues", function() {
    var adjuster = api(testData);
    adjuster.moveAndScale(adjuster.cues[0], 0, adjuster.cues[2], 30000);
    var output = adjuster.toString();
    assert.equal(
      output,
      "WEBVTT\n\n00:00:00.000 --> 00:00:07.500\nHello\n\n00:00:15.000 --> 00:00:22.500\nHallo\n\n00:00:30.000 --> 00:00:37.500\nHullo"
    );
  });

  it("can move and move back with same adjuster instance", function() {
    var adjuster = api(testData);
    adjuster.move(adjuster.cues[0], 20000);
    adjuster.move(adjuster.cues[0], 10000);
    assert.equal(adjuster.toString(), testData);
  });

  it("can scale and scale back with same adjuster instance", function() {
    var adjuster = api(testData);
    adjuster.moveAndScale(adjuster.cues[0], 10000, adjuster.cues[1], 40000);
    adjuster.moveAndScale(adjuster.cues[0], 10000, adjuster.cues[1], 20000);
    assert.equal(adjuster.toString(), testData);
  });

  it("can move-scale and move-scale back with same adjuster instance", function() {
    var adjuster = api(testData);
    adjuster.moveAndScale(adjuster.cues[0], 20000, adjuster.cues[1], 40000);
    adjuster.moveAndScale(adjuster.cues[0], 10000, adjuster.cues[1], 20000);
    assert.equal(adjuster.toString(), testData);
  });
});
