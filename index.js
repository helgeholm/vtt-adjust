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
    var anchor = data.cues[cueId];
    adjust.move(data.cues, anchor);
  }
  
  function moveAndScale(cueId1, cueId2, newStartMs) {
    if (typeof cueId1 == 'object')
      cueId1 = cueId1.id;
    if (typeof cueId2 == 'object')
      cueId2 = cueId2.id;
    setObjectSpent();
    var anchor = data.cues[cueId1];
    var scaleRef = data.cues[cueId2];
    adjust.move(data.cues, anchor, scaleRef);
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
