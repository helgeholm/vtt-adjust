var adjust = require('../adjust');
var read = require('../readSegments');
var write = require('../writeSegments');

var fs = require('fs');
var assert = require('assert');

describe("move and scale", function() {
  it("changes nothing if references are unchanged", function() {
    var input = fs.readFileSync("test/data/simple.vtt").toString();
    var data = read(input);
    adjust.move(data.cues, data.cues[0], data.cues[1]);
    assert.equal(write(data), input);
  });
});
