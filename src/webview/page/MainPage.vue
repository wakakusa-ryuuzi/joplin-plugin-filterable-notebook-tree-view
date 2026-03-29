<script setup lang="ts">
// vue
import { onMounted, ref, shallowRef, watch } from 'vue';
import { refDebounced } from '@vueuse/core';

// project
import { Logger } from '../../share/logger';
import {
  FlatFolder,
  NotifyMessageType,
  RequestMessageType,
  TreeFolder,
} from '../../share/types';
import { useFilterFolder } from '../composables/useFilterFolder';

import { createFolderFilterOptions, FolderFilterOptions } from '../components/part/filterSetting';
import TextFilter from '../components/part/textFilter/TextFilter.vue';
import FilterSetting from '../components/part/filterSetting/FilterSetting.vue';
import FolderList from '../components/part/folderList/FolderList.vue';
import FolderLoading from '../components/part/folderLoading/FolderLoading.vue';


// === filter option ===

const filterOptions = ref<FolderFilterOptions>(createFolderFilterOptions());

watch(filterOptions, () => {
  updateDisplayedFolders();
}, { deep: true });

function handleReload(): void {
  updateDisplayedFolders();
}

// === text filter ===

const filterText = shallowRef('');
const debouncedFilterText = refDebounced(filterText, 500);

watch(debouncedFilterText, () => {
  updateDisplayedFolders();
});


// === folder ===

const folderTree = ref<TreeFolder[]>([]);
const displayedFolders = ref<FlatFolder[]>([]);

const { filterAndFlattenFolders } = useFilterFolder();



onMounted(() => {
  Logger.debug('Vue component mounted');

  if (!window.webviewApi) {
    Logger.error('not find webviewApi');
    return;
  }

  Logger.debug('Sending folder list request');
  try {
    window.webviewApi.postMessage({ type: RequestMessageType.GetFolders });
    Logger.debug('Folder list request sent successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    Logger.error(message);
  }

  // プラグインからのメッセージを受信
  window.webviewApi.onMessage((message) => {
    const messagePayload = message.message || message;
    Logger.debug(`Message received: ${messagePayload.type}`);

    if (messagePayload.type === NotifyMessageType.UpdateFolderList) {
        folderTree.value = messagePayload.folders || [];
        Logger.debug(`Number of root folders: ${folderTree.value.length}`);
        updateDisplayedFolders();
      }
  });

  Logger.debug('Vue initialization complete');
});


function updateDisplayedFolders(): void {
  Logger.debug(
    `Applying filter: "${debouncedFilterText.value}"`,
    filterOptions.value,
  );

  displayedFolders.value = filterAndFlattenFolders(
    folderTree.value,
    debouncedFilterText.value,
    filterOptions.value,
  );
  Logger.debug(`Number of displayed folders: ${displayedFolders.value.length}`);
}



</script>

<template>
  <div class="h-screen w-screen overflow-y-hidden pa-2 flex flex-col gap-1">
    <FilterSetting
      v-model:options="filterOptions"
      @reload="handleReload"
    />

    <TextFilter v-model="filterText" />

    <FolderLoading
      v-if="folderTree.length === 0"
    />
    <FolderList
      v-else
      class="flex-1 overflow-y-auto"
      :displayedFolders="displayedFolders"
    />
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
</style>
