import { UsersProvider, useUsers } from './contexts/UsersContext';
import { UserManagement } from './components/UserManagement';

export type { UserActions } from './types/userActions';

export const Users = {
  Provider: UsersProvider,
  useUsers,
  Management: UserManagement,
};
