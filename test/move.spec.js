var adjust = require('../adjust');
var read = require('../readSegments');
var write = require('../writeSegments');

var fs = require('fs');
var assert = require('assert');

describe("move", function() {
  it("moves nothing if reference is unchanged", function() {
    var input = fs.readFileSync("test/data/simple.vtt").toString();
    var data = read(input);
    adjust.move(data.cues, data.cues[0]);
    assert.equal(write(data), input);
  });
});
