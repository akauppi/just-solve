# Approach

## General design

<!-- tbd. schematic, here... -->

### Parsing

SVG is parsed into separate sections, which may be connected with constraints (implicit in the SVG, e.g. from `path` or `rectangle`). 

>Not all SVG features are necessarily supported; i.e. we work on a subset of SVG. 
<!-- to be documented, #later; this is about approach -->

The original SVG element is kept in the DOM, and *manipulated* in place by the constraints solver. That is, the system knows how to *re-create* the SVG in place.

*Every* dimension parameter of SVG is turned into a constrained (or unconstrained) entity: coordinates, dimensions, angles. All the *styling* parameters are left untouched in the SVG.

Once given to the constraints engine, the web app must do all geometric manipulation via the constraints model (or tranform matrix); writes to the dimension attributes will be overwritten by the constaints model (e.g. to fix a coordinate in place, add a `fix` constraint to it).

**Limitations**

- Only certain SVG elements are supported, for now.
- Groups, transforms are not currently supported

The idea is to lift limitations over time, once we get practical experience and more use cases arise.

### Constraints

Constraints are collected during the parsing, to a separate (flat) table. This table is *not* connected to SVG domain, but is a generic representation of vector graphics primitives. A solvable can be created, from it, solved, and the received values written back, to cause change in the SVG element.

```
| name | type | writable num, ... |
```

Each constraint follows the same generic pattern.

>`writable` is from [Svelte stores](https://svelte.dev/tutorial/writable-stores). It's used as a reactivity implementation. It's writable so that solved values can be written back to SVG.

The names can be used to refer to constraints from SVG `data-*` properties. These are not needed by the solver, nor for writing back values.

Constraint types used:

|type|scope: description|parameters|
|---|---|---|
|`coincident`|Point and Point; eliminated before it gets to the solver|`sp1`,`sp2`|
||Point and LineSegment: solved as `_pointOnSegment`|`sp`,`sa`,`sb`|
|`colinear`|Line and Line: eliminated by joining the line parameters<br /> LineSegment and Line: eliminated by joining some parameters<br />  LineSegment and LineSegment: eliminated by making an interim `Line` element and constraining both segments to it||
|`parallel`|Line\|LineSegment and Line\|LineSegment: eliminated by joining the angle parameters||
|`perpendicular`|Line\|LineSegment and Line\|LineSegment: constrained by `_angleBetweenLines(90)`||
|`angled`|Line\|LineSegment and Line\|LineSegment: constrained by `_angleBetweenLines(deg)`||
|`tangent`|Line\|LineSegment and Line\|LineSegment\|Arc\|...: constrained by `_tangential`||
|...|

The tangent point needs to reside within the length of the segment / arc / path. This can be ensured by an additional (internal) `conincident` constraint.

Internal constraint types:

||||
|---|---|---|
|`_pointOnSegment`|Point and [Point, Angle, Dist]: point is within a line segment (including start and end points)|
|`_sameAnglesMod180`|Angle and Angle: are the angles (that likely mean slope of lines) the same|
|`_tangential`||

