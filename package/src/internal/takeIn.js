/*
* internal/takeIn.js
*/
import { assert, fail } from '../common.js'

import { trackPath } from './trackPath.js'

/*
* Take in a single SVG element to the constraints system.
*
* The element remains active, and its geometry may be changed (from now on) by the constraints, in place.
*/
async function takeIn(el, constraints) {    // (SVGElement, ???)

  const {
    nodeType,   // 1 (ELEMENT_NODE)
    id,         //
    tagName,     // "path"|...
    attributes,   // NamedNodeMap
    dataset     // DOMStringMap   // should provide access to 'data-c-exports', 'data-c-constraints'
  } = el;

  assert(nodeType === 1, _ => `Unexpected 'nodeType': ${nodeType}`);

  const [cExports, cConstraints] = [dataset.cExports, dataset.cConstraints];
    //
    //  .cExport: "large-arc: a"
    //  .cConstraints: "       a isTangentWith large-arc       (a.midpoint to l) isPerpendicularTo large-arc     "

  //DEBUG
  console.log("!!!_", { nodeType, dataset, tagName, id, attributes });

  switch(tagName) {
    case "path":
      const x = await trackPath(attributes.d.value);
      break;

    default:
      fail(`Unexpected SVG element: ${tagName}`)
  }
}

export {
  takeIn
}
