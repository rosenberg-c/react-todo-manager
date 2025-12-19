export { ApiClient } from './client/ApiClient';

export { API_CONFIG } from './config/config';

export { ApiError, handleApiError } from './client/errorHandler';

export * as UserContracts from './generated/users/data-contracts';
export { Users as UsersApi } from './generated/users/Users';

export * as TodoContracts from './generated/todos/data-contracts';
export { Todos as TodosApi } from './generated/todos/Todos';

export * as ListContracts from './generated/todos/data-contracts';
export { Lists as ListsApi } from './generated/todos/Lists';
