var adjust = require('../adjust');
var read = require('../readSegments');
var write = require('../writeSegments');

var fs = require('fs');
var assert = require('assert');

describe("move and scale", function() {
  it("changes nothing if references are unchanged", function() {
    var input = fs.readFileSync("test/data/simple.vtt").toString();
    var data = read(input);
    adjust.moveAndScale(data.cues, data.cues[0], data.cues[1]);
    assert.equal(write(data), input);
  });

  it("can scale and not move", function() {
    var input = fs.readFileSync("test/data/simpler.vtt").toString();
    var output = fs.readFileSync("test/data/simpler-scaleup.vtt").toString();
    var data = read(input);
    var cue3 = JSON.parse(JSON.stringify(data.cues[2]));
    cue3.start += 20000;
    adjust.moveAndScale(data.cues, data.cues[0], cue3);
    assert.equal(write(data), output);
  });
});
