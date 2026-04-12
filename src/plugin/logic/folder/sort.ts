import { Folder } from '../../joplin';

import { FolderSortOrder, FolderSortOrderField } from '../../../share/types';

export function sortFolderTreeByOrder(
  roots: Folder[],
  sortOrder?: FolderSortOrder,
  lastNoteUpdatedByFolderId?: Record<string, number>,
): void {
  const effectiveLastUpdatedByFolderId =
    sortOrder?.field === FolderSortOrderField.LastNoteUserUpdatedTime
      ? buildEffectiveLastUpdatedMap(roots, lastNoteUpdatedByFolderId)
      : undefined;

  sortFoldersByOrder(roots, sortOrder, effectiveLastUpdatedByFolderId);
  for (const root of roots) {
    sortChildrenRecursively(root, sortOrder, effectiveLastUpdatedByFolderId);
  }
}

function sortChildrenRecursively(
  node: Folder,
  sortOrder?: FolderSortOrder,
  effectiveLastUpdatedByFolderId?: Record<string, number>,
): void {
  if (!node.children || node.children.length === 0) {
    return;
  }

  sortFoldersByOrder(node.children, sortOrder, effectiveLastUpdatedByFolderId);

  for (const child of node.children) {
    sortChildrenRecursively(child, sortOrder, effectiveLastUpdatedByFolderId);
  }
}

function sortFoldersByOrder(
  folders: Folder[],
  sortOrder?: FolderSortOrder,
  effectiveLastUpdatedByFolderId?: Record<string, number>,
): void {
  folders.sort((a, b) => compareFolders(a, b, sortOrder, effectiveLastUpdatedByFolderId));
}

function compareFolders(
  a: Folder,
  b: Folder,
  sortOrder?: FolderSortOrder,
  effectiveLastUpdatedByFolderId?: Record<string, number>,
): number {
  const order = sortOrder ?? {
    field: FolderSortOrderField.Title,
    reverse: false,
  };

  let result = 0;

  if (order.field === FolderSortOrderField.CreatedTime) {
    result = compareNumber(a.created_time, b.created_time);
  } else if (order.field === FolderSortOrderField.LastNoteUserUpdatedTime) {
    const left = effectiveLastUpdatedByFolderId?.[a.id] ?? a.user_updated_time ?? a.updated_time;
    const right = effectiveLastUpdatedByFolderId?.[b.id] ?? b.user_updated_time ?? b.updated_time;
    result = compareNumber(left, right);
  } else if (order.field === FolderSortOrderField.UpdatedTime) {
    result = compareNumber(a.updated_time, b.updated_time);
  } else {
    result = (a.title ?? '').localeCompare(b.title ?? '', undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  if (result === 0) {
    result = (a.id ?? '').localeCompare(b.id ?? '');
  }

  return order.reverse ? -result : result;
}

function compareNumber(a?: number, b?: number): number {
  const left = typeof a === 'number' ? a : 0;
  const right = typeof b === 'number' ? b : 0;
  return left - right;
}

function buildEffectiveLastUpdatedMap(
  roots: Folder[],
  lastNoteUpdatedByFolderId?: Record<string, number>,
): Record<string, number> {
  const map: Record<string, number> = {};

  const visit = (node: Folder): number => {
    const selfTime = lastNoteUpdatedByFolderId?.[node.id] ?? node.user_updated_time ?? node.updated_time ?? 0;
    let effectiveTime = selfTime;

    for (const child of node.children ?? []) {
      const childEffective = visit(child);
      if (childEffective > effectiveTime) {
        effectiveTime = childEffective;
      }
    }

    map[node.id] = effectiveTime;
    return effectiveTime;
  };

  for (const root of roots) {
    visit(root);
  }

  return map;
}
