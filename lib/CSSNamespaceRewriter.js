var CSSVisitor = require("./CSSVisitor");
var utils = require("./utils");
var merge = require("lodash.merge");
var uuid = require("uuid");

var ClassNameRegistry = require("./ClassNameRegistry");

var rClassName = /\.([A-z-_][\w-]*)([\s\r\n]*(?=[\.:]\{)?)/g;
var rGlobalSelector = /:global\(([^)]+)\)/g;
var rGlobalPlaceholder = /\{(\d+)\}/g;

function CSSNamespaceRewriter(options) {
  this.options = merge({
    namespace: uuid.v4(),
    adjustName: function adjustName(name, namespace) {
      return namespace + "__" + name;
    },
  }, options);

  this.classNames = new ClassNameRegistry();
  this.keyframeNames = {};
  this.fontFamilyNames = {};
}

CSSNamespaceRewriter.prototype = new CSSVisitor();

CSSNamespaceRewriter.prototype.Document = function(node) {
  if (node.document === ":local") {
    node.meta = merge(node.meta, {
      isLocal: true
    });
    return node.rules.map(function(rule) {
      return this.accept(rule, node);
    }.bind(this));
  }
  return CSSVisitor.prototype.Document.call(this, node);
};

CSSNamespaceRewriter.prototype.Keyframes = function(node) {
  if (utils.isLocal(node)) {
    node.name = this.keyframeNames[node.name] = this.keyframeNames[node.name] || this.options.adjustName(node.name, this.options.namespace, "keyframe");
    node.meta = merge(node.meta, {
      isLocal: true
    });
  }
  return CSSVisitor.prototype.Keyframes.call(this, node);
};

CSSNamespaceRewriter.prototype.Rule = function(node) {
  var classNames = [];
  if (node.selectors && utils.isLocal(node)) {
    node.selectors = node.selectors.map(function(selector) {
      var convertedSelector = convertSelector.call(this, selector);
      Object.keys(convertedSelector.classNames).forEach(function(className) {
        this.classNames.register(className, convertedSelector.classNames[className]);
      }.bind(this));
      classNames.push(Object.keys(convertedSelector.classNames));
      return convertedSelector.selector;
    }.bind(this));

    node.meta = merge(node.meta, {
      classNames: classNames
    });
  }
  return CSSVisitor.prototype.Rule.call(this, node);
};

CSSNamespaceRewriter.prototype.Declaration = function(node) {
  switch (node.property) {
  case "animation":
  case "animation-name":
    var firstFound = false;
    node.value = node.value.replace(/(\S+)/g, function(name) {
      // if we've already found the first occurence, just return the original name
      if (firstFound) {
        return name;
      }
      firstFound = this.keyframeNames[name];
      return firstFound || name;
    }.bind(this));
    break;
  case "font":
  case "font-family":
    if (utils.isLocal(node)) {
      // TODO - can we clean this up?
      node.value = node.value.split(",").map(function(item) {
        return item.replace(/^(\s*(['"])?)([^'",]+)(['"]?\s*)$/g, function(match, before, quotes, name, after) {
          var dimensions = "";
          // yikes :)
          name = name.replace(/\s+(?:\d+(?:\.\d+)?[A-z]+\s*(?:\/\s*(?:\d+(?:\.\d+)?[A-z]+)))/, function(match) {
            dimensions = match;
            return "";
          });
          name = name.trim();
          if (node.parent && node.parent.type === "font-face") {
            name = this.fontFamilyNames[name] = this.fontFamilyNames[name] || this.options.adjustName(name, this.options.namespace, "font-family");
          }
          return before + (this.fontFamilyNames[name] || name) + dimensions + after;
        }.bind(this));
      }.bind(this)).join(",");
    }
    break;
  }
  return CSSVisitor.prototype.Declaration.call(this, node);
};

CSSNamespaceRewriter.prototype.FontFace = function(node) {
  if (utils.isLocal(node)) {
    node.meta = merge(node.meta, {
      isLocal: true
    });
  }
  return CSSVisitor.prototype.FontFace.call(this, node);
};

function convertSelector(selector) {
  var classNames = {};
  var gobalSelectors = [];

  // temporarily substitute all the global classNames
  selector = selector.replace(rGlobalSelector, function(match, globalSelector) {
    var count = gobalSelectors.length;
    gobalSelectors.push(globalSelector);
    return "{" + count + "}";
  });

  // now collect all the classNames
  selector = selector.replace(rClassName, function(match, className, extra) {
    // keep track of all discovered classNames
    var adjustedClassName = classNames[className] = classNames[className] || this.options.adjustName(className, this.options.namespace, "class");
    return utils.normalizeClassName(adjustedClassName, true) + extra;
  }.bind(this));

  // restore global classes
  selector = selector.replace(rGlobalPlaceholder, function(match, count) {
    return gobalSelectors[count];
  });

  return {
    classNames: classNames,
    selector: selector
  };
}


module.exports = CSSNamespaceRewriter;
