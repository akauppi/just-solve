/*
* test/matchers/toBeCloseToXY.js
*
* Like '.toBeCloseTo' matcher, but checking the distance from an XY point.
*
* Usage:
*   <<
*     expect( ... ).toBeCloseTo([2,3])
*   <<
*/
expect.extend({
  toBeCloseToXY(received, target) {   // ([x1,y1], [x2,y2]) => { message: () => string, pass: Boolean }
    const { printReceived, printExpected } = this.utils;

    isValidXY(received) || fail(`expected tested value to be '[x,y]': ${received}`);
    isValidXY(target) || fail(`expected target value to be '[x,y]': ${target}`);

    // Distance between the points
    const pow2 = d => d*d;
    const dist = Math.sqrt( pow2(target[0]-received[0]) + pow2(target[1]-received[1]) );

    // Q: Is there a way to use Jest's built-in '.toBeCloseTo' matcher, from here?  We'd like to compare 'dist' to 0.0.
    //    #jest

    // Jest's '.toBeCloseTo' uses 0.005 margin; suitable also for the coordinates.
    //
    const pass = Math.abs(dist) < 0.005;

    return pass ? {
      message: () => `expected ${ printReceived(received) } not to be close to ${ printExpected(target) }`,
      pass: true
    } : {
      message: () => `expected ${ printReceived(received) } to be close to ${ printExpected(target) }`,
      pass: false
    }
  }
})

function isValidXY(any) {   // (any) => Boolean
  return Array.isArray(any) && any.length === 2 && typeof any[0] === 'number' && typeof any[1] === 'number';
}

function fail(msg) { throw new Error(msg); }
