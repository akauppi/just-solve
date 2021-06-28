/*
* parser/index.js
*/
import { assert, fail } from '../common.js'

import { embracePath } from './path.js'
import { embraceLine } from './line.js'

/*
* Take in a single SVG element.
*
* The element remains in the DOM, but its geometric values will from now on be steered by the constraints.
*/
function embrace(el) {    // (SVGElement) => { names, constraints }

  const {
    nodeType,   // 1 (ELEMENT_NODE)
    tagName,     // "path"|...
    attributes,   // NamedNodeMap
  } = el;

  assert(nodeType === 1);

  let nac;    // {
              //    names: Map of string -> writable of num | [writable of num, writable of num]
              //    constraints?: Array of {...constraint}
              // }

  switch(tagName) {
    case "path":
      nac = embracePath(el);
      break;

    case "line":
      nac = embraceLine(el);
      break;

    default:
      fail(`Unexpected SVG element: ${tagName}`)
  }

  assert( nac.names );

  return { constraints: [], ...nac };   // ensure there's always a 'constraints' key
}

export {
  embrace
}
