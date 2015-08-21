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
