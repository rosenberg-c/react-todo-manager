export const MESSAGES = {
  CONFIRM_DELETE_USER: (username: string) =>
    `Delete user "${username}" and all related data (todos, lists)?`,
} as const;
