var read = require('./lib/readSegments');
var write = require('./lib/writeSegments');
var adjust = require('./lib/adjust');

function cp(obj) { return JSON.parse(JSON.stringify(obj)); }

module.exports = function readString(vtt) {
  var data = read(vtt);

  // Representation of cues that will be exposed via API.
  var visibleCues = calculateVisibleCues();

  function calculateVisibleCues() {
    return data.cues.map(function(cue, idx) {
      return {
        id: idx,
        start: cue.start,
        end: cue.end,
        text: cue.rest.join('\n')
      };
    });
  }

  function move(cueId, newStartMs) {
    if (typeof cueId == 'object')
      cueId = cueId.id;
    var anchor = cp(data.cues[cueId]);
    anchor.start = newStartMs;
    adjust.move(data.cues, anchor);
    visibleCues = calculateVisibleCues();
  }
  
  function moveAndScale(cueId1, newStartMs1, cueId2, newStartMs2) {
    if (typeof cueId1 == 'object')
      cueId1 = cueId1.id;
    if (typeof cueId2 == 'object')
      cueId2 = cueId2.id;
    var anchor = cp(data.cues[cueId1]);
    anchor.start = newStartMs1;
    var scaleRef = cp(data.cues[cueId2]);
    scaleRef.start = newStartMs2;
    adjust.moveAndScale(data.cues, anchor, scaleRef);
    visibleCues = calculateVisibleCues();
  }

  function toString() {
    return write(data);
  }
  
  var adjuster = {
    cues: visibleCues,
    move: move,
    moveAndScale: moveAndScale,
    toString: toString
  };

  return adjuster;
}
