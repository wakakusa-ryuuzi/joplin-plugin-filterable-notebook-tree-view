<script setup lang="ts">
  import { onMounted, ref, shallowRef, watch } from 'vue';

  import { refDebounced } from '@vueuse/core'

  import { Logger } from '../../share/logger';
  import { NotifyMessageType, RequestMessageType, TreeFolder } from '../../share/types';

  type FlatFolder = { id: string; title: string; depth: number };

  const folderTree = ref<TreeFolder[]>([]);
  const displayedFolders = ref<FlatFolder[]>([]);

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
          folderTree.value = messagePayload.folders || [];
          Logger.debug(`Number of root folders: ${folderTree.value.length}`);
          Logger.debug('Received folder tree:', folderTree.value);
          filterAndDisplayFolders(debouncedFilterText.value);
        }
    });

    Logger.debug('Vue initialization complete');
  });

  watch(debouncedFilterText, (nextValue) => {
    Logger.debug(`Applying filter: "${nextValue}"`);
    filterAndDisplayFolders(nextValue);
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
      out.push({ id: node.id, title: node.title, depth });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, depth + 1, out);
      }
    }
    return out;
  }

</script>

<template>
  <div class="h-screen pa-2 flex flex-col overflow-y-auto">

    <!-- Filter text input -->
    <div class="relative mb-2">
      <!-- input -->
      <input
        v-model="filterText"
        type="text"
        placeholder="Notebook name"
        class="w-full pa-2 pl-4 pr-8 box-border border rounded border-[var(--joplin-color)] active:border-[var(--joplin-color-active)]"
      />
      <!-- x button -->
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
    <div class="w-full flex-1 pa-2 box-border border border-[var(--joplin-color)] rounded overflow-y-auto">
      <div v-if="displayedFolders.length === 0" class="py-1 px-2">
        {{ folderTree.length === 0 ? 'Loading...' : 'No matching folders' }}
      </div>
      <button
        v-for="folder in displayedFolders"
        :key="folder.id"
        type="button"
        class="w-full text-left py-1 rounded hover:bg-[var(--joplin-background-hover)]"
        :style="{ paddingLeft: `${folder.depth * 16 + 8}px` }"
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
