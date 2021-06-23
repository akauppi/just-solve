<svelte:options tag="just-constrained" />

<!--
- Instance part.
-
- Responsible for the visual side.
-->
<script>
  import { onMount } from 'svelte';
  import { init } from './init'

  //PROPS
  export let url;   // URL to external SVG
  ///PROPS

  let elParent;   // DivElement
  let el;         // HTMLObjectElement

  // 'Document'
  //  -> https://developer.mozilla.org/en-US/docs/Web/API/Document
  //
  onMount( async () => {

    // Note: 'onMount' within Svelte is *not enough* to have the object -> data properly initialized. In addition,
    //    we need its 'onLoad' (otherwise the '.contentDocument' has an empty head-body combo, instead of SVG).
    //
    await hasLoaded(el);

    const svgDoc = el.contentDocument;   // Document
    const svg = svgDoc.firstElementChild;   //

    await init(svg);
  })
</script>

<!--
- Svelte module notes:
-   - Gets here (module initialization) first, before the instance script.
-   - declarations available for the instances
-   - Svelte '$:' not allowed within module script.
-   - modules imported here are also visible in the instance code (normal 'script').
-->
<script context="module">
  //import { writable } from 'svelte/store'

  // Our things show to the instances, but not the other way round.

  /*
  * Turn DOM '.addEventListener('load',...)' to a Promise
  */
  function hasLoaded(el) {    // (Element) => Promise of ()
    return new Promise( (resolve) => {
      el.addEventListener('load', resolve);
    })
  }

  export {
  }
</script>

<!-- parent may not be needed -->
<div bind:this={elParent}>
  <object title="" data="{url}" type="image/svg+xml" bind:this={el}></object>
</div>

<style>
  :host {
    /* web components are 'display: inline' by default */
    display: block;
  }
</style>
