<script setup lang="ts">
// vue
import { onMounted, ref, shallowRef, watch } from 'vue';
import { refDebounced } from '@vueuse/core'

// project
import { Logger } from '../../share/logger';
import { NotifyMessageType, RequestMessageType, TreeFolder, FlatFolder } from '../../share/types';

import TextFilter from '../components/part/textFilter/TextFilter.vue';
import FilterSetting from '../components/part/filterSetting/FilterSetting.vue';
import FolderList from '../components/part/folderList/FolderList.vue';
import FolderLoading from '../components/part/folderLoading/FolderLoading.vue';


// === text filter ===

const filterText = shallowRef('');
const debouncedFilterText = refDebounced(filterText, 500);

watch(debouncedFilterText, (nextValue) => {
  Logger.debug(`Applying filter: "${nextValue}"`);
  filterAndDisplayFolders(nextValue);
});


// === folder ===

const folderTree = ref<TreeFolder[]>([]);
const displayedFolders = ref<FlatFolder[]>([]);

onMounted(() => {
  Logger.debug('Vue component mounted');

  if (!window.webviewApi) {
    Logger.error('not find webviewApi');
    return;
  }

  Logger.debug('Sending folder list request');
  window.webviewApi.postMessage({ type: RequestMessageType.GetFolders }).then(() => {
    Logger.debug('Folder list request sent successfully');
  }).catch(err => {
    Logger.error(`${err.message}`);
  });

  // プラグインからのメッセージを受信
  window.webviewApi.onMessage((message) => {
    const messagePayload = message.message || message;
    Logger.debug(`Message received: ${messagePayload.type}`);

    if (messagePayload.type === NotifyMessageType.UpdateFolderList) {
        folderTree.value = messagePayload.folders || [];
        Logger.debug(`Number of root folders: ${folderTree.value.length}`);
        // FIXME: これ要る？
        filterAndDisplayFolders(debouncedFilterText.value);
      }
  });

  Logger.debug('Vue initialization complete');
});



function filterAndDisplayFolders(filterText: string) {
  const normalized = (filterText || '').trim().toLowerCase();

  if (!normalized) {
    displayedFolders.value = flattenTree(folderTree.value);
    Logger.debug(`Number of displayed folders: ${displayedFolders.value.length}`);
    return;
  }

  const filteredTree = filterTreeByTitle(folderTree.value, normalized);
  displayedFolders.value = flattenTree(filteredTree);
  Logger.debug(`Number of displayed folders: ${displayedFolders.value.length}`);
};



function filterTreeByTitle(nodes: TreeFolder[], filterText: string): TreeFolder[] {
  const matches: TreeFolder[] = [];
  for (const node of nodes) {
    const titleMatches = node.title.toLowerCase().includes(filterText);
    if (titleMatches) {
      matches.push(node);
      continue;
    }

    if (node.children && node.children.length > 0) {
      const childMatches = filterTreeByTitle(node.children, filterText);
      if (childMatches.length > 0) {
        matches.push(...childMatches);
      }
    }
  }

  return matches;
}

function flattenTree(nodes: TreeFolder[], depth = 0, out: FlatFolder[] = []): FlatFolder[] {
  for (const node of nodes) {
    out.push({ id: node.id, title: node.title, depth, icon: node.icon });
    if (node.children && node.children.length > 0) {
      flattenTree(node.children, depth + 1, out);
    }
  }
  return out;
}

</script>

<template>
  <div class="h-screen w-screen overflow-y-hidden pa-2 flex flex-col gap-1">
    <!-- <FilterSetting /> -->

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
