import type { TodoContracts } from '@repo-pak/api-client';

export type DragOperation =
  | { type: 'move-list'; targetListId: string }
  | { type: 'reorder'; targetPriority: number }
  | { type: 'none' };

/**
 * Determine what operation should be performed when a todo is dropped
 * @param draggedTodo The todo being dragged
 * @param targetListId The list where it's being dropped
 * @param targetListTodos All todos in the target list
 * @param dropIndex The index where it's being dropped (undefined if dropped on empty space)
 * @returns The operation to perform
 */
export const getDragOperation = (
  draggedTodo: TodoContracts.TodoResponseDto,
  targetListId: string,
  targetListTodos: TodoContracts.TodoResponseDto[],
  dropIndex?: number
): DragOperation => {
  // If moving to a different list, perform a list move
  if (draggedTodo.listId !== targetListId) {
    return { type: 'move-list', targetListId };
  }

  // If no drop index specified, no operation needed (dropped in same list, no specific target)
  if (dropIndex === undefined) {
    return { type: 'none' };
  }

  // Reordering within the same list
  const targetTodo = targetListTodos[dropIndex];

  // Validate target todo exists, is different from dragged todo, and has a valid priority
  if (
    !targetTodo ||
    targetTodo.id === draggedTodo.id ||
    typeof targetTodo.priority !== 'number'
  ) {
    return { type: 'none' };
  }

  return { type: 'reorder', targetPriority: targetTodo.priority };
};

/**
 * Find a todo by ID in a list of todos
 * @param todos List of todos to search
 * @param todoId ID of the todo to find
 * @returns The found todo or undefined
 */
export const findTodoById = (
  todos: TodoContracts.TodoResponseDto[],
  todoId: string
): TodoContracts.TodoResponseDto | undefined => {
  return todos.find((t) => t.id === todoId);
};
