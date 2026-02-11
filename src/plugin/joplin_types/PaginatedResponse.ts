/**
 * Joplin API paginated response type
 * Based on: https://joplinapp.org/help/api/references/rest_api/#pagination
 */
export interface PaginatedResponse<T> {
  /** The array of items requested */
  items: T[];

  /** If true, there are more items after this page. If false, you have reached the end of the data set. */
  has_more: boolean;
}
