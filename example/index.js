var HandlebarsNamespaceRewriter = require("../index");

var Handlebars = require("handlebars");
var fs = require("fs");
var path = require("path");
var chalk = require("chalk");

function readFile(file) {
  return fs.readFileSync(path.join(__dirname, file)).toString();
}
function headline(text) {
  console.log(chalk.bold.underline.cyan("\n" + text));
}

(function doIt() {
  var hbsText = readFile("example.hbs");
  var cssText = readFile("example.css");

  var rewriter = new HandlebarsNamespaceRewriter({
    namespace: "path/to/example",
    hbs: Handlebars.parse(hbsText),
    css: cssText,
    isProd: true,
    // use a unique handlebars pathname (e.g. {{styles.foo}} instead of the default {{css.foo}})
    //pathName: "styles",

    // disable pruning unused css
    //prune: false,

    // override the className adjuster
    //adjustName: function(name, namespace, type) {
    //  return namespace + "--" + name;
    //}
  });

  var template = new Handlebars.compile(rewriter.hbs, {});

  headline("Resulting CSS");
  console.log(rewriter.css);

  headline("Resulting HBS");
  console.log(template({
    bar: true
  }));

  headline("className mappings");
  console.log(JSON.stringify(rewriter.classNames, null, 2));

}());
