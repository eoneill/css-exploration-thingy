"use strict";

var HandlebarsNamespaceRewriter = require("../index");
var Handlebars = require("handlebars");

var testutils = require("./testutils");
var merge = require("lodash.merge");
var assert = require("assert");

describe("Fixtures", function() {
  var fixtures = testutils.getFixtures();
  fixtures.forEach(function(fixture) {
    ((fixture.skip) ? it.skip : it)(fixture.name, function(done) {
      function doIt() {
        return new HandlebarsNamespaceRewriter(merge({
          namespace: fixture.name,
          hbs: Handlebars.parse(fixture.hbs || ""),
          css: (fixture.css || "")
        }, fixture.options));
      }

      if (fixture.error) {
        assert.throws(doIt, fixture.error);
      }
      else {
        var result = doIt();

        if (fixture.expectedCSS) {
          testutils.assertText(result.css, fixture.expectedCSS);
        }

        if (fixture.expectedHTML) {
          var template = new Handlebars.compile(result.hbs, {});
          var html = template(fixture.data || {});
          testutils.assertText(html, fixture.expectedHTML);
        }
      }
      done();
    });
  });
});
