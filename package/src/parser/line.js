/*
* parser/line.js
*/
import { sPoint } from '../solvables/index.js'

/*
* Embrace a 'line' SVG element, creating solvables for its geometry, and taking care of updating the element if
* the solvables change.
*/
function embraceLine(el) {    // (SVGLineElement) => { names }

  const { x1,y1, x2,y2 } = el.attributes;

  const sa = sPoint(x1,y1);
    //
    sa[0].subscribe( v => { el.setAttribute("x1", v); });
    sa[1].subscribe( v => { el.setAttribute("y1", v); });

  const sb = sPoint(x2,y2);
    //
    sb[0].subscribe( v => { el.setAttribute("x2", v); });
    sb[1].subscribe( v => { el.setAttribute("y2", v); });

  return {
    names: {
      "start": sa,
      "end": sb
    }
  }
}

export {
  embraceLine
}
