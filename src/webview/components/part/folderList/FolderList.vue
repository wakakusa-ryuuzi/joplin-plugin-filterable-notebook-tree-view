<script setup lang="ts">
// vue
import { ref } from 'vue';

// project
import { Logger } from '../../../../share/logger';
import { FlatFolder } from '../../../../share/types';
import { useFolderMessaging } from '../../../composables/useFolderMessaging';

import GroupPanel from '../../base/GroupPanel.vue';

const props = defineProps<{
  displayedFolders: FlatFolder[];
}>();

const selectedFolderId = ref('');
const { selectFolder } = useFolderMessaging();

function openSelectedFolder(folderId: string) {
  const targetId = folderId || selectedFolderId.value;
  if (targetId) {
    Logger.debug(`Folder selected: ${targetId}`);
    selectFolder(targetId);
  } else {
    Logger.error('Error: No folder selected');
  }
};
</script>

<template>
  <GroupPanel>
    <div class="pa-2">
      <div v-if="props.displayedFolders.length === 0" class="py-1 px-2">
        {{ 'No matching folders' }}
      </div>
      <button
        v-for="folder in props.displayedFolders"
        :key="folder.id"
        type="button"
        class="w-full text-left py-1 rounded hover:bg-[var(--joplin-background-hover)]"
        :style="{ paddingLeft: `${folder.depth * 16 + 8}px` }"
        @click="openSelectedFolder(folder.id)"
      >
        {{ folder.icon ?? '' }} {{ folder.title }}
      </button>
    </div>
  </GroupPanel>
</template>
