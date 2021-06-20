<!--
- src/Constrained.svelte
-->

<!-- SKIP
<_!-- Load the right font (Google branding) KEEP --_>
<svelte:head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap');
  </style>
</svelte:head>
-->

<script>

  //PROPS
  export let svg;   // URL
  ///PROPS

  let el;   // <div> (from 'onMounted' onwards)

  console.log("!!!", svg);
</script>

<!--
-
-->
<!-- WARNING!!! Be EXTRA CAREFUL with the ';' in the inlined style. Syntax problems will silently change the look.
-->
<div on:click={ alert }
  bind:this={el}
  style="
    border: 1px solid red;
  "
>
  <span>ABC</span>
</div>

<!-- PROBLEM: Why is the 'style' section not picked up??
-   Styles being dynamically created have a need to be injected in HTML (above), but the constant ones could be here. #tbd
-   #help
-->
<style>
</style>

