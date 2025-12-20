import { TodosProvider, useBoard } from './contexts/TodosContext';

import { ListProvider, useLists } from './contexts/ListContext';
import { TaskBoard } from './components/TaskBoard';

export const Todos = {
  TodosProvider,
  ListProvider,
  useBoard,
  useLists,
  TaskBoard,
};
