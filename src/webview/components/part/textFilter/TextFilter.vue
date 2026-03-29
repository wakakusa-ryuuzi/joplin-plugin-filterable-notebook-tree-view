<script setup lang="ts">
// project
import GroupPanel from '../../base/GroupPanel.vue';

const modelValue = defineModel<string>({ default: '' });
</script>

<template>
  <GroupPanel>
    <div class="relative">
      <!-- input -->
      <input
        v-model="modelValue"
        type="text"
        placeholder="Notebook name"
        class="w-full pa-2 pl-4 pr-8"
      />
      <!-- x button -->
      <button
        v-if="modelValue"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2
              w-5 h-5
              grid place-items-center
              rounded-full
              bg-gray-200 text-gray-500
              hover:bg-gray-300 hover:text-gray-700
              active:scale-90
              transition-all duration-150"
        @click="modelValue = ''"
      >
        <span class="i-mdi:window-close text-sm"></span>
      </button>
    </div>
  </GroupPanel>
</template>
