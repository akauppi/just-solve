/*
* test/math.test.js
*
* Tests for 'src/math/index.js'
*/
import { test, expect, describe } from '@jest/globals'

import { projDist, sideDist, moveAlong } from '../src/math/index.js'

import './matchers/toBeCloseToXY'

describe ('Vector maths', () => {

  test ('projected distance', () => {
    expect( projDist([1,2], [10,30]) ).toBeCloseTo(2.214);    // (value checked with CAD: 2.214)
  })

  test ('side distance', () => {
    expect( sideDist([1,2], [10,20]) ).toBeCloseTo(0);   // should be on line
    expect( sideDist([1,2], [10,30]) ).toBeCloseTo(0.316227);    // right of the line (value checked with CAD: 0.316)
    expect( sideDist([1,-2], [10,-30]) ).toBeCloseTo(-0.316227);  // left of the line
  })

  test ('placing a point back, with projected and side distances', () => {
    const [vx,vy] = [10,30];
    const sAlong = 2.214;
    const sSide = 0.316227;

    expect( moveAlong([vx,vy], sAlong, sSide) ).toBeCloseToXY( [1,2] );
  })
})
