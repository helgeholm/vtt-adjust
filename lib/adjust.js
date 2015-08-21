function cp(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function move(cues, referenceCue) {
  var oldCue = null;
  cues.forEach(function(cue) {
    if (cue.index == referenceCue.index)
      oldCue = cue;
  });
  if (oldCue == null)
    throw new Error('Reference cue does not correspond to existing cue.');

  var delta = referenceCue.start - oldCue.start;

  var newCues = cues.map(function(_cue) {
    var cue = cp(_cue);
    cue.start += delta;
    cue.end += delta;
    if (cue.start < 0)
      throw new Error('Invalid move! One or more cues get a negative start time.');
    return cue;
  });

  // Operation successful, replace existing cue data.
  newCues.forEach(function(cue, idx) { cues[idx] = cue; });
}

function moveAndScale(cues, refCue1, refCue2) {
  if (refCue1.index > refCue2.index) {
    var swap = refCue1;
    refCue1 = refCue2;
    refCue2 = swap;
  }
  if (refCue1.index == refCue2.index)
    throw new Error('Reference cues point to same cue.');

  var oldCue1 = null, oldCue2 = null;
  cues.forEach(function(cue) {
    if (cue.index == refCue1.index)
      oldCue1 = cue;
    if (cue.index == refCue2.index)
      oldCue2 = cue;
  });
  if (oldCue1 == null)
    throw new Error('Reference cue 1 does not correspond to existing cue.');
  if (oldCue2 == null)
    throw new Error('Reference cue 2 does not correspond to existing cue.');
  
  var moveDiff = refCue1.start - oldCue1.start;
  var cue2StartMoved = oldCue2.start + moveDiff;
  var scaleDiff = refCue2.start - cue2StartMoved;
  var scaleMsPerMs = scaleDiff / (oldCue2.start - oldCue1.start);

  var oldCue1Start = oldCue1.start;
  var newCues = cues.map(function(_cue) {
    var cue = cp(_cue);
    var diff = moveDiff + (cue.start - oldCue1Start) * scaleMsPerMs;
    var cueLengthDiff = (cue.end - cue.start) * scaleMsPerMs;
    cue.start += diff;
    cue.end += diff + cueLengthDiff;
    if (cue.start < 0)
      throw new Error('Invalid move! One or more cues get a negative start time.');
    return cue;
  });

  // Operation successful, replace existing cue data.
  newCues.forEach(function(cue, idx) { cues[idx] = cue; });
}

module.exports = {
  move: move,
  moveAndScale: moveAndScale
}
