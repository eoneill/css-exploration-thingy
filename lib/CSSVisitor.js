function CSSVisitor() {}

CSSVisitor.prototype.accept = function(node, parentNode) {
  var type = node && node.type && node.type.replace(/(?:^|-|_)+([a-z])/g, function(match, char) {
    return char.toUpperCase();
  });

  if (!this[type]) {
    return node;
  }

  node.parent = parentNode;

  var result = this[type](node);

  if (!this.mutating || result) {
    return result;
  } else if (result !== false) {
    return node;
  }
};

["Stylesheet", "Rule", "Keyframes", "Media", "Document", "Declaration", "Keyframe", "FontFace"].forEach(function(type) {
  CSSVisitor.prototype[type] = visit;
});

function visit(node) {
  if (!node) {
    return;
  }

  if (node.type === "stylesheet") {
    visit.call(this, node.stylesheet);
  }
  else {
    Object.keys(node).forEach(function(key) {
      visitProperty.call(this, key, node);
    }.bind(this));
  }

  return node;
}

function visitProperty(property, node) {
  if (node && Array.isArray(node[property])) {
    node[property] = node[property].reduce(function(properties, item) {
      var result = this.accept(item, node);
      if (result) {
        if (Array.isArray(result)) {
          properties = properties.concat(result);
        }
        else {
          properties.push(result);
        }
      }
      return properties;
    }.bind(this), []);
  }
}

module.exports = CSSVisitor;