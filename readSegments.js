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
