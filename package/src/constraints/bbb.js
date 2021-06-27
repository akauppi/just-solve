/*
* constraints/constraints.js
*
* Different constraints that can be crafted from the "basics" (coordinate, distance, angle).
*/
import { sPoint } from './basics.js'

/*
* A point.
*
* Constraints:
*   - coincident
*
* Sub-elements:
*   - .x    dist
*   - .y    dist
*/
function cPoint(sa) {    // ([Writable x, Writable y]) => ...
  return {
    cType: "point",
    x: sa[0],
    y: sa[1]
  }
}

/*
* A line segment. Coincident or tangent point needs to be within the length of the segment.
*
* Constraints:
*   - coincident    point on the line segment
*   - co-linear     with line or line segment
*   - parallel
*   - perpendicular   (reduces to angle-with)
*   - angle-with
*   - tangent
*
* Sub-elements:
*   - .start    point
*   - .end      point
*   - .dist     distance between the points
*/
function cLine(sa,sb, cc) {    // ([Writable x, Writable y], [Writable x, Writable y], Constraints) => {...entity}

  return {
    cType: "line-segment",
    start: sa,
    end: sb,

    get dist() {
      this.dist = cCreateSegmentDist(cc, sa,sb);
      return this.dist;
    }
  }
}

/*
* A circle.
*
* Constraints:
*   - coincident  by the rim
*   - co-centric  with another circle, or arc   (reduces to coincident of mid-points)
*   - tangent
*   - inside
*   - outside
*
* Sub-elements:
*   - .midPoint   point
*   - .r          distance
*/
function cCircle(sp,sr) {   // ([Writable x, Writable y], Writable dist) => {...entity}
  return {
    cType: "circle",
    midPoint: sp,
    r: sr
  }
}

/*
* An arc.
*
* Constraints:
*   - coincident  by the rim
*   - co-centric  with a circle, or another arc   (reduces to coincident of mid-points)
*   - tangent
*
* Sub-elements:
*   - .midPoint   point
*   - .r          distance
*   - .startPoint staring point
*   - .endPoint   end point
*
* Note: We use different parameterization than SVG and do not (currently) support elliptical arcs (where x and y
*     radii are different). Can be added, #later.
*/
function cArc(sp,sr,sAng1,sAng2) {   // ([Writable x, Writable y], Writable dist, Writable angle, Writable angle) => [{...entity}, [...constraints]]

  const startPoint = sPoint();
  const endPoint = sPoint();

  const constraints = [
    cPointsEqual(sp,sAng1,sr, startPoint);
    cPointsEqual(sp,sAng2,sr, endPoint);
  ];

  return [{
    cType: "arc",

    midPoint: sp,
    r: sr,
    startPoint,
    endPoint
  }, constraints];
}

export {
  cPoint,
  cLine,
  cCircle,
  cArc
}
