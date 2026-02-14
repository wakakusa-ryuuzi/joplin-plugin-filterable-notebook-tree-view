<script setup lang="ts">
  import { onMounted, ref, shallowRef, watch } from 'vue';

  import { refDebounced } from '@vueuse/core'

  import { Logger } from '../../share/logger';
  import { NotifyMessageType, RequestMessageType } from '../../share/types';
import { T } from '@unocss/preset-wind4/dist/theme-BcMDscP8.mjs';

  const allFolders = ref([]);
  const filteredFolders = ref([]);

  const filterText = shallowRef('');
  const debouncedFilterText = refDebounced(filterText, 500);

  const selectedFolderId = ref('');

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
        allFolders.value = messagePayload.folders || [];
        Logger.debug(`Number of folders: ${allFolders.value.length}`);
        Logger.debug('Received folders:', allFolders.value);
        filterAndDisplayFolders(debouncedFilterText.value);
      }
    });

    Logger.debug('Vue initialization complete');
  });

  watch(debouncedFilterText, (nextValue) => {
    Logger.debug(`Applying filter: "${nextValue}"`);
    filterAndDisplayFolders(nextValue);
  });

  function filterAndDisplayFolders(filterText) {
    if (filterText) {
      const lowered = filterText.toLowerCase();
      const childrenByParent = new Map();
      for (const folder of allFolders.value) {
        if (!childrenByParent.has(folder.parent_id)) {
          childrenByParent.set(folder.parent_id, []);
        }
        childrenByParent.get(folder.parent_id).push(folder);
      }

      const matchedIds = new Set(
        allFolders.value
          .filter(folder => folder.title.toLowerCase().includes(lowered))
          .map(folder => folder.id)
      );

      const includeIds = new Set(matchedIds);
      const queue = Array.from(matchedIds);
      while (queue.length > 0) {
        const parentId = queue.shift();
        const children = childrenByParent.get(parentId) || [];
        for (const child of children) {
          if (!includeIds.has(child.id)) {
            includeIds.add(child.id);
            queue.push(child.id);
          }
        }
      }

      filteredFolders.value = allFolders.value.filter(folder => includeIds.has(folder.id));
    } else {
      filteredFolders.value = [...allFolders.value];
    }
    Logger.debug(`Number of displayed folders: ${filteredFolders.value.length}`);
  };

  function openSelectedFolder(folderId) {
    const targetId = folderId || selectedFolderId.value;
    if (targetId) {
      Logger.debug(`Folder selected: ${targetId}`);
      window.webviewApi.postMessage({
        type: RequestMessageType.SelectFolder,
        folderId: targetId,
      });
    } else {
      Logger.error('Error: No folder selected');
    }
  };

  function getIndentLevel(folder) {
    let level = 0;
    let currentFolder = folder;
    while (currentFolder.parent_id) {
      level++;
      currentFolder = allFolders.value.find(f => f.id === currentFolder.parent_id);
      if (!currentFolder) break;
    }
    return level;
  };

</script>

<template>
  <div class="h-screen pa-2 flex flex-col overflow-y-auto">
    <!-- Filter text input -->
    <div class="relative mb-2">
      <input
        v-model="filterText"
        type="text"
        placeholder="Notebook name"
        class="w-full pa-2 pr-8 box-border border border-gray-300 rounded"
      />
      <button
        v-if="filterText"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2
              w-5 h-5
              grid place-items-center
              rounded-full
              bg-gray-200 text-gray-500
              hover:bg-gray-300 hover:text-gray-700
              active:scale-90
              transition-all duration-150"
        @click="filterText = ''"
      >
        <span class="i-mdi:window-close text-sm"></span>
      </button>
    </div>

    <!-- Folder tree (buttons) -->
    <div class="w-full flex-1 pa-2 box-border border border-gray-300 rounded overflow-y-auto">
      <div v-if="filteredFolders.length === 0" class="pa-2 text-gray-500">
        {{ allFolders.length === 0 ? 'Loading...' : 'No matching folders' }}
      </div>
      <button
        v-for="folder in filteredFolders"
        :key="folder.id"
        type="button"
        class="w-full text-left pa-1 rounded hover:bg-gray-100"
        :style="{ paddingLeft: `${getIndentLevel(folder) * 16 + 8}px` }"
        @click="openSelectedFolder(folder.id)"
      >
        📁 {{ folder.title }}
      </button>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
</style>
