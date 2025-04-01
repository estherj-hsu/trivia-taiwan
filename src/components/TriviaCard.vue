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

const selectedCategory = ref('All')
const currentIndex = ref(0)

const categories = computed(() => {
  const all = data.value.map((item) => item.category)
  return ['All', ...new Set(all)]
})

const filteredTrivia = computed(() => {
  return selectedCategory.value === 'All'
    ? data.value
    : data.value.filter((item) => item.category === selectedCategory.value)
})

const currentTrivia = computed(() => {
  return filteredTrivia.value[currentIndex.value % filteredTrivia.value.length]
})

function nextFact() {
  currentIndex.value += 1
}

function selectCategory(cat: string) {
  selectedCategory.value = cat
  currentIndex.value = 0
}
</script>

<template>
  <div class="container">
    <h1>
      🇹🇼 TRIVIA TAIWAN
    </h1>

    <div class="trivia-card">
      <div class="icon">{{ currentTrivia.icon }}</div>
      <p class="text">{{ currentTrivia.text }}</p>
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
      Made with ❤️ by a Taiwanese
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
  padding: 2rem 1rem
  background-color: $color-bg
  color: $color-text
  gap: 1.5rem

h1
  font-family: Comfortaa, cursive
  font-weight: bold
  font-size: 4em
  display: flex
  align-items: center
  gap: 0.5rem
  margin-bottom: 0.5rem
  color: $color-primary

.trivia-card
  background-color: white
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1)
  border-radius: 1rem
  padding: 1.5rem
  text-align: center
  margin-bottom: 1.5rem
  max-width: 36rem
  width: 100%

.icon
  font-size: 1.5rem
  margin-bottom: 0.5rem

.text
  font-size: 1.125rem
  font-weight: 500
  line-height: 1.5

.category-list
  display: flex
  flex-wrap: wrap
  gap: 0.5rem
  justify-content: center
  margin-bottom: 1.5rem

.category-btn
  padding: 0.25rem 0.75rem
  font-size: 0.875rem
  border-radius: 1rem
  border: 0
  background-color: white
  transition: all 0.2s ease-in-out

  &.selected
    background-color: $color-accent
    color: white
    border-color: transparent

.footer
  font-size: 0.875rem
  color: $color-muted
</style>