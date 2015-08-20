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
function range(n) {
  var r=[];
  for (var i=0; i < n; r.push(i++));
  return r;
}

describe("randomized move", function() {
  var input = fs.readFileSync("test/data/biggish.vtt").toString();
  var data = read(input);
  var origCues;

  beforeEach(function() {
      origCues = data.cues.map(cp);
  });

  it("can move a random cue a random amount", function() {
    this.slow(500);
    for (var i=0; i < iterations; i++) {
      var moveDist = randy.randInt(1, 10000);
      var movedCue = cp(randy.choice(origCues));
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
      var refCues = randy.sample(range(origCues.length), 2);
      var scaleDist = randy.randInt(1, 10000);
      var moveCue = cp(origCues[refCues[0]]);
      var scaleCue = cp(origCues[refCues[1]]);
      scaleCue.start += scaleDist;
      adjust.moveAndScale(data.cues, moveCue, scaleCue);

      // Truncate any timestamps that we've moved below 0, since that's
      // expected to happen, and they're outside the test scope.
      data.cues.forEach(function(cue) {
        if (cue.start < 0) cue.start = 0;
        if (cue.end < 0) cue.end = 0;
      });

      var data2 = read(write(data));

      assert.equal(data2.cues[refCues[0]].start,
                   origCues[refCues[0]].start,
                   'anchor start');
      assert.equal(data2.cues[refCues[0]].end,
                   origCues[refCues[0]].end,
                   'anchor end');
      assert.equal(data2.cues[refCues[1]].start,
                   origCues[refCues[1]].start + scaleDist,
                   'scale start');
      assert.equal(data2.cues[refCues[1]].end,
                   origCues[refCues[1]].end + scaleDist,
                   'scale end');
    }
  });
});
