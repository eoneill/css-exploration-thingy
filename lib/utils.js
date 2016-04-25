var cssEscape = require("css.escape");

var rLeadingDot = /^\.?/;

function normalizeClassName(className, isSelector) {
  className = className.replace(rLeadingDot, "");
  if (isSelector) {
    className = "." + cssEscape(className);
  }
  return className;
}

function isLocal(node) {
  while (node) {
    if (node.meta && node.meta.isLocal === true) {
      return true;
    }
    node = node.parent;
  }
  return false;
}

module.exports = {
  normalizeClassName: normalizeClassName,
  isLocal: isLocal
};
