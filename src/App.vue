<script setup lang="ts"></script>

<template>
  <div class="container">
    <h1>Trivia Taiwan</h1>
    <router-view />
    <footer class="footer">Made with ❤️ by a <a href="https://estherj-hsu.github.io/">Taiwanese</a></footer>
  </div>
</template>

<style scoped lang="sass">
@import './assets/sass/variables'
.container
  height: 100%
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: 0 0.5rem
  color: $color-text
  gap: 1rem

  @media (min-width: 768px)
    padding: 2rem 1rem
    gap: 1.5rem

h1
  font-family: "DynaPuff", sans-serif
  font-weight: bold
  font-size: 3em
  display: flex
  align-items: center
  gap: 0.5rem
  margin-bottom: 0.5rem
  color: $color-primary

  @media (min-width: 768px)
    font-size: 4.5em

.footer
  font-size: 0.875rem
  color: $color-dark
  a
    color: $color-primary
    text-decoration: none
    font-weight: 500
    transition: all 0.2s ease-in-out

    &:focus-visible
      outline: 2px solid $color-accent
      outline-offset: 2px

    &:hover
      text-decoration: underline
</style>
