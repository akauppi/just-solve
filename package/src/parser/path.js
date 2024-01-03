/*
* parser/path.js
*
* Embrace an SVG path. Provide its geometry as solvables, implied constraints (with names local to the path), and
* update the SVG path if the solvables ever change.
*
* References:
*   - d (MDN docs)
*     -> https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
*/
import { derived, get as storeGet } from 'svelte/store'

import { fail, assert } from '../common.js'

import { sPoint } from '../solvables/index.js'
import { projDist, sideDist, moveAlong } from '../math/index.js'

function assure(cond, msg) {    // (boolean, string|() => string)) => ()
  if (!cond) fail(`ERROR in SVG path: ${ typeof msg === 'function' ? msg() : msg }`);
}

/*
* Parse an SVG path's 'd' attribute, gathering its internal points, and implicit constraints (lines, arcs, provide none;
* tbd. will there be some from curves?).
*
* Returns:
*   {
*     names:        Map of string -> writable of num | [writable of num, writable of num]
*     constraints:  Array of {...constraint}
*   }
*/
function embracePath(el) {   // (SVGPathElement) => { names, constraints }   ; throws if 'd' does not parse

  const d = el.attributes.d.value;

  let arr;
  try {
    arr = preParse(d);
  }
  catch(ex) {
    throw new Error(`Cannot parse '${ truncate(d,100) }': ${ ex.message }`);
  }

  // state
  //
  let currentPoint = null;    // [writable of num, writable of num] | null

  let mCount = 0;       // index of the 'Mm' that set 'currentPoint' (leads to name "M:1", "M:2", ..)
  let lCount = 0;       // -''- (for 'lL')
  let aCount = 0;       // -''-

  // Note: Defining the different switch cases as functions provides scoping.

  function case_mM( isAbsolut, pairs ) {   // (Boolean, Array of [a,b]) => { name: [string,sPoint], part: readable string }
    const sp = sPoint( endP(isAbsolut,pairs) );
    currentPoint = sp;

    mCount++;
    const name = [`M:${mCount}`, sp];

    // Reproduce by a single, absolute move.
    //
    const part = derived( [sp[0], sp[1]], (x,y) => `M ${x} ${y}`);

    return {
      name,
      part
    }
  }

  // If there are multiple line segments ('l 0 20 50 100'), only the start and end points are steerable by outside
  // constraints. The intermediate points are scaled between (or around) them, keeping the overall shape.
  //
  // Providing interim coordinates and returning back to the starting coord is forbidden.

  function case_lL( isAbsolut, pairs ) {    // (Boolean, Array of [a,b]) => { name: [string,sPoint], part: readable string }

    // Convert the points to their relative coordinates, on the 'currentPoint' to end point axis (left side is negative).
    //
    const scaled = scalePoints(isAbsolut, pairs);

    const nextPoint = sPoint( endP(isAbsolut, pairs) );

    // Naming (e.g. "L:3") points to the final coords.
    //
    lCount++;
    const name = [`L:${lCount}`, nextPoint];

    // Reproduce a consistent stream of coords, scaled as the start/end points would move.
    //
    const part = derived( [currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1]], (xa,ya,xb,yb) => {
      const [vx,vy] = [xb-xa, yb-ya];
      const vNorm = Math.sqrt(vx*vx + vy*vy);

      const coords = scaled.map( ([sAlong,sSide]) => {
        const [dx,dy] = moveAlong([vx,vy], sAlong*vNorm, sSide*vNorm);
        return [
          xa + dx,
          ya + dy
        ];
      } );

      // Note: scaled coords may get unreasonably long digits. Check some day, if we wish to round them. #tbd.

      const s = "L "+ coords.join(' ');
      return s;
    });

    currentPoint = nextPoint;

    return {
      name,
      part
    }
  }

  // Like with 'l/L', if there are multiple adjacent arc segments, allow only the start and end points to be
  //    steered by external constraints. The rest scales.

  function case_aA( isAbsolut, sevens ) {    // (Boolean, Array of [a,b,c,d,e,f,g]) => { name: [string,sPoint], part: readable string }

    // Pick the coords (last two points)
    //
    const pairs = sevens.map( arr => arr.splice(-2) );

    // Convert the points to their relative coordinates, from 'currentPoint' to end point.
    const scaled = scalePoints(isAbsolut, pairs);

    //debugger;

    const nextPoint = sPoint( endP(isAbsolut, pairs) );

    // Naming (e.g. "A:6") points to the final coords.
    //
    aCount++;
    const name = [`A:${aCount}`, nextPoint];

    // Reproduce consistent arcs, scaled as the start/end points would move.
    //
    const part = derived( [currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1]], (xa,ya,xb,yb) => {
      const [vx,vy] = [xb-xa, yb-ya];
      const vNorm = Math.sqrt(vx*vx + vy*vy);

      const coords = scaled.map( ([sAlong,sSide]) => {
        const [dx,dy] = moveAlong([vx,vy], sAlong*vNorm, sSide*vNorm);
        return [
          xa + dx,
          ya + dy
        ];
      } );

      // Note (tbd.): It's not enough to scale the coords. Also radii and angle needs scaling, to keep the shape.

      //debugger;
      const tmp = sevens.map( ([rx,ry,angle,largeArgFlag,sweepFlag,_,__], i) => {
        const [x,y] = coords[i];

        return [rx,ry,angle,largeArgFlag,sweepFlag,x,y];
      })

      const s = "A "+ tmp.join(' ');
      return s;
    });

    currentPoint = nextPoint;

    return {
      name,
      part
    }
  }

  /*
  * Map points to the 'currentPoint' -> end point vector. Last returned value is '[1,0]'.
  */
  function scalePoints(isAbsolut, pairs) {    // (Boolean, Array of [a,b]) => Array of [num,num]
    const [cpX,cpY] = [storeGet(currentPoint[0]), storeGet(currentPoint[1])];

    const pe = endP(isAbsolut, pairs);
    const [vx, vy] = [pe[0] - cpX, pe[1] - cpY];

    if (pairs.length > 1 && vx === 0 && vy === 0) {
      throw new Error("Multiple 'lL' coordinates, leading back to the starting point is not allowed.");
    }

    const vNorm = Math.sqrt(vx*vx + vy*vy);

    return pairs.map( ([x,y]) => {
      const [va,vb] = [x-cpX, y-cpY];

      const dist = projDist( [va,vb],[vx,vy] );
      const side = sideDist( [va,vb],[vx,vy] );   // <0: left of line

      return [dist/vNorm, side/vNorm];
    })
  }

  /* DISABLED
  * Vector from 'currentPoint' to the end point of 'lL'
  *_/
  function vectorToLast(isAbsolut, pairs) {   // (Boolean, Array of [a,b]) => [dx,dy]
    const pe = endP(isAbsolut, pairs);

    return [pe[0]-currentPoint[0].value, pe[1]-currentPoint[1].value];
  }*/

  /*
  * Provide the end point for 'mM', 'lL'
  */
  function endP(isAbsolut, pairs) {    // (Boolean, Array of [a,b]) => [x,y]
    if (isAbsolut) {  // fast forward to the last point
      return pairs[pairs.length-1];

    } else {  // need to consider all intermediate points
      const [cpX,cpY] = [storeGet(currentPoint[0]), storeGet(currentPoint[1])];

      return pairs.reduce( ([a,b], [c,d]) => [a+c, b+d],
        [cpX, cpY]    // starting value
      )
    }
  }

  // ---

  const parts = [];   // Array of readable string   ; path components that can change dynamically

  const names = new Map();          // Map of string -> writable of num | [writable of num, writable of num]
  const constraints = new Array();  // Array of {...constraint}

  let isClosed = false;

  for( const [char,nums] of arr) {
    assure(!isClosed, _ => `More commands after 'z': ${char} ${nums}`);

    if (isLowerCase(char) && !currentPoint) {
      fail(`Relative path command without a current point: ${char}`);    // note: could be valid SVG (if starting point is implicitly [0,0] - check standards way #later)
    }

    let o;    // { name, part }

    switch(char) {
      // Move ties to the following entity; does not create names or constraints itself, but via moving 'currentPoint'.
      case 'm':
      case 'M':
        assure(nums.length && nums.length % 2 === 0, _ => `${char} expects an even number of parameters`);
        o = case_mM( char=='M', toPairs(nums) );
        break;

      case 'l':
      case 'L':
        assure(nums.length && nums.length % 2 === 0, _ => `${char} expects an even number of parameters`);
        o = case_lL( char=='L', toPairs(nums) );
        break;

      /*** #later
      case 'h':
      case 'H':
        break;
      case 'v':
      case 'V':
        break;
      case 'c':
      case 'C':
        break;
      case 's':
      case 'S':
        break;
      case 'q':
      case 'Q':
        break;
      case 't':
      case 'T':
        break;
      ***/

      case 'a':
      case 'A':
        assure(nums.length && nums.length % 7 === 0, _ => `${char} expects 7,14,.. parameters`);
        o = case_aA( char=='A', toSevens(nums) );
        break;

      // Note: handling 'z' needs no constraints gymnastics (always connects last and first point).
      case 'z':
      case 'Z':
        isClosed = true;
        o = {};
        break;

      default:
        fail(`Unknown path command: ${char}`)
    }

    const { name, part } = o;
    if (name) {
      assert( !names.has(name[0]), _ => `Internal error: already has name: ${name[0]}`);

      names.set(name[0], name[1]);
    }

    if (part) {
      parts.push(part);
    }
  }

  console.log("!!! parts", parts);

  parts.forEach( (part) => {
    part.subscribe( x => {
      console.log("UPDATE: ", x);
    })
  })

  /***
  // If any of the parts changes, update the 'd' attribute.
  //
  const dR = derived(parts, ([$a, $b, $c]) => {

    const s = [$a, $b].join(' ') + isClosed ? " Z":"";
    return s;
  });

  dR.subscribe(s => {
    el.setAttribute("d", s);  // :D
  });
  ***/

  return { names, constraints }
}

/*
* Early parsing.
*
* Splits the path 'd' string to its data contents: Array of [char, Array of num].
*
* Note:
*   Superficially, it seems SVG path strings would have a more elaborate syntax (MDN sample uses commas, for example),
*   but browsers allow either white space or comma as *any* delimiter. Thus, it's always about "char + array of nums".
*
* Throws if the parameter isn't a valid SVG path.
*/
function preParse(d) {   // (string) => Array of [char, Array of num]

  // eg. d: "M 120 50     a 15 15 1 0 1 0 -30     l 60 15     z "

  const arr = [... d.matchAll(ReCharParams)];

  const a2 = arr.map( ([whole,c1,c2]) => {

    // Split the parameters at ',' or white space; surviving bits must parse as numbers
    //
    const tmp = c2.trim().split(/\s+|\s*,\s*/).flatMap( s => s ? Number.parseFloat(s) : null );

    if (tmp.some(Number.isNaN)) {
      throw new Error(`Bad component: ${whole}`);
    }
    return [c1, tmp];
  });

  return a2;
}

const ReCharParams = new RegExp(/\s*([a-zA-Z])([\s,-.\d]*)/g);    // e.g. "   a 20,30 0 1 0 -45,55   ", "a20,30,0,1,0,-45,55"

const toPairs = genToSlices(2);
const toSevens = genToSlices(7);

function genToSlices(n) {    // int => (Array of num) => Array of [num,...]
  return arr => {   // (Array of num) => Array of [num,...]   ; with each sub-array having 'n' items
    const ret = [];
    for( let i=0; i<arr.length; i+=n ) {    // tbd. could replace this with some functional one-liner, #later
      ret.push( arr.slice(0,n) );
    }
    return ret;
  }
}

function truncate(s,maxLen) {    // (string,int) => string
  if (s.length <= maxLen) {
    return s;
  } else {
    return `${ s.substring(0, maxLen) }...`;
  }
}

function isLowerCase(ch) { return ch === ch.toLowerCase(); }

export {
  embracePath
}
