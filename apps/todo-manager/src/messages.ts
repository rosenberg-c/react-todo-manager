export const MESSAGES = {
  WELCOME: (username: string) => `Welcome, ${username}`,
  BUTTON_LOGOUT: 'Logout',
  CONFIRM_DELETE_USER: (username: string) =>
    `Delete user "${username}" and all related data (todos, lists)?`,
} as const;
