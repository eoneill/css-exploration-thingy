var Visitor = require("handlebars").Visitor;
var merge = require("lodash.merge");

function HandlebarsClassNamesScanner(ast, cssModule, options) {
  this.cssModule = cssModule;
  this.mutating = true;
  this.options = merge({
    pathName: "css"
  }, options);
  this.accept(ast);
}

HandlebarsClassNamesScanner.prototype = new Visitor();

// matches {{css.foo}}
HandlebarsClassNamesScanner.prototype.MustacheStatement = function(node) {
  if (isCSSExpression.call(this, node)) {
    // get the className
    var className = node.path.parts.pop();
    if (node.path.parts[1] !== "global") {
      // mark the className as used
      this.cssModule.useClassName(className);
      // and adjust the className
      className = this.cssModule.getClassName(className);
    }
    // create a new content node
    var content = {
      type: "ContentStatement",
      value: className
    };
    Visitor.prototype.ContentStatement.call(this, content);
    // return the augmented node
    return content;
  }
  else {
    Visitor.prototype.MustacheStatement.call(this, node);
  }
};

// matches {{! css.classNameBindings = ... }}
HandlebarsClassNamesScanner.prototype.CommentStatement = function(node) {
  var rClassNameBindings = new RegExp(this.options.pathName + "\\.classNameBindings\\s*[=:]\\s*(.+)\\s*");
  var match = node.value.match(rClassNameBindings);

  if (match) {
    match[1].split(",").forEach(function(className) {
      this.cssModule.useClassName(className.trim());
    }.bind(this));
  }
  Visitor.prototype.CommentStatement.call(this, node);
};

function isCSSExpression(node) {
  var path = node.path;
  return path && path.type === "PathExpression" && path.parts && path.parts[0] === this.options.pathName;
}

function getCommentClassNameBindings(node) {

}

module.exports = HandlebarsClassNamesScanner;
