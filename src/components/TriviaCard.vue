<script setup lang="ts">
import { ref, computed } from 'vue'
import triviaData from '../trivia.json'

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
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] px-4 py-8 font-[Rubik] text-[#2F4F4F]">
    <div class="text-3xl font-bold mb-2 flex items-center gap-2">
      <span class="text-[#D62828]">🇹🇼</span>
      <span class="text-[#205072]">TRIVIA TAIWAN</span>
    </div>

    <div class="bg-white shadow-md rounded-xl px-6 py-4 text-center mb-6 max-w-xl w-full">
      <div class="text-2xl mb-2">{{ currentTrivia.icon }}</div>
      <p class="text-lg font-medium">{{ currentTrivia.text }}</p>
    </div>

    <div class="flex flex-wrap gap-2 justify-center mb-6">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="selectCategory(cat)"
        class="px-3 py-1 rounded-full border text-sm transition-all duration-200"
        :class="selectedCategory === cat ? 'bg-[#479298] text-white' : 'bg-white border-[#ccc]'"
      >
        {{ cat }}
      </button>
    </div>

    <button
      @click="nextFact"
      class="bg-[#205072] hover:bg-[#154052] text-white px-6 py-2 rounded-full mb-4"
    >
      Next Fact
    </button>

    <footer class="text-sm text-gray-500">
      Made with <span class="text-red-500">❤️</span> by a Taiwanese
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;600&display=swap');

* {
  font-family: 'Rubik', sans-serif;
}
</style>
