/*
* solvables/index.js
*/
import { writable } from 'svelte/store'

function sCoord(v) {    // (num) => writable of num
  return writable(v);
}

// Allow points to be moved around as one (cleans up code), though in solving the coordinates are handled as individual
// parameters.
//
function sPoint(p) {    // ([num,num]) => [writable of num, writable of num]
  return [
    sCoord(p[0]),
    sCoord(p[1])
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
