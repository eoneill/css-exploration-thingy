var merge = require("lodash.merge");
var CSSVisitor = require("./CSSVisitor");
var utils = require("./utils");

function CSSPruner(options) {
  this.options = merge({
    usedClassNames: [],
  }, options);
  this.usedKeyframes = new Set();
  this.usedFontFamilies = new Set();
}

CSSPruner.prototype = new CSSVisitor();

CSSPruner.prototype.Rule = function(node) {
  if (node.selectors && node.meta && node.meta.classNames) {
    node.selectors = node.selectors.filter(function(selector, i) {
      var hasUnused = node.meta.classNames[i].some(function(className) {
        if (this.options.usedClassNames.indexOf(className) === -1) {
          return true;
        }
      }.bind(this));

      if (!hasUnused) {
        return true;
      }
    }.bind(this));

    // if no selectors remain, remove it
    if (!node.selectors.length) {
      return false;
    }
  }
  return CSSVisitor.prototype.Rule.call(this, node);
};

CSSPruner.prototype.Declaration = function(node) {
  switch (node.property) {
  case "animation":
  case "animation-name":
    node.value.split(/\s+/).forEach(function(name) {
      this.usedKeyframes.add(name);
    }.bind(this));
    break;
  case "font":
  case "font-family":
    // TODO - mark font-families as used...
    //node.value.split(",").forEach(function(name) {
    //  console.log(name);
    //});

    // if (utils.isLocal(node)) {
    //   node.value = node.value.split(",").map(function(item) {
    //     return item.replace(/^(\s*(?:['"])?)([^$2,]+)($2?\s*)+$/g, function(match, before, name, after) {
    //       if (node.parent && node.parent.type === "font-face") {
    //         name = this.fontFamilyNames[name] = this.fontFamilyNames[name] || this.options.adjustName(name, this.options.namespace, "font-family");
    //       }
    //       return before + (this.fontFamilyNames[name] || name) + after;
    //     }.bind(this));
    //   }.bind(this)).join(",");
    // }
    break;
  }
  return CSSVisitor.prototype.Declaration.call(this, node);
};

// removes unused @keyframes
CSSPruner.prototype.Keyframes = function(node) {
  if (this.pruneKeyframes && utils.isLocal(node)) {
    if (!this.usedKeyframes.has(node.name)) {
      return false;
    }
  }
  return CSSVisitor.prototype.Keyframes.call(this, node);
};

// removes unused @font-face
CSSPruner.prototype.FontFace = function(node) {
  if (this.pruneFontFaces && utils.isLocal(node)) {
    if (!this.usedFontFamilies.has(node.name)) {
      return false;
    }
  }
  return CSSVisitor.prototype.FontFace.call(this, node);
};

// prune empty @media blocks
CSSPruner.prototype.Media = function(node) {
  if (!(node.rules && node.rules.length)) {
    return false;
  }
  return CSSVisitor.prototype.Media.call(this, node);
};

CSSPruner.prototype.tidy = function(ast) {
  // flag keyframes for removal
  this.pruneKeyframes = true;
  //this.pruneFontFaces = true;
  return this.accept(ast);
};

module.exports = CSSPruner;
