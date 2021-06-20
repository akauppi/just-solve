<svelte:options tag="just-constrained" />

<!--
- Instance part.
-
- This is responsible for the visual side.
-->
<script>
  import Constrained from "./Constrained.svelte";
</script>

<!--
- Svelte module notes:
-   - Gets here (module initialization) first, before the instance script.
-   - declarations available for the instances
-   - Svelte '$:' not allowed within module script.
-   - modules imported here are also visible in the instance code (normal 'script').
-->
<script context="module">
  //import {writable} from 'svelte/store'

  // Our things show to the instances, but not the other way round.

  function fail(msg) { throw new Error(msg); }
  function assert(cond, msg) {
    if (!cond) throw new Error(msg);
  }

  export {
  }
</script>

<!--
- tbd. try not removing the nodes, but just sliding them out of sight when 'user' changes (does work now, though..)
-->
<div>I'm in!</div>

<style>
  :host {
    /* web components are 'display: inline' by default */
    display: block;
  }
</style>
