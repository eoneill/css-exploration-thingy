var HandlebarsClassNamesScanner = require("./HandlebarsClassNamesScanner");
var CSSModule = require("./CSSModule");
var merge = require("lodash.merge");

function HandlebarsNamespaceRewriter(options) {
  if (!(options && options.hbs)) {
    return;
  }

  this.hbs = options.hbs;

  var cssModule = new CSSModule(merge({
    adjustName: function(name, namespace, type) {
      var hash = hashName(namespace + "$$" + name + "$$" + type);
      // prefix all classNames with an `a` so they don't start with a digit
      return "a" + hash + (options.isProd ? "" : "__" + name);
    }
  }, options));

  var scanner = new HandlebarsClassNamesScanner(this.hbs, cssModule, options);

  this.css = cssModule.getUsedCSS();
  this.classNames = cssModule.classNames.getUsedMapping();
}

function hashName(str) {
  /**/
  var crc = require("crc");
  return crc.crc32(str).toString(36);
  /**\/
  var md5 = require("md5");
  return md5(str).slice(-6);
  /**/
}

module.exports = HandlebarsNamespaceRewriter;
