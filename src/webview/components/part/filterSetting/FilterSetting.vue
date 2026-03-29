<script setup lang="ts">
// vue
import { ref } from 'vue';

// project
import GroupPanel from '../../base/GroupPanel.vue';


const emit = defineEmits<{
  (e: 'reload'): void
}>();

const exactMatchChecked = ref(false);
const regexpChecked = ref(false);
const noChildrenChecked = ref(false);
</script>

<template>
  <GroupPanel>
    <div class="pa-2 flex flex-row gap-2">
      <div class="flex flex-row gap-1 items-center">
        <input type="checkbox" id="exact-match" v-model="exactMatchChecked" />
        <label for="exact-match">exact match</label>
      </div>
      <div class="flex flex-row gap-1 items-center">
        <input type="checkbox" id="regexp" v-model="regexpChecked" />
        <label for="regexp">RegExp</label>
      </div>
      <div class="flex flex-row gap-1 items-center">
        <input type="checkbox" id="no-children" v-model="noChildrenChecked" />
        <label for="no-children">No children</label>
      </div>

      <div class="ml-auto">
        <button
          type="button"
          class="
                w-5 h-5
                grid place-items-center
                rounded-full
                bg-gray-200 text-gray-500
                hover:bg-gray-300 hover:text-gray-700
                active:scale-90
                transition-all duration-150"
          @click="emit('reload')"
        >
          <span class="i-mdi:reload text-sm"></span>
        </button>
      </div>
    </div>
  </GroupPanel>
</template>
