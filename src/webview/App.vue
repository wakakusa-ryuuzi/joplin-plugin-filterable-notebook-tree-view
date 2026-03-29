<script setup lang="ts">
import MainPage from './page/MainPage.vue';
</script>

<template>
  <div class="joplin-ui">
    <MainPage />
  </div>
</template>

<style>
.joplin-ui {
  color: var(--joplin-color);
  font-family: var(--joplin-font-family);
  background: var(--joplin-background-color);
}

.joplin-ui * {
  scrollbar-width: thin;
  scrollbar-color: var(--joplin-scrollbar-thumb-color) var(--joplin-background-color);
}

.joplin-ui *::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.joplin-ui *::-webkit-scrollbar-track {
  background: var(--joplin-background-color);
}

.joplin-ui *::-webkit-scrollbar-thumb {
  background-color: var(--joplin-scrollbar-thumb-color);
  border-radius: 8px;
  border: 2px solid var(--joplin-background-color);
}

.joplin-ui *::-webkit-scrollbar-thumb:hover {
  background-color: var(--joplin-scrollbar-thumb-color-hover);
}

.joplin-ui *::-webkit-scrollbar-button {
  width: 0;
  height: 0;
  display: none;
}

.joplin-ui *::-webkit-scrollbar-button:single-button {
  width: 0;
  height: 0;
  display: none;
}

.joplin-ui *::-webkit-scrollbar-button:vertical:decrement,
.joplin-ui *::-webkit-scrollbar-button:vertical:increment,
.joplin-ui *::-webkit-scrollbar-button:horizontal:decrement,
.joplin-ui *::-webkit-scrollbar-button:horizontal:increment {
  width: 0;
  height: 0;
  display: none;
}
</style>
