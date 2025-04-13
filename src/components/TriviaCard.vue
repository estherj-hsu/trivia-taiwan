<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../utils/supabase";
import triviaData from "../data/trivia.json";

interface ReactionCounts {
  knew: number;
  didntKnow: number;
  interesting: number;
}

interface TriviaItem {
  id: number;
  text: string;
  category: string;
  icon: string;
  featured?: boolean;
  reactionCounts?: ReactionCounts;
  source?: string[];
}

const data = ref<TriviaItem[]>(triviaData);
const route = useRoute();
const router = useRouter();

const categories = computed(() => {
  const all = data.value.map((item) => item.category);
  return [...new Set(all)];
});

const selectedCategory = ref(categories.value[getRandomIndex(categories.value.length)]);
const currentIndex = ref(0);

const filteredTrivia = computed(() => {
  return data.value.filter((item) => item.category === selectedCategory.value);
});

const currentTrivia = computed(() => {
  return filteredTrivia.value[currentIndex.value % filteredTrivia.value.length];
});

const featuredTrivia = computed(() => {
  return data.value.find((item) => item.featured) || data.value[0];
});

onMounted(() => {
  selectedCategory.value = featuredTrivia.value.category;
  const matching = data.value.filter((item) => item.category === featuredTrivia.value.category);
  currentIndex.value = matching.findIndex((item) => item.id === featuredTrivia.value.id);
  initReactions(featuredTrivia.value.id);
});

function getRandomIndex(max: number): number {
  return Math.floor(Math.random() * max);
}

function selectCategory(cat: string) {
  selectedCategory.value = cat;
  const filteredLength = filteredTrivia.value.length;
  currentIndex.value = getRandomIndex(filteredLength);
  userReaction.value = null;
  updateUrl();
}

function shuffleCurrentCategory() {
  const fullList = data.value;
  const currentId = currentTrivia.value?.id;

  const candidates = fullList.filter((item) => item.id !== currentId);

  const randomItem = candidates[getRandomIndex(candidates.length)];

  selectedCategory.value = randomItem.category;
  const matching = data.value.filter((item) => item.category === randomItem.category);
  currentIndex.value = matching.findIndex((item) => item.id === randomItem.id);

  userReaction.value = null;
  updateUrl();
}

function updateUrl() {
  router.replace({ path: `/${currentTrivia.value.id}` });
}

function loadFromUrl() {
  const idParam = Number(route.params.id);
  if (!isNaN(idParam)) {
    const match = data.value.find((item) => item.id === idParam);
    if (match) {
      selectedCategory.value = match.category;
      const index = data.value
        .filter((item) => item.category === match.category)
        .findIndex((item) => item.id === idParam);
      if (index !== -1) {
        currentIndex.value = index;
      }
    }
  }
}

const reactions = ["knew", "didntKnow", "interesting"] as const;
const userReaction = ref<string | null>(null);

async function initReactions(id: number) {
  const storedReaction = localStorage.getItem(`trivia-response-${id}`);
  userReaction.value = storedReaction;
  await fetchVotesForTrivia(id);
}

async function fetchVotesForTrivia(id: number) {
  const { data, error } = await supabase.from("votes").select("reaction").eq("trivia_id", id);

  if (error) {
    console.error("Error fetching votes:", error);
    return;
  }

  const counts: ReactionCounts = { knew: 0, didntKnow: 0, interesting: 0 };
  data.forEach((vote) => {
    if (counts[vote.reaction as keyof ReactionCounts] !== undefined) {
      counts[vote.reaction as keyof ReactionCounts]++;
    }
  });

  currentTrivia.value.reactionCounts = counts;
}

async function react(type: keyof ReactionCounts) {
  if (!reactions.includes(type as any)) return;
  if (userReaction.value) return;

  const { error } = await supabase.from("votes").insert({
    trivia_id: currentTrivia.value.id,
    reaction: type,
  });

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  currentTrivia.value.reactionCounts ??= { knew: 0, didntKnow: 0, interesting: 0 };
  currentTrivia.value.reactionCounts[type as keyof ReactionCounts]++;
  userReaction.value = type;

  localStorage.setItem(`trivia-response-${currentTrivia.value.id}`, type);
}

watch(currentTrivia, (newVal) => {
  if (newVal) initReactions(newVal.id);
});

onMounted(() => {
  loadFromUrl();
  if (currentTrivia.value) initReactions(currentTrivia.value.id);
});
</script>

<template>
  <div class="trivia-card" :data-id="currentTrivia.id" role="main" aria-labelledby="trivia-text">
    <div class="trivia-card-icon" aria-hidden="true">{{ currentTrivia.icon }}</div>
    <div class="trivia-card-text" id="trivia-text" aria-live="polite">
      <p>
        {{ currentTrivia.text }}
        <template v-if="currentTrivia.source && currentTrivia.source.length">
          <sup v-for="(link, index) in currentTrivia.source" :key="link">
            <a :href="link" target="_blank" rel="noopener noreferrer">[{{ index + 1 }}]</a>
          </sup>
        </template>
      </p>
    </div>
    <button
      class="trivia-card-shuffle-btn"
      @click="shuffleCurrentCategory"
      aria-label="Shuffle trivia fact"
      :aria-describedby="'trivia-text'"
    >
      <i class="ph ph-shuffle" aria-hidden="true"></i>
    </button>
    <div class="trivia-card-reactions">
      <button
        v-for="type in reactions"
        :key="type"
        :class="['reaction-btn', { active: userReaction === type }]"
        @click="react(type)"
        :disabled="userReaction !== null"
        :aria-label="type === 'knew' ? 'I knew this' : type === 'didntKnow' ? 'I didn\'t know this' : 'Interesting!'"
      >
        <span v-if="type === 'knew'"> 👍 Knew! ({{ currentTrivia.reactionCounts?.knew ?? 0 }}) </span>
        <span v-else-if="type === 'didntKnow'"> 🤯 New! ({{ currentTrivia.reactionCounts?.didntKnow ?? 0 }}) </span>
        <span v-else> 😍 Interesting! ({{ currentTrivia.reactionCounts?.interesting ?? 0 }}) </span>
      </button>
    </div>
  </div>

  <div class="category-list">
    <button
      v-for="cat in categories"
      :key="cat"
      @click="selectCategory(cat)"
      :class="['category-btn', { selected: selectedCategory === cat }]"
      :aria-pressed="selectedCategory === cat"
    >
      {{ cat }}
    </button>
  </div>
</template>

<style scoped lang="sass">
@import '../assets/sass/variables'

button
  &:focus-visible
    outline: 2px solid $color-accent
    outline-offset: 2px

.trivia-card
  background-color: white
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1)
  border-radius: 1rem
  padding: 1.5rem
  text-align: center
  max-width: 36rem
  width: 100%
  display: flex
  flex-direction: column
  align-items: center
  justify-content: space-between
  gap: 1rem
  position: relative
  min-height: 370px
  @media (min-width: 768px)
    padding: 1.5rem 4rem
    min-height: 326px

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

  sup
    font-size: 0.675rem
    margin-left: 0.25rem
    color: $color-dark
    vertical-align: top;
    transition: all 0.2s ease-in-out
    &:hover
      font-size: 0.825rem
    a
      color: inherit
      text-decoration: none
      &:hover
        color: $color-accent
      &:focus-visible
        outline: 2px solid $color-accent
        outline-offset: 2px

.trivia-card-shuffle-btn
  font-size: 1.25rem
  border-radius: 0.5rem
  transition: all 0.2s ease-in-out
  display: flex
  align-items: center
  justify-content: center
  color: $color-accent
  padding: 0.5rem
  width: 2rem
  height: 2rem
  border-radius: 50%
  animation: shuffle-animation 5s ease-in-out infinite
  animation-delay: 5s
  animation-iteration-count: infinite
  @media (min-width: 768px)
    font-size: 1.5rem
    width: 2.5rem
    height: 2.5rem

  &:hover
    background-color: rgba($color-accent, 0.1)

@keyframes shuffle-animation
  0%
    opacity: 1
  45%
    opacity: 1
    transform: scale(1)
  50%
    opacity: 0.6
    transform: scale(1.2)
  55%
    opacity: 1
    transform: scale(1)
  100%
    opacity: 1

.trivia-card-reactions
  display: flex
  justify-content: center
  align-items: center
  flex-wrap: wrap
  gap: 0.4rem
  margin-top: 0.5rem
  width: 100%
  @media (min-width: 768px)
    gap: 0.75rem

.reaction-btn
  background-color: white
  border: 1px solid $color-muted
  color: $color-text
  border-radius: 1.5rem
  padding: 0.3rem 0.75rem
  font-size: 1rem
  transition: all 0.2s ease-in-out
  display: flex
  align-items: center
  justify-content: center
  gap: 0.25rem
  @media (min-width: 768px)
  font-size: 0.825rem

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
  color: $color-text
  background-color: white
  transition: all 0.2s ease-in-out
  @media (min-width: 768px)
    padding: 0.5rem 1rem
    font-size: 0.825rem

  &.selected
    background-color: $color-accent
    color: white
    border-color: transparent
</style>
