# DON'T USE THIS!

This is just an exploration of some ideas. You should not use this.

# Goals

## Works with existing CSS / app structures.

The primary goal of this solution is that it can be added / enabled to a sufficiently large project without needing a large refactor.

This means we employ a "global by default" approach with the ability to define things that are "locally" scoped.

## Localized className selectors

It should be easy to define a className that is localized to a namespace. This should be easy to do and obviously distinguish the difference between "global" and "local" selectors.

## Localized other potential namespace conflicts

e.g. `@keyframe` and `@font-face` names

## Prune unused CSS

If localized classNames are never referenced, we should be able to prune all associated rules from the CSS tree.

## Easily used within Handlebars

Should be as easy as `<div class="{{css.foo}}">`.

The core libraries should work outside of Handlebars, but our target environment is Handlebars.

# TODOs
- needs to actually integrate with a build (`ember-cli` addon)
- modularize all the things
- we should inspect `classNameBindings` in the component
- we should use `postcss` instead of `reworkcss`, but I'm lazy, so I'll do it later
