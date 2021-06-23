# Approach

*This information is for developers/curious, arguing why certain design decisions were taken.*


## Role of `package/`

By separating the distributable package to its own folder, we can keep its `package.json` (which gets published) to a minimum.

This also allows separate `README` files for the repo (how to develop it) and the published package (how to use it).


## Coordinate transforms

Constraints are only to be used within one coordinate system - not over transforms.

>This may or may not last the development. Eg. dragging is easiest to be done by modifying a draggable item's transforms.


## Embrace SVG 2.0 (if it arrives)

>Note: Browsers seem to have support for `data-*` already in SVG 1.1 (see "dataset" [here](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement)).
>
>Editors (eg. IntelliJ SVG syntax highlighter doesn't).

It has support for `data-*` properties, that would be a nice way to tap into the SVG, in a standard fashion (those are mentioned to be for "scripting integration" or something..).

Having said that, it's not shipped in browsers.

So:

Current approach must be workable with SVG 1.1 implementations, but kept in mind that if SVG 2.0 comes out of the cocoon, we are prepared and can jump ship.

> It [SVG 1.2] was dropped for the upcoming SVG 2.0, which is under heavy development right now and follows a similar approach to CSS 3 in that it splits components into several loosely coupled specifications. 
>Source: [MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Introduction)</sub>

*"Last modified" Mar 25, 2021, but there's no guarantee the "right now" means that..*


## Svelte

Svelte has amazingly nice integration with SVG, and is as-such useful in animating SVG data.

### A: All in

We can build the whole concept around it. One would then need to build components using Svelte, but those can be used in any Web framework, as Web Components.

Using the Svelte approach would probably mean the graphics cannot be edited with a drawing tool, any more. (which is a design criteria!) 😢

### B: Implement with it

Use Svelte for the reactivity framework (communicating changes), but keep the interfaces such that constraints are defined outside of it.


