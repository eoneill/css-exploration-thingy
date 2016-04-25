var utils = require("./utils");

function ClassNameRegistry() {
  this.registry = {};
}

ClassNameRegistry.prototype.get = function(className) {
  className = utils.normalizeClassName(className);
  return this.registry[className];
};

ClassNameRegistry.prototype.use = function(className) {
  className = utils.normalizeClassName(className);
  if (this.registry[className]) {
    this.registry[className].isUsed = true;
  }
};

ClassNameRegistry.prototype.register = function(className, adjustedClassName) {
  className = utils.normalizeClassName(className);
  adjustedClassName = utils.normalizeClassName(adjustedClassName);
  this.registry[className] = {
    adjustedClassName: adjustedClassName,
    isUsed: false
  };
};

ClassNameRegistry.prototype.getUsed = function() {
  return Object.keys(this.registry).filter(function(key) {
    return !!this.registry[key].isUsed;
  }.bind(this));
};


ClassNameRegistry.prototype.getUsedMapping = function() {
  return this.getUsed().reduce(function(mapping, className) {
    mapping[className] = this.get(className).adjustedClassName;
    return mapping;
  }.bind(this), {});
};

module.exports = ClassNameRegistry;
