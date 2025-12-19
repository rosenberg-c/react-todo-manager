export const MESSAGES = {
  // Page titles
  PAGE_TITLE: 'Task Manager',
  PAGE_SUBTITLE: 'Organize your tasks with custom lists',

  // Form labels and placeholders
  PLACEHOLDER_TASK_TITLE: 'Task title...',
  PLACEHOLDER_TASK_DESCRIPTION: 'Description (optional)...',
  PLACEHOLDER_SEARCH: 'Search tasks...',

  // Buttons
  BUTTON_ADD_TASK: '+ Add Task',
  BUTTON_ADD_TASK_SHORT: 'Add Task',
  BUTTON_ADDING: 'Adding...',
  BUTTON_CANCEL: 'Cancel',
  BUTTON_DELETE: 'Delete',

  // Status messages
  STATUS_LOADING: 'Loading your tasks...',

  // Empty states
  EMPTY_ADD_TASK: 'Add task',
  EMPTY_NO_TASKS: 'No tasks yet',

  // Confirmations
  CONFIRM_DELETE_TASK: 'Are you sure you want to delete this task?',
  CONFIRM_DELETE_LIST: 'Are you sure you want to delete this list?',

  // Sort labels
  SORT_LABEL: 'Sort by:',
  SORT_MANUAL: 'Manual Order',
  SORT_NEWEST: 'Newest First',
  SORT_OLDEST: 'Oldest First',
  SORT_TITLE_ASC: 'A-Z',
  SORT_TITLE_DESC: 'Z-A',
  SORT_UPDATED: 'Recently Updated',

  // Error messages
  ERROR_ADD_TODO_FAILED: 'Failed to add todo:',
  ERROR_DELETE_LIST_WITH_TASKS:
    'Cannot delete list with tasks. Please move or delete tasks first.',
} as const;
