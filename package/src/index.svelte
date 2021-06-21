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

  let el;   // Element

  onMount( () => {
    init(el);
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

  export {
  }
</script>

<div>
  <img bind:this={el}
     alt="" src="{url}"
  />
</div>

<style>
  :host {
    /* web components are 'display: inline' by default */
    display: block;
  }
</style>
