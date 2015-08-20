var read = require('./lib/readSegments');
var write = require('./lib/writeSegments');
var adjust = require('./lib/adjust');

function cp(obj) { return JSON.parse(JSON.stringify(obj)); }

module.exports = function readString(vtt) {
  var data = read(vtt);
  var visibleCues = data.cues.map(function(cue, idx) {
    return {
      id: idx,
      start: cue.start,
      text: cue.rest.join('\n')
    };
  });

  function setObjectSpent() {
    adjuster.move = spentPlaceholder;
    adjuster.moveAndScale = spentPlaceholder;
  }

  function spentPlaceholder() {
    throw new Error('Adjustment already applied.');
  }

  function move(cueId, newStartMs) {
    if (typeof cueId == 'object')
      cueId = cueId.id;
    setObjectSpent();
    var anchor = cp(data.cues[cueId]);
    anchor.start = newStartMs;
    adjust.move(data.cues, anchor);
  }
  
  function moveAndScale(cueId1, newStartMs1, cueId2, newStartMs2) {
    if (typeof cueId1 == 'object')
      cueId1 = cueId1.id;
    if (typeof cueId2 == 'object')
      cueId2 = cueId2.id;
    setObjectSpent();
    var anchor = cp(data.cues[cueId1]);
    anchor.start = newStartMs1;
    var scaleRef = cp(data.cues[cueId2]);
    scaleRef.start = newStartMs2;
    adjust.moveAndScale(data.cues, anchor, scaleRef);
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
