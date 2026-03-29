// project
import { Logger } from '../../share/logger';
import { FlatFolder, TreeFolder } from '../../share/types';
import { FolderFilterOptions } from '../components/part/filterSetting/filterType';


/**
 * オプション適用済みのテキストフィルタ
 *
 * @param filterText フィルタ対象文字列
 * @param options フィルタオプション
 * @returns boolean（入力の文字列、オプションに適合する場合true）
 */
function buildTitleMatcher(filterText: string, options: FolderFilterOptions): (title: string) => boolean {
  if (options.regexp) {
    try {
      const pattern = new RegExp(filterText, 'i');
      return (title: string) => pattern.test(title);
    } catch (error) {
      Logger.warn(`Invalid regular expression: ${filterText}`, error);
      return () => false;
    }
  }

  const normalizedFilterText = filterText.toLowerCase();

  if (options.exactMatch) {
    return (title: string) => title.toLowerCase() === normalizedFilterText;
  }

  return (title: string) => title.toLowerCase().includes(normalizedFilterText);
}

export function useFilterFolder() {
  function filterAndFlattenFolders(
    folderTree: TreeFolder[],
    filterText: string,
    options: FolderFilterOptions,
  ): FlatFolder[] {
    const normalizedFilterText = (filterText || '').trim();

    if (!normalizedFilterText) {
      return flattenTree(folderTree);
    }

    const filteredTree = filterTreeByTitle(folderTree, normalizedFilterText, options);
    return flattenTree(filteredTree);
  }

  function filterTreeByTitle(
    nodes: TreeFolder[],
    filterText: string,
    options: FolderFilterOptions,
  ): TreeFolder[] {
    const matches: TreeFolder[] = [];
    const titleMatches = buildTitleMatcher(filterText, options);

    for (const node of nodes) {
      if (titleMatches(node.title)) {
        matches.push(options.noChildren ? { ...node, children: [] } : node);
        continue;
      }

      if (node.children && node.children.length > 0) {
        const childMatches = filterTreeByTitle(node.children, filterText, options);
        if (childMatches.length > 0) {
          matches.push(...childMatches);
        }
      }
    }

    return matches;
  }

  /**
   * pluginから取得したTreeをflattenする（再帰用）
   *
   * @param nodes 元のTreeのリスト
   * @param depth flatten後に記録する用の深さ
   * @param out flatten後のフォルダリスト（再帰用）
   * @returns flatten後のフォルダリスト
   */
  function flattenTree(nodes: TreeFolder[], depth = 0, out: FlatFolder[] = []): FlatFolder[] {
    for (const node of nodes) {
      out.push({ id: node.id, title: node.title, depth, icon: node.icon });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, depth + 1, out);
      }
    }
    return out;
  }

  return {
    filterAndFlattenFolders,
  };
}
