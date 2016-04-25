"use strict";

var fs = require("fs");
var path = require("path");
var glob = require("glob");
var merge = require("lodash.merge");
var assert = require("assert");

function getFixtures() {
  var fixtureDir = path.join(__dirname, "fixtures");
  var fixtures = glob.sync(path.join(fixtureDir, "**", "*.{hbs,css,html,json,js}")).reduce(function(fixtures, file) {
    var types = {
      expectedCSS: /\.?expected\.css$/,
      expectedHTML: /\.?expected\.html$/,
      hbs: /\.?source\.hbs$/,
      css: /\.?source\.css$/,
      json: /(?:config)?\.json$/,
      js: /(?:config)?\.js$/
    };

    Object.keys(types).some(function(type) {
      if (types[type].test(file)) {
        var name = path.basename(file).replace(types[type], "");
        if (!name) {
          name = path.basename(path.dirname(file));
        }
        var fixture = fixtures[name] = fixtures[name] || {
          name: name
        };
        switch (type) {
        case "js":
        case "json":
          merge(fixture, require(file));
          break;
        default:
          fixture[type] = fs.readFileSync(file).toString();
          break;
        }
        return true;
      }
    });
    return fixtures;
  }, {});

  return Object.keys(fixtures).map(function(name) {
    var fixture = fixtures[name];
    if (fixture.error) {
      if (typeof fixture.error === "string") {
        fixture.error = new RegExp(fixture.error);
      }
      else if (fixture.error === true) {
        fixture.error = Error;
      }
    }
    return fixture;
  });
}

function assertText(actual, expected) {
  expected = normalizeText(expected);
  actual = normalizeText(actual);

  expected.forEach(function(line, i) {
    assert.equal(actual[i], line);
  });

  assert.equal(actual.length, expected.length);
}

function normalizeText(text) {
  return (text || "").trim().split(/\s*\n\s*/);
}

module.exports = {
  getFixtures: getFixtures,
  assertText: assertText
};
