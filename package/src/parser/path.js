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
import { derived } from 'svelte/store'

import { fail } from '../common.js'

import { sPoint } from '../solvables/index.js'

function assure(cond, msg) {    // (boolean, string|() => string)) => ()
  if (!cond) fail(`ERROR in SVG path: ${ typeof msg === 'function' ? msg() : msg }`);
}

/*
* Parse an SVG path's 'd' attribute, gathering its internal points, and implicit constraints.
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

  const names = new Map();          // Map of string -> writable of num | [writable of num, writable of num]
  const constraints = new Array();  // Array of {...constraint}

  // state
  //
  let isClosed = false;
  let currentPoint = null;    // [writable of num, writable of num] | null

  let mCount = 0;       // index of the 'Mm' that set 'currentPoint' (leads to name "M:1", "M:2", ..)
  let lCount = 0;       // -''- (for 'l'/'L')
  let aCount = 0;       // -''-

  const parts = [];   // Array of readable string   ; collects the path components, as they would change dynamically
                      //                              (may be reduced, but not so that it affects the graphical output)

  for( const [char,nums] of arr) {
    assure(!isClosed, _ => `More commands after 'z': ${char} ${nums}`);

    if (isLowerCase(char) && !currentPoint) {
      fail(`Relative path command without a current point: ${char}`);    // note: could be valid SVG (if starting point is implicitly [0,0] - check standards way #later)
    }

    switch(char) {
      // Move ties to the following entity; does not create names or constraints itself, but via moving 'currentPoint'.
      //
      case 'm':
      case 'M':
        // Nx2 params (normally 2)
        assure(nums.length && nums.length % 2 === 0, _ => `${char} expects an even number of parameters`);

        const pairs = toPairs(nums);
        let mP;

        if (char === 'M') {
          mP = pairs[pairs.length-1];   // only last pair matters

        } else {  // 'm'
          mP = [currentPoint[0].value, currentPoint[1].value];    // tbd. this cool?

          pairs.forEach( ([dx,dy]) => {   // tbd. some functional one-liner to sum them up
            mP[0] += dx;
            mP[1] += dy;
          })
        }
        currentPoint = sPoint(mP);

        mCount++;
        names.set(`M:${mCount}`, currentPoint);

        // Reproduce by a single, absolute move.
        //
        const mPart = derived( [currentPoint[0], currentPoint[1]], (x,y) => `M ${x} ${y}`);
        parts.push(mPart);
        break;

      // tbd. If we have multiple, intermediate points, those could be seen as a path that scales (but keeps the shape),
      //    between 'currentPoint' and where-ever the last coord of 'lL' leads. Otherwise, solving will go crazy in the
      //    intermediate points, and addressing is simpler if 'L:3' means the end point of the 3rd 'lL' element.

      case 'l':
      case 'L':
        assure(nums.length && nums.length % 2 === 0, _ => `${char} expects an even number of parameters`);

        // Take the last pair. For interim pairs, see comment above (i.e. #later)

        let to;

        if (char === 'l') {
          to = [currentPoint[0].value, currentPoint[1].value];
          toPairs(nums).forEach( ([dx,dy]) => {
            to[0] += dx;
            to[1] += dy;
          });
        } else {
          to = toPairs(nums).slice(-1);
        }

        const nextPoint = sPoint(to);

        // Naming (e.g. "L:3") points to the final coords of the "L x y ... xN yN".
        //
        lCount++;
        names.set(`L:${lCount}`, nextPoint);

        // Reproduce a consistent stream of coords, scaled as the start/end points would move. (NOT IMPLEMENTED, #later)
        //
        const lPart = derived( [currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1]], (x,y,xN,yN) => {

          const acc = [`L ${x} ${y}`];

          // tbd. For now, skip interim points - straight to the end.

          acc.push(`L ${xN} ${yN}`);
          return acc.join(' ');
        });
        parts.push(lPart);

        currentPoint = nextPoint;
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
      case 'a':
      case 'A':
        assure(nums.length && nums.length % 7 === 0, _ => `${char} expects 7,14,.. parameters`);

        toSevens(nums).forEach( ([rx,ry,angle,largeArcFlag,sweepFlag,x,y]) => {

        })
        break;
      ***/

      // Note: handling 'z' needs no constraints gymnastics (always connects last and first point).
      case 'z':
      case 'Z':
        isClosed = true;
        break;

      default:
        throw new Error(`Unknown path command: ${char}`)
    }
  }

  // If any of the parts changes, update the 'd' attribute.
  //
  const dReadable = derived(parts, (...args) => {
    const s = args.join(' ') + isClosed ? " Z":"";
    return s;
  });

  dReadable.subscribe(s => {
    el.setAttribute("d", s);  // :D
  });

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

// Regex's for path 'd' component parsing
//
//const num = "\-?\d*(?:\.\d*)"
//const ab = `${num},${num}`

/*** not needed
const ReM = new RegExp( `^[Mm]\s*(${ab})+$` );   // "M 10,10" | "M 10,10 0,0" | "m-5,2"
const ReL = new RegExp( `^[Ll]\s*(${ab})+$` );   // "L 10,10" | "L 10,10 0,0" | "l-5,2"

const ReH = new RegExp( `^[Hh]\s*(${num})+$` );   // "L 10,10" | "L 10,10 0,0" | "l-5,2"
***/

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
