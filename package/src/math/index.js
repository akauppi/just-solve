/*
* math/index.js
*
* Purely mathematical tools.
*
*   - Vector is presented as: [dx, dy]
*
* References:
*   - Cross product (Wikipedia)
*     -> https://en.wikipedia.org/wiki/Cross_product
*/

/*
* [ax,ay]:  Vector from starting point to 'p'
* [bx,by]:  Baseline
*
* Projected length of A on B.
*/
function projDist( [ax,ay], [bx,by] ) {   // ([num,num], [num,num]) => num

  const dotP= ax*bx + ay*by;
  return dotP / Math.sqrt(bx*bx + by*by);
}

/*
* [ax,ay]:  Vector from starting point to 'p'
* [bx,by]:  Baseline
*
* Distance of end point of A, from line defined by vector B.
*/
function sideDist( [ax,ay],[bx,by] ) {   // ([num,num], [num,num]) => num

  const v = (-bx*ay + ax*by) / Math.sqrt( bx*bx + by*by );
  return v;
}

/*
* Calculate the point that is 'sAlong' along the vector, and 'sSide' to the side of it.
*/
function moveAlong( [vx,vy], sAlong, sSide ) {    // ([num,num], num, num) => [num,num]
  const vNorm = Math.sqrt(vx*vx + vy*vy);
  const [ux,uy] = [vx/vNorm, vy/vNorm];

  const [a,b] = [ux * sAlong, uy * sAlong];   // point on the line
  const [c,d] = [uy * sSide, -ux * sSide];     // steps perpendicular to the line    (tbd. CHECK!)

  return [a+c, b+d];
}

export {
  projDist,
  sideDist,
  moveAlong
}
