import { UsersProvider, useUsers } from './contexts/UsersContext';
import { UserManagement } from './components/UserManagement';

export const Users = {
  Provider: UsersProvider,
  useUsers,
  Management: UserManagement,
};
