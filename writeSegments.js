function timestampToStr(timestamp) {
  function toPadString(n, minWidth) {
    minWidth = minWidth | 2;
    var val = n.toString();
    while (val.length < minWidth)
      val = "0" + val;
    return val;
  }
  
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
