#!/usr/bin/env node
'use strict';
const fetch = require('node-fetch');

var HOOK_URLS = [
  process.env.SLACK_HOOK_URL
];

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

  var splitText = outstanding.split('. ');

  while (splitText.length > 1) {
    console.log('splitText', splitText);
    let sentence = splitText.shift().trim() + '.'
    sent.push(sentence);
    console.log('sent', sent);
    sendQueue = sendQueue.then(function () {
      console.log('sending', sentence)
      return send(sentence);
    }).catch(function (e) {
      process.nextTick(function () {
        throw e;
      })
    });
  }

  outstanding = splitText[0];

  setTimeout(function () {
    fetch(STREAMTEXT_BASE + '&last=' + last)
    .then(function (res) {
      return res.json()
    })
    .then(processData)
  }, 800);
}

function join(data) {
  return data.i.map(i => i.format == 'basic' && decodeURIComponent(i.d).replace(/.\cb/, '') || '::: Unknown format:' + JSON.stringify(i) + ':::').join('');
}

function removeBackspaces(input) {
  let match;
  while (match = /\x08+/.exec(input)) {
    let removeLength = match[0].length;
    if (removeLength > match.index) {
      // We've wound back before the beginning
      console.log("Wound back too far!");
    }
    input = input.substr(0, match.index - removeLength) + input.substr(match.index + removeLength);
  }
  return input;
}

function send(text) {
  console.log("Sending", text)
  return Promise.all(HOOK_URLS.map(function (url) {
    return fetch(url, {method: 'POST', body: JSON.stringify({text: text, })});
  }));
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
