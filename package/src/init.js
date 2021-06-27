/*
* src/init.js
*/
import { parseOne } from './parser/parseOne.js'

/*
* Take in an SVG element, disect it into its pieces and create a constraints system.
*
* Restrictions:
*   - only certain elements are supported ('line', 'a', 'ellipse', 'circle', 'path')
*   - no groups
*   - no inner translations
*
* Resolves when the SVG element has been processed.
*/
async function init(svg) {   // (SvgSvgElement) => Promise of ()

  const coll = svg.children;   // HTMLCollection
  const items = Array.from(coll);   // convert 'HTMLCollection'

  const constraints = new Map();    // Map of name -> [{ cType: string, params: [writable of, ...] }]

  items.forEach( item => {
    const nodeType = item.nodeType;

    if (nodeType !== 8) {
      const map = parseOne(item);   // Map of ..like above.. (but only has the new entries)

      map.forEach( ([name,v]) => {
        if (constraints.has(name)) {
          throw new Error(`Constraint already exists: ${name}`);
        }
        constraints.set(name,v);
      });
    }
  });

  // tbd. Add constraints from the 'data-*' attributes.

  // tbd. Reduce

  // tbd. Solve

  console.log("We now have the constraints built. Could solve them, and feed the values back.");
}

export {
  init
}
