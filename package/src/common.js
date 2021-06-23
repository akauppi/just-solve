/*
* common.js
*/

// Keys used in the SVG, to carry exports and constraints
//
const DATA_EXPORT_KEY = "data-c-export";
const DATA_CONSTRAINTS_KEY = "data-c-constraints";

function assert(cond, genMsg) {
  if (genMsg && typeof genMsg !== 'function') {
    throw new Error("Must call 'assert' with a lazy message parameter ('_ => ...').")
  }

  if (!cond) {
    throw new Error("Assertion failed" + (genMsg ? `: ${genMsg()}` : ""))
  }
}

function fail(msg) {
  throw new Error(msg);
}

export {
  DATA_EXPORT_KEY,
  DATA_CONSTRAINTS_KEY,
  assert,
  fail
}
