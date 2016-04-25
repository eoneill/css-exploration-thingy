"use strict";

var gulp = require("gulp");

require("./tasks/test")(gulp);

gulp.task("default", ["test"]);
