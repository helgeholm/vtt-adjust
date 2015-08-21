(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./lib/adjust":2,"./lib/readSegments":3,"./lib/writeSegments":4}],2:[function(require,module,exports){
function move(cues, referenceCue) {
  var oldCue = null;
  cues.forEach(function(cue) {
    if (cue.index == referenceCue.index)
      oldCue = cue;
  });
  if (oldCue == null)
    throw new Error('Reference cue does not correspond to existing cue.');

  var delta = referenceCue.start - oldCue.start;

  cues.forEach(function(cue) {
    cue.start += delta;
    cue.end += delta;
  });
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
  cues.forEach(function(cue) {
    var diff = moveDiff + (cue.start - oldCue1Start) * scaleMsPerMs;
    var cueLengthDiff = (cue.end - cue.start) * scaleMsPerMs;
    cue.start += diff;
    cue.end += diff + cueLengthDiff;
  });
}

module.exports = {
  move: move,
  moveAndScale: moveAndScale
}

},{}],3:[function(require,module,exports){
function extractSegments(vttString) {
  var segments = vttString.replace('\r\n', '\n').replace('\r', '\n').split('\n\n');
  var cues = [];
  for (var i=0; i < segments.length; i++) {
    var cue = {
      index: i,
      id: ''
    };
    var segment = segments[i];
    var lines = segment.split('\n');
    var timestampsRe = /^(\d*:?\d\d:\d\d\.\d\d\d)\s-->\s(\d*:?\d\d:\d\d\.\d\d\d)\s?(.*)$/;
    var timestamps = timestampsRe.exec(lines[0]);

    if (!timestamps) {
      cue.id = lines.shift();
      timestamps = timestampsRe.exec(lines[0]);
    }

    lines.shift();

    if (!timestamps)
      continue;
    
    cue.start = parseTimestamp(timestamps[1]);
    cue.end = parseTimestamp(timestamps[2]);
    cue.settings = timestamps[3];
    cue.rest = lines;

    cues.push(cue);
  }

  return {
    cues: cues,
    segments: segments
  }
}

function parseTimestamp(timestamp) {
  var decimalSplit = timestamp.split('.');
  var hms = decimalSplit[0];
  var ms = parseInt(decimalSplit[1], 10);
  var hmsSplit = hms.split(':');
  var h=0, m, s;
  if (hmsSplit.length == 3) {
    h = parseInt(hmsSplit[0], 10);
    m = parseInt(hmsSplit[1], 10);
    s = parseInt(hmsSplit[2], 10);
  } else {
    m = parseInt(hmsSplit[0], 10);
    s = parseInt(hmsSplit[1], 10);
  }

  return ms + s*1000 + m*1000*60 + h*1000*60*60;
}

module.exports = extractSegments;

},{}],4:[function(require,module,exports){
function timestampToStr(timestamp) {
  function toPadString(n, minWidth) {
    minWidth = minWidth | 2;
    var val = n.toString();
    while (val.length < minWidth)
      val = "0" + val;
    return val;
  }

  timestamp = timestamp >> 0;
  
  var S = 1000;
  var M = S * 60;
  var H = M * 60;
  var h = Math.floor(timestamp / H);
  timestamp %= H;
  var m = Math.floor(timestamp / M);
  timestamp %= M;
  var s = Math.floor(timestamp / S);
  timestamp %= S;
  var ms = timestamp;

  return toPadString(h) + ':' + toPadString(m) + ':' + toPadString(s) + '.' + toPadString(ms, 3);
}

function cueToString(cue) {
  var str = '';
  if (cue.id.length)
    str += cue.id + '\n';
  str += timestampToStr(cue.start)  + ' --> ' + timestampToStr(cue.end);
  if (cue.settings.length)
    str += ' ' + cue.settings;
  str += '\n';
  str += cue.rest.join('\n');

  return str;
}

function write(data) {
  data.cues.forEach(function(cue) {
    data.segments[cue.index] = cueToString(cue);
  });
  return data.segments.join('\n\n');
}

module.exports = write;

},{}],5:[function(require,module,exports){
window.vttAdjust = require('./index');
window.vttAdjust.toString = function() {
  return [
    "Usage: vttAdjust(<VTT file as string>)",
    "",
    "// Example, move all cues forward by 2 seconds:",
    "var adjuster = vttAdjust('WEBVTT\\n\\n00:00:10.000 --> 00:00:15.000\\nHello\\n\\n00:00:20.000 --> 00:00:25.000\\nHallo\\n\\n00:00:30.000 --> 00:00:35.000\\nHullo');",
    "",
    "console.log(JSON.stringify(adjuster.cues));",
    "/* Output: -------------------",
    '[{"id":0,"start":10000,"text":"Hello"},{"id":1,"start":20000,"text":"Hallo"},{"id":2,"start":30000,"text":"Hullo"}]',
    "                            */",
    "",
    "adjuster.move(adjuster.cues[0], adjuster.cues[0].start + 2000);",
    "",
    "console.log(adjuster.toString());",
    "/* Output: -------------------",
    "WEBVTT",
    "",
    "00:00:12.000 --> 00:00:17.000",
    "Hello",
    "",
    "00:00:22.000 --> 00:00:27.000",
    "Hallo",
    "",
    "00:00:32.000 --> 00:00:37.000",
    "Hullo",
    "                            */"
  ].join('\n');
}

},{"./index":1}]},{},[5]);
