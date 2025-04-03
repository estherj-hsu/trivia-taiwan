<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { supabase } from '../utils/supabase'
import triviaData from '../data/trivia.json'

interface ReactionCounts {
  knew: number
  didntKnow: number
  interesting: number
}

interface TriviaItem {
  id: number
  text: string
  category: string
  icon: string
  reactionCounts?: ReactionCounts
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
  userReaction.value = null
}

function shuffleCurrentCategory() {
  const fullList = data.value
  const randomItem = fullList[getRandomIndex(fullList.length)]

  selectedCategory.value = randomItem.category
  const matching = data.value.filter((item) => item.category === randomItem.category)
  currentIndex.value = matching.findIndex((item) => item.id === randomItem.id)
  userReaction.value = null
}

const reactions = ['knew', 'didntKnow', 'interesting'] as const
const userReaction = ref<string | null>(null)

async function initReactions(id: number) {
  const storedReaction = localStorage.getItem(`trivia-response-${id}`)
  userReaction.value = storedReaction
  await fetchVotesForTrivia(id)
}

async function fetchVotesForTrivia(id: number) {
  const { data, error } = await supabase
    .from('votes')
    .select('reaction')
    .eq('trivia_id', id)

  if (error) {
    console.error('Error fetching votes:', error)
    return
  }

  const counts: ReactionCounts = { knew: 0, didntKnow: 0, interesting: 0 }
  data.forEach((vote) => {
    if (counts[vote.reaction as keyof ReactionCounts] !== undefined) {
      counts[vote.reaction as keyof ReactionCounts]++
    }
  })

  currentTrivia.value.reactionCounts = counts
}

async function react(type: keyof ReactionCounts) {
  if (!reactions.includes(type as any)) return
  if (userReaction.value) return

  const { error } = await supabase.from('votes').insert({
    trivia_id: currentTrivia.value.id,
    reaction: type
  })

  if (error) {
    console.error('Supabase error:', error)
    return
  }

  currentTrivia.value.reactionCounts ??= { knew: 0, didntKnow: 0, interesting: 0 }
  currentTrivia.value.reactionCounts[type as keyof ReactionCounts]++
  userReaction.value = type

  localStorage.setItem(`trivia-response-${currentTrivia.value.id}`, type)
}

watch(currentTrivia, (newVal) => {
  if (newVal) initReactions(newVal.id)
})

onMounted(() => {
  if (currentTrivia.value) initReactions(currentTrivia.value.id)
})
</script>

<template>
  <div class="container">
    <h1>Trivia Taiwan</h1>

    <div class="trivia-card" :data-id="currentTrivia.id">
      <div class="trivia-card-icon">{{ currentTrivia.icon }}</div>
      <p class="trivia-card-text">{{ currentTrivia.text }}</p>
      <button class="trivia-card-shuffle-btn" @click="shuffleCurrentCategory">
        <i class="ph ph-shuffle"></i>
      </button>
      <div class="trivia-card-reactions">
        <button
          v-for="type in reactions"
          :key="type"
          :class="['reaction-btn', { active: userReaction === type }]"
          @click="react(type)"
          :disabled="userReaction !== null"
        >
          <span v-if="type === 'knew'">👍 I knew this! ({{ currentTrivia.reactionCounts?.knew ?? 0 }})</span>
          <span v-else-if="type === 'didntKnow'">🤯 Didn’t know ({{ currentTrivia.reactionCounts?.didntKnow ?? 0 }})</span>
          <span v-else>😍 Interesting! ({{ currentTrivia.reactionCounts?.interesting ?? 0 }})</span>
        </button>
      </div>
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
  max-width: 36rem
  width: 100%
  display: flex
  flex-direction: column
  align-items: center
  justify-content: space-between
  gap: 1rem
  position: relative
  min-height: 360px

  @media (min-width: 768px)
    padding: 1.5rem 4rem
    min-height: 320px

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

.trivia-card-icon
  font-size: 2.5rem
  margin-bottom: 0.5rem

  @media (min-width: 768px)
    font-size: 3rem

.trivia-card-text
  flex: 1
  display: flex
  align-items: center
  font-size: 0.9rem
  font-weight: 500
  line-height: 1.5
  text-wrap: balance

  @media (min-width: 768px)
    font-size: 1rem

.trivia-card-shuffle-btn
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

.trivia-card-reactions
  display: flex
  flex-direction: column
  gap: 0.4rem
  margin-top: 0.5rem
  width: 100%
  align-items: center

  @media (min-width: 768px)
    flex-direction: row
    justify-content: center
    gap: 0.75rem

.reaction-btn
  background-color: white
  border: 1px solid $color-muted
  color: $color-text
  border-radius: 1.5rem
  padding: 0.3rem 0.75rem
  font-size: 0.825rem
  cursor: pointer
  transition: all 0.2s ease-in-out
  display: flex
  align-items: center
  justify-content: center
  gap: 0.25rem

  &:not(.active):hover
    background-color: rgba($color-accent, 0.1)
    border-color: $color-accent

  &.active
    border-color: $color-accent
    font-weight: 500

  &:disabled:not(.active)
    opacity: 0.6
    cursor: not-allowed

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
  color: $color-text
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