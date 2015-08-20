var adjust = require('../adjust');
var read = require('../readSegments');
var write = require('../writeSegments');

var fs = require('fs');
var assert = require('assert');
var randy = require('randy');

// Uncomment for determinism:
// randy.setState({"seed":[1086990994,1028312256,-269792373,-1989843090,-528923669,-589875010,1470268014,132703380,-615785460,-767938092,-209901597,358900416,-104513501,-242605169,75406930,1517592762,-8173077,1678948693,-1666915941,-9491474,-2048472118,1336790548,-270557609,-57483379,-1604043572,1313548012,170064268,1539635231,709334312,-1372375320,1965458340,-1049887153],"idx":1});

var iterations = 100;

function cp(obj) { return JSON.parse(JSON.stringify(obj)); }

describe("randomized move", function() {
  var input = fs.readFileSync("test/data/biggish.vtt").toString();

  it("can move a random cue a random amount", function() {
    this.slow(500);
    for (var i=0; i < iterations; i++) {
      var cueIdx = randy.randInt(3);
      var moveDist = randy.randInt(1, 10000);
      var data = read(input);
      var origCues = data.cues.map(cp);
      var movedCue = cp(origCues[cueIdx]);
      movedCue.start += moveDist;
      adjust.move(data.cues, movedCue);
      var data2 = read(write(data));
      for (var j=0; j < data2.cues.length; j++) {
        assert.equal(data2.cues[j].start, origCues[j].start + moveDist);
        assert.equal(data2.cues[j].end, origCues[j].end + moveDist);
      }
    }
  });

  it("can scale a random cue by a random amount", function() {
    this.slow(500);
    for (var i=0; i < iterations; i++) {
      var sCueIdx = randy.randInt(1, 3);
      var scaleDist = randy.randInt(1, 10000);
      var data = read(input);
      var origCues = data.cues.map(cp);
      var scaledCue = cp(origCues[sCueIdx]);
      scaledCue.start += scaleDist;
      adjust.moveAndScale(data.cues, origCues[0], scaledCue);
      var data2 = read(write(data));
      assert.equal(data2.cues[0].start, origCues[0].start);
      assert.equal(data2.cues[0].end, origCues[0].end);
      assert.equal(data2.cues[sCueIdx].start,
                   origCues[sCueIdx].start + scaleDist);
      assert.equal(data2.cues[sCueIdx].end,
                   origCues[sCueIdx].end + scaleDist);
    }
  });
});
