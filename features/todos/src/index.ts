import { BoardProvider, useBoard } from './contexts/TodosContext';

import { ListProvider, useLists } from './contexts/ListContext';
import { TaskBoard } from './components/TaskBoard';

export const Todos = {
  BoardProvider,
  ListProvider,
  useBoard,
  useLists,
  TaskBoard,
};
