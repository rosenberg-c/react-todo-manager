export interface UserActions {
  confirmDeleteMessage: (username: string) => string;
  cleanupUserData: (userId: string) => Promise<void>;
}
