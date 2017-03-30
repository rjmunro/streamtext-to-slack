#!/usr/bin/env node
const fetch = require('node-fetch');

var SLACK_HOOK_URL = process.env.SLACK_HOOK_URL;

var STREAMTEXT_BASE = "http://streamtext.net/text-data.ashx?event=" + process.env.STREAMTEXT_EVENT;
// Standard viewer URL: http://streamtext.net/player?event=[event]

var last = 0;
var sent = [];
var outstanding = "";
var sendQueue = Promise.resolve();

function processData(data) {
  console.log('data', data);
  last = data.lastPosition;
  outstanding += join(data);
  outstanding = removeBackspaces(outstanding);
  console.log('outstanding', outstanding);

  var splitText = outstanding.split('.');

  while (splitText.length > 1) {
    console.log('splitText', splitText);
    var sentence = splitText.shift().trim() + '.'
    sent.push(sentence);
    console.log('sent', sent);
    sendQueue = sendQueue.then(function () {
      send(sentence);
    });
  }

  outstanding = splitText[0];

  setTimeout(function () {
    fetch(STREAMTEXT_BASE + '&last=' + last)
    .then(function (res) {
      return res.json()
    })
    .then(processData)
  }, 500);
}

data = require('./test2.json');

function join(data) {
  return data.i.map(i => i.format == 'basic' && decodeURIComponent(i.d).replace(/.\cb/, '') || '::: Unknown format:' + JSON.stringify(i) + ':::').join('');
}

function removeBackspaces(input) {
  while (match = /\x08+/.exec(input)) {
    if (match[0].length > match.index) {
      // We've wound back before the beginning
      console.log("Doh");
    }
    input = input.substr(0, match.index - match[0].length) + input.substr(match.index + match.length);
  }
  return input;
}

function send(text) {
  console.log("Sending", text)
  return fetch(SLACK_HOOK_URL, {method: 'POST', body: {text : text}});
}

fetch(STREAMTEXT_BASE)
.then(function (res) {
  return res.json()
})
.then(processData)
.catch(function (e) {
  process.nextTick(function () {
    throw e;
  })
});
