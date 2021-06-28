/*
* src/init.js
*/
import { embrace } from './parser/embrace.js'

/*
* Take in an SVG element, dissect it into its pieces and create a constraints system that can be steered.
*
* Restrictions:
*   - only certain elements are supported ('line', 'a', 'ellipse', 'circle', 'path')
*   - no groups
*   - no inner translations
*/
function init(svg) {   // (SvgSvgElement) => ()

  const coll = svg.children;   // HTMLCollection
  const items = Array.from(coll);   // convert 'HTMLCollection'

  const constraints = new Map();    // Map of name -> [{ cType: string, params: [writable of, ...] }]

  items.forEach( item => {
    const nodeType = item.nodeType;

    if (nodeType === 1) {   // 'NODE_ELEMENT'
      const { names, constraints } = embrace(item);
        //
        // names:       Map of <name> -> writable of num | [writable of num, writable of num]
        // constraints: Array of ...

      //console.log("!!!", { names, constraints });   // DEBUG

      // tbd. use the names & constraints
      /***
      map.forEach( ([name,v]) => {
        if (constraints.has(name)) {
          throw new Error(`Constraint already exists: ${name}`);
        }
        constraints.set(name,v);
      });
      ***/
    } else if (nodeType === 8) {    // 'NODE_COMMENT'
      // skip
    } else {
      console.warning("Unknown SVG element:", nodeType);
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
