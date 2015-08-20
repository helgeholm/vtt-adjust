var adjust = require('../lib/adjust');
var read = require('../lib/readSegments');
var write = require('../lib/writeSegments');

var fs = require('fs');
var assert = require('assert');

describe("move", function() {
  it("moves nothing if reference is unchanged", function() {
    var input = fs.readFileSync("test/data/simple.vtt").toString();
    var data = read(input);
    adjust.move(data.cues, data.cues[0]);
    assert.equal(write(data), input);
  });

  it("can move with first cue as ref", function() {
    var input = fs.readFileSync("test/data/simple.vtt").toString();
    var output = fs.readFileSync("test/data/simple+5s.vtt").toString();
    var data = read(input);
    var cue1 = JSON.parse(JSON.stringify(data.cues[0]));
    cue1.start += 5000;
    adjust.move(data.cues, cue1);
    assert.equal(write(data), output);
  });

  it("can move with last cue as ref", function() {
    var input = fs.readFileSync("test/data/simple.vtt").toString();
    var output = fs.readFileSync("test/data/simple+5s.vtt").toString();
    var data = read(input);
    var cue1 = JSON.parse(JSON.stringify(data.cues[2]));
    cue1.start += 5000;
    adjust.move(data.cues, cue1);
    assert.equal(write(data), output);
  });

  it("can move backwards", function() {
    var input = fs.readFileSync("test/data/simple+5s.vtt").toString();
    var output = fs.readFileSync("test/data/simple.vtt").toString();
    var data = read(input);
    var cue1 = JSON.parse(JSON.stringify(data.cues[0]));
    cue1.start -= 5000;
    adjust.move(data.cues, cue1);
    assert.equal(write(data), output);
  });
});
