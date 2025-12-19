import type { ListContracts } from '@repo-pak/api-client';
import type { TodoContracts } from '@repo-pak/api-client';

/**
 * Sort options for todos
 */
export type SortOption =
  | 'priority'
  | 'createdAt-desc'
  | 'createdAt-asc'
  | 'title-asc'
  | 'title-desc'
  | 'updatedAt-desc';

/**
 * Sort todos by priority (highest first)
 */
export const sortByPriority = (
  a: TodoContracts.TodoResponseDto,
  b: TodoContracts.TodoResponseDto
): number => {
  return b.priority - a.priority;
};

/**
 * Group todos by list and sort each group by priority
 */
export const groupTodosByList = (
  todos: TodoContracts.TodoResponseDto[],
  lists: ListContracts.ListResponseDto[]
): Record<string, TodoContracts.TodoResponseDto[]> => {
  const grouped: Record<string, TodoContracts.TodoResponseDto[]> = {};

  // Initialize empty arrays for all lists
  lists.forEach((list) => {
    grouped[list.id] = [];
  });

  // Group todos by listId
  todos.forEach((todo) => {
    if (todo.listId && grouped[todo.listId]) {
      grouped[todo.listId].push(todo);
    }
  });

  // Sort each group by priority
  Object.keys(grouped).forEach((listId) => {
    grouped[listId].sort(sortByPriority);
  });

  return grouped;
};

/**
 * Sort todos by selected option
 */
export const sortTodos = (
  todos: TodoContracts.TodoResponseDto[],
  sortBy: SortOption
): TodoContracts.TodoResponseDto[] => {
  const sorted = [...todos];

  switch (sortBy) {
    case 'priority':
      return sorted.sort((a, b) => b.priority - a.priority);
    case 'createdAt-desc':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'createdAt-asc':
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'updatedAt-desc':
      return sorted.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    default:
      return sorted;
  }
};

/**
 * Filter todos by search query (searches title only)
 */
export const filterTodos = (
  todos: TodoContracts.TodoResponseDto[],
  searchQuery: string
): TodoContracts.TodoResponseDto[] => {
  if (!searchQuery.trim()) return todos;

  const query = searchQuery.toLowerCase();
  return todos.filter((todo) => todo.title.toLowerCase().includes(query));
};
