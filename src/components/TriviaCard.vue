<script setup lang="ts">
import { ref, computed } from 'vue'
import triviaData from '../data/trivia.json'

interface TriviaItem {
  id: number
  text: string
  category: string
  icon: string
}

const data = ref<TriviaItem[]>(triviaData)

const categories = computed(() => {
  const all = data.value.map((item) => item.category)
  return [...new Set(all)]
})

const selectedCategory = ref(categories.value[getRandomIndex(categories.value.length)])
const currentIndex = ref(0)

const filteredTrivia = computed(() => {
  return data.value.filter((item) => item.category === selectedCategory.value)
})

const currentTrivia = computed(() => {
  return filteredTrivia.value[currentIndex.value % filteredTrivia.value.length]
})

function getRandomIndex(max: number): number {
  return Math.floor(Math.random() * max)
}

function selectCategory(cat: string) {
  selectedCategory.value = cat
  const filteredLength = filteredTrivia.value.length
  currentIndex.value = getRandomIndex(filteredLength)
}

function shuffleCurrentCategory() {
  const filteredLength = filteredTrivia.value.length
  currentIndex.value = getRandomIndex(filteredLength)
}
</script>

<template>
  <div class="container">
    <h1>Travia Taiwan</h1>

    <div class="trivia-card" :data-id="currentTrivia.id">
      <div class="icon">{{ currentTrivia.icon }}</div>
      <p class="text">{{ currentTrivia.text }}</p>
      <button class="shuffle-btn" @click="shuffleCurrentCategory">
        <i class="ph ph-shuffle"></i>
      </button>
    </div>

    <div class="category-list">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="selectCategory(cat)"
        :class="['category-btn', { selected: selectedCategory === cat }]"
      >
        {{ cat }}
      </button>
    </div>

    <footer class="footer">
      Made with ❤️ by a <a href="https://estherj-hsu.github.io/">Taiwanese</a>
    </footer>
  </div>
</template>

<style scoped lang="sass">
@import '../assets/sass/variables'
.container
  height: 100%
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: 1rem 0.5rem
  background-color: $color-bg
  color: $color-text
  gap: 1rem

  @media (min-width: 768px)
    padding: 2rem 1rem
    gap: 1.5rem

h1
  font-family: "DynaPuff", cursive
  font-weight: bold
  font-size: 4em
  display: flex
  align-items: center
  gap: 0.5rem
  margin-bottom: 0.5rem
  color: $color-primary

  @media (min-width: 768px)
    font-size: 4.5em

.trivia-card
  background-color: white
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1)
  border-radius: 1rem
  padding: 1.5rem 2rem
  text-align: center
  margin-bottom: 1.5rem
  max-width: 36rem
  width: 100%
  display: flex
  flex-direction: column
  align-items: center
  justify-content: space-between
  gap: 1rem
  position: relative
  min-height: 300px

  @media (min-width: 768px)
    padding: 1.5rem 4rem
    min-height: 272px

  &::before
    content: "#" attr(data-id)
    font-size: 2.5rem
    font-weight: bold
    color: $color-muted
    position: absolute
    top: 0.75rem
    left: 0.75rem
    z-index: 0

    @media (min-width: 768px)
      font-size: 3rem
      top: 1rem
      left: 1rem

.icon
  font-size: 2.5rem
  margin-bottom: 0.5rem

  @media (min-width: 768px)
    font-size: 3rem

.text
  font-size: 0.9rem
  font-weight: 500
  line-height: 1.5
  text-wrap: balance

  @media (min-width: 768px)
    font-size: 1rem

.shuffle-btn
  font-size: 1.25rem
  border-radius: 0.5rem
  background-color: transparent
  border: 0
  cursor: pointer
  transition: all 0.2s ease-in-out
  display: flex
  align-items: center
  justify-content: center
  color: $color-accent
  padding: 0.5rem
  width: 2rem
  height: 2rem
  border-radius: 50%

  @media (min-width: 768px)
    font-size: 1.5rem
    width: 2.5rem
    height: 2.5rem

  &:hover
    background-color: rgba($color-accent, 0.1)

.category-list
  display: flex
  flex-wrap: wrap
  gap: 0.5rem
  justify-content: center
  margin-bottom: 1rem

  @media (min-width: 768px)
    gap: 0.75rem
    margin-bottom: 1.5rem

.category-btn
  padding: 0.4rem 0.8rem
  font-size: 0.75rem
  font-weight: 500
  border-radius: 1rem
  border: 0
  background-color: white
  transition: all 0.2s ease-in-out
  cursor: pointer

  @media (min-width: 768px)
    padding: 0.5rem 1rem
    font-size: 0.825rem

  &.selected
    background-color: $color-accent
    color: white
    border-color: transparent

.footer
  font-size: 0.875rem
  color: $color-dark
  a
    color: $color-primary
    text-decoration: none
    font-weight: 500
    transition: all 0.2s ease-in-out

    &:hover
      text-decoration: underline
</style>