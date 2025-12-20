export const MESSAGES = {
  // Page titles
  PAGE_TITLE: 'User Management',

  // Section titles
  SECTION_LOGIN: 'Login',
  SECTION_CREATE_USER: 'Create User',
  SECTION_USERS: 'Users',

  // Form labels
  LABEL_USERNAME: 'Username',
  LABEL_PASSWORD: 'Password',

  // Form placeholders
  PLACEHOLDER_USERNAME: 'Enter username',
  PLACEHOLDER_PASSWORD: 'Enter password',
  PLACEHOLDER_USERNAME_CREATE: 'Username (3+ characters)',
  PLACEHOLDER_PASSWORD_CREATE: 'Password (8+ characters)',

  // Buttons
  BUTTON_LOGIN: 'Login',
  BUTTON_LOGOUT: 'Logout',
  BUTTON_CREATE_USER: 'Create User',
  BUTTON_CREATING: 'Creating...',
  BUTTON_DELETE: 'Delete',
  BUTTON_DELETING: 'Deleting...',

  // Validation errors
  ERROR_USERNAME_TOO_SHORT: 'Username must be at least 3 characters',
  ERROR_PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  ERROR_CREATE_USER_FAILED: 'Failed to create user',
  ERROR_DELETE_USER_FAILED: 'Failed to delete user',
  ERROR_LOGIN_FAILED: 'Login failed',

  // Status messages
  STATUS_LOGGED_IN_AS: 'Logged in as:',
  STATUS_LOADING: 'Loading...',

  // Empty states
  EMPTY_NO_USERS: 'No users yet. Create one above!',

  // User details
  LABEL_USER_ID: 'ID:',
  LABEL_USER_CREATED: 'Created:',
} as const;
