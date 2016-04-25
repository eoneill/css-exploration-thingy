var css = require("css");
var cssEscape = require("css.escape");
var uuid = require("uuid");
var merge = require("lodash.merge");

var CSSNamespaceRewriter = require("./CSSNamespaceRewriter");
var CSSPruner = require("./CSSPruner");

function CSSModule(options) {
  this.usedClassNames = new Set();

  this.options = merge({
    prune: true,
    css: ""
  }, options);

  this.ast = css.parse(options.css.toString());

  var rewriter = new CSSNamespaceRewriter(this.options);
  rewriter.accept(this.ast);

  this.classNames = rewriter.classNames;

  if (this.options.usedClassNames) {
    this.options.usedClassNames.forEach(function(className) {
      this.useClassName(className);
    }.bind(this));
    delete this.options.usedClassNames;
  }
}

CSSModule.prototype.getClassName = function(className) {
  var registeredClassName = this.classNames.get(className);
  if (!registeredClassName) {
    throw new Error("`" + className + "` does not exist in CSS");
  }
  return registeredClassName.adjustedClassName;
};

CSSModule.prototype.useClassName = function(className) {
  this.classNames.use(className);
};

CSSModule.prototype.getUsedCSS = function() {
  if (this.options.prune) {
    var pruner = new CSSPruner({
      usedClassNames: this.classNames.getUsed()
    });
    pruner.accept(this.ast);
    pruner.tidy(this.ast);
  }
  return css.stringify(this.ast);
};

module.exports = CSSModule;
