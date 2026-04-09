import { Folder, FolderIcon } from '../joplin';
import { TreeFolder } from '../../share/types';
import { Logger } from '../../share/logger';

// TODO: 元から木構造で取れたかもしれない…

/**
 * Folder配列を、再帰的に探索し、TreeFolder型に変換
 *
 * @param folders フラットなフォルダ配列（joplinから取れる型）
 * @returns Tree化したフォルダ
 */
export function toTreeFolderTree(folders: Folder[]): TreeFolder[] {
  const folderTree = buildFolderTree(folders);
  const result: TreeFolder[] = [];

  for (const node of folderTree) {
    const converted = toTreeFolder(node);
    if (converted) {
      result.push(converted);
    }
  }

  return result;
}

/**
 * フラットなフォルダ配列を、ツリー構造に変換する（構造変換）
 *
 * @param folders フラットなフォルダ配列（joplinから取れる型）
 * @returns ツリー構造のフォルダ配列
 */
function buildFolderTree(folders: Folder[]): Folder[] {
  const nodesById = new Map<string, Folder>();
  const roots: Folder[] = [];

  for (const folder of folders) {
    nodesById.set(folder.id, { ...folder, children: [] });
  }

  for (const folder of folders) {
    const node = nodesById.get(folder.id);
    if (!node) {
      continue;
    }

    if (folder.parent_id && nodesById.has(folder.parent_id)) {
      const parent = nodesById.get(folder.parent_id);
      parent?.children?.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * ツリー構造のフォルダ配列を、TreeFolder型に変換（型変換）
 *
 * @param node フォルダノード（buildFolderTreeで作成したアイテムアイテム）
 * @returns 引数の子以下のツリー（子がいない場合null）
 */
function toTreeFolder(node: Folder): TreeFolder | null {
  if (!node.id || !node.title) {
    Logger.warn('Skipping folder with missing id or title', { id: node.id, title: node.title });
    return null;
  }

  const children: TreeFolder[] = [];
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const converted = toTreeFolder(child);
      if (converted) {
        children.push(converted);
      }
    }
  }

  return {
    id: node.id,
    title: node.title,
    icon: extractFolderIcon(node.icon),
    parent_id: node.parent_id,
    children,
  };
}

/**
 * アイコン指定文字列をアイコンに変換
 *
 * @description Joplinから取れるicon情報はJson文字列の為、パースして変換
 *
 * @param icon JSON文字列で表現されたフォルダアイコン
 * @returns 抽出された絵文字、または解析に失敗した場合はundefined
 */
function extractFolderIcon(icon?: string): string | undefined {
  if (!icon) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(icon) as FolderIcon | string;
    if (typeof parsed === 'string') {
      return parsed;
    }
    if (parsed && typeof parsed === 'object' && typeof parsed.emoji === 'string') {
      return parsed.emoji;
    }
  } catch (error) {
    Logger.warn('Failed to parse folder icon JSON', { icon, error });
  }

  return undefined;
}
