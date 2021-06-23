/*
* trackPath.js
*
* Parses a path and returns its internal names and constraints.
*
* References:
*   - d (MDN docs)
*     -> https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
*/
import { fail } from '../common.js'

// Regex's for path 'd' component parsing
//
const num = "\-?\d*(?:\.\d*)"
const ab = `${num},${num}`

const ReM = new RegExp( `^[Mm]\s*(${ab})+$` );   // "M 10,10" | "M 10,10 0,0" | "m-5,2"
const ReL = new RegExp( `^[Ll]\s*(${ab})+$` );   // "L 10,10" | "L 10,10 0,0" | "l-5,2"

const ReH = new RegExp( `^[Hh]\s*(${num})+$` );   // "L 10,10" | "L 10,10 0,0" | "l-5,2"

const CommandRe = new RegExp(/^\s*([a-zA-Z])([\s,-.\d])/);    // e.g. "   a 20,30 0 1 0 -45,55   ", "a20,30,0,1,0,-45,55"

/*
* Parse an SVG path's 'd' attribute, gathering its internal points, and implicit constraints.
*/
function trackPath(d) {   // (string) => [{...names...}, {...constraints...}]   ; throws if 'd' does not parse

  function assure(cond, msg) {    // (boolean, string|() => string)) => ()
    if (!cond) fail(`ERROR in SVG path: ${ typeof msg === 'function' ? msg() : msg }`);
  }

  let arr;
  try {
    arr = preParse(d);
  }
  catch(ex) {
    throw new Error(`Cannot parse '${ d.splice(100) }': ${ ex.getMessage() }`);
  }

  const names = new Map();
  const constraints = new Array();

  // state
  //
  let isClosed = false;
  let currentPoint = null;    // [num,num] | null

  let moveCount = 0;        // index of the 'Mm' that set 'currentPoint' (leads to name "M:1", "M:2", ..)

  for( const [char,nums] of arr) {
    assure(isClosed, "Bad path: more commands after 'z'");

    switch(char) {
      // Move ties to the following entity; it does not create names or constraints itself.
      //
      case 'm'|'M':
        // Allowed to have Nx2 params, but normally 2.
        assure(nums.length && nums.length % 2 === 0, _ => `${char} expects an even number of parameters`);

        const pairs = toPairs(nums);

        if (char === 'M') {
          currentPoint = pairs[pairs.length-1];   // only last pair matters

        } else {  // 'm'
          assure(currentPoint, "'m' without a starting point");    // note: could be valid SVG (if starting point is implicitly [0,0]?)

          pairs.forEach( ([dx,dy]) => {
            currentPoint[0] += dx;
            currentPoint[1] += dy;
          })
        }

        moveCount++;

      case 'l'|'L':
      case 'h'|'H':
      case 'v'|'V':
      case 'c'|'C':
      case 's'|'S':
      case 'q'|'Q':
      case 't'|'T':
      case 'a'|'A':
      case 'z'|'Z':
        isClosed = true; break;
      default:
        throw new Error(`Unknown path command: ${char}`)
    }
  }

  debugger;
}

/*
* Early parsing.
*
* Splits the path 'd' string to its data contents: Array of [char, Array of num]].
*
* Note:
*   Superficially, it seems SVG path strings would have a more elaborate syntax (MDN sample uses commas, for example),
*   but browsers allow either white space or comma as *any* delimiter. Thus, it's always about "char + array of nums".
*
* Throws if the parameter isn't a valid SVG path.
*/
function preParse(d) {   // (string) => Array of [char, Array of num]]

  const arr = Array.of( d.matchAll(CommandRe) ).map( ([whole,c1,c2]) => {

    // Split the parameters at ',' or white space; surviving bits must parse as numbers
    //
    const tmp = c2.split(/[\s,]/).flatMap( s => Number.parseFloat(s) );

    if (tmp.some(Number.isNan)) {
      throw new Error(`Bad component: ${whole}`);
    }
    return [c1, tmp];
  })

  return arr;
}

function toPairs(arr) {   // (Array of num) => Array of [num,num]
  const ret = [];
  for( let i=0; i<arr.length; i+=2 ) {    // tbd. could replace this with some functional one-liner, #later
    ret.push([arr[i],arr[i+1]]);
  }
  return ret;
}

export {
  trackPath
}
