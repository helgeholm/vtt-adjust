var read = require('./readSegments');
var write = require('./writeSegments');
var vtt = require('fs').readFileSync('test/data/elephant.vtt').toString();

var data = read(vtt);
var vtt2 = write(data);

console.log(vtt2);
