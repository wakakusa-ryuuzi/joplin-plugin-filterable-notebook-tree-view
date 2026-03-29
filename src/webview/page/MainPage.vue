<script setup lang="ts">
// vue
import { onMounted, ref, shallowRef, watch } from 'vue';
import { refDebounced } from '@vueuse/core';

// project
import { Logger } from '../../share/logger';
import {
  FlatFolder,
  TreeFolder,
} from '../../share/types';
import { useFilterFolder } from '../composables/useFilterFolder';
import { useFolderMessaging } from '../composables/useFolderMessaging';

import { createFolderFilterOptions, FolderFilterOptions } from '../components/part/filterSetting';
import TextFilter from '../components/part/textFilter/TextFilter.vue';
import FilterSetting from '../components/part/filterSetting/FilterSetting.vue';
import FolderList from '../components/part/folderList/FolderList.vue';
import FolderLoading from '../components/part/folderLoading/FolderLoading.vue';


// === filter option ===

/** フィルタオプション */
const filterOptions = ref<FolderFilterOptions>(createFolderFilterOptions());

watch(filterOptions, () => {
  updateDisplayedFolders();
}, { deep: true });

/** フィルタオプション更新時のハンドラ */
function handleReload(): void {
  Logger.debug(`Reload`);
  requestFolderTree();
  displayedFolders.value = [];
}


// === text filter ===

/** フィルタ（検索）対象文字列 */
const filterText = shallowRef('');

/** デバウンス用、こっちを監視 */
const debouncedFilterText = refDebounced(filterText, 500);

watch(debouncedFilterText, () => {
  updateDisplayedFolders();
});


// === folder ===

/** フォルダツリー（pluginから取得） */
const folderTree = ref<TreeFolder[]>([]);

/** flatten、フィルタ適用後の表示用リスト */
const displayedFolders = ref<FlatFolder[]>([]);

const { filterAndFlattenFolders } = useFilterFolder();
const { registerFolderListListener, requestFolderTree } = useFolderMessaging();



onMounted(() => {
  Logger.debug('Vue component mounted');

  registerFolderListListener((folders) => {
    Logger.debug(`Received message`);
    folderTree.value = folders;
    Logger.debug(`Number of root folders: ${folderTree.value.length}`);
    updateDisplayedFolders();
  });

  requestFolderTree();

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
