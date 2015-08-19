var assert = require('assert');
var read = require('../readSegments');
var write = require('../writeSegments');

describe("read and write", function() {
  it("writes normalized read data unchanged", function() {
    var vtt = "\ufeffWEBVTT\n\n1\n00:00:15.000 --> 00:00:18.000 align:start\n<v Doop>Hello there...</v>\n\nNOTE testing notes\n\n00:00:18.167 --> 00:00:20.083\nHello!";
    var vttOut = write(read(vtt));
    assert.equal(vtt, vttOut);
  });
});
