<slot />

<style>
  ::global(*), ::global(*)::before, ::global(*)::after {
    box-sizing: border-box;
  }
  :global(body) {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
  }
</style>