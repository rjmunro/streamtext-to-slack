#!/usr/bin/env node

SLACK_HOOK_URL = process.env.SLACK_HOOK_URL;

// Demo
STREAMTEXT_BASE = "http://streamtext.net/text-data.ashx?event=" + process.env.STREAMTEXT_EVENT;
// Standard viewer URL: http://streamtext.net/player?event=[event]

function getData() {

}

data = require('./test2.json');

function join(data) {
  return data.i.map(i => i.format == 'basic' && decodeURIComponent(i.d).replace(/.\cb/, '') || '::: Unknown format:' + JSON.stringify(i) + ':::').join('');
}

function removeBackspaces(joined) {
  while (match = /\x08+/.exec(joined)) {
    if (match[0].length > match.index) {
      // We've wound back before the beginning
    }
    joined = joined.substr(0, match.index - match[0].length) + joined.substr(match.index + match.length);
  }
  return joined;
}
