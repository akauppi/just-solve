/*
* solvables/index.js
*/
import { writable } from 'svelte/store'

import { assert } from '../common.js'

function sCoord(v) {    // (num) => writable of num
  return writable(v);
}

// Allow points to be moved around as one (cleans up code), though in solving the coordinates are handled as individual
// parameters.
//
function sPoint([x,y]) {    // ([num,num]) => [writable of num, writable of num]
  return [
    sCoord(x),
    sCoord(y)
  ];
}

function sDistance(d) {    // (num) => writable of num
  return writable(d)
}

function sAngle(deg) {    // (num) => writable of num
  return writable(deg)
}

export {
  sCoord,
  sPoint,
  sDistance,
  sAngle
}
