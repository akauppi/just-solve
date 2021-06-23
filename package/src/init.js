/*
* src/init.js
*/
import { takeIn } from './internal/takeIn.js'

/*
* Take in an SVG element, disect it into its peaces and return the constraints system.
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

  const constraints = { /*???*/ };   // constraints context

  items.forEach( item => {
    const nodeType = item.nodeType;

    if (nodeType !== 8) {
      takeIn(item, constraints);
    }
  });
}

export {
  init
}
