import { describe, it, expect } from 'vitest';

import type { TodoContracts } from '@repo-pak/api-client';
import { getDragOperation, findTodoById } from './dragOperations';

describe('dragOperations', () => {
  describe('getDragOperation', () => {
    const createTodo = (
      id: string,
      listId: string,
      priority: number
    ): TodoContracts.TodoResponseDto => ({
      id,
      title: `Todo ${id}`,
      listId,
      priority,
      userId: 'user1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    describe('cross-list moves', () => {
      it('should return move-list operation when dragging from list-todo to list-inprogress', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const targetColumnTodos: TodoContracts.TodoResponseDto[] = [];

        const operation = getDragOperation(
          draggedTodo,
          'list-inprogress',
          targetColumnTodos
        );

        expect(operation).toEqual({
          type: 'move-list',
          targetListId: 'list-inprogress',
        });
      });

      it('should return move-list operation when dragging from list-inprogress to list-done', () => {
        const draggedTodo = createTodo('1', 'list-inprogress', 100);
        const targetColumnTodos: TodoContracts.TodoResponseDto[] = [];

        const operation = getDragOperation(
          draggedTodo,
          'list-done',
          targetColumnTodos
        );

        expect(operation).toEqual({
          type: 'move-list',
          targetListId: 'list-done',
        });
      });

      it('should return move-list operation when dragging from list-done to list-todo', () => {
        const draggedTodo = createTodo('1', 'list-done', 100);
        const targetColumnTodos: TodoContracts.TodoResponseDto[] = [];

        const operation = getDragOperation(
          draggedTodo,
          'list-todo',
          targetColumnTodos
        );

        expect(operation).toEqual({
          type: 'move-list',
          targetListId: 'list-todo',
        });
      });

      it('should return move-list even when dropIndex is provided for cross-list move', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const targetColumnTodos = [createTodo('2', 'list-inprogress', 200)];

        const operation = getDragOperation(
          draggedTodo,
          'list-inprogress',
          targetColumnTodos,
          0
        );

        expect(operation).toEqual({
          type: 'move-list',
          targetListId: 'list-inprogress',
        });
      });
    });

    describe('within-list reordering', () => {
      it('should return reorder operation when dropping on a valid target in same list', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const targetColumnTodos = [
          createTodo('1', 'list-todo', 100),
          createTodo('2', 'list-todo', 200),
          createTodo('3', 'list-todo', 300),
        ];

        const operation = getDragOperation(
          draggedTodo,
          'list-todo',
          targetColumnTodos,
          1 // Drop on todo with priority 200
        );

        expect(operation).toEqual({
          type: 'reorder',
          targetPriority: 200,
        });
      });

      it('should return reorder operation when dropping on last todo', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const targetColumnTodos = [
          createTodo('1', 'list-todo', 100),
          createTodo('2', 'list-todo', 200),
          createTodo('3', 'list-todo', 300),
        ];

        const operation = getDragOperation(
          draggedTodo,
          'list-todo',
          targetColumnTodos,
          2 // Drop on last todo
        );

        expect(operation).toEqual({
          type: 'reorder',
          targetPriority: 300,
        });
      });
    });

    describe('no operation cases', () => {
      it('should return none when no dropIndex in same list', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const targetColumnTodos = [createTodo('1', 'list-todo', 100)];

        const operation = getDragOperation(
          draggedTodo,
          'list-todo',
          targetColumnTodos
        );

        expect(operation).toEqual({ type: 'none' });
      });

      it('should return none when dropping on itself', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const targetColumnTodos = [
          createTodo('1', 'list-todo', 100),
          createTodo('2', 'list-todo', 200),
        ];

        const operation = getDragOperation(
          draggedTodo,
          'list-todo',
          targetColumnTodos,
          0 // Drop on itself
        );

        expect(operation).toEqual({ type: 'none' });
      });

      it('should return none when target todo does not exist', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const targetColumnTodos = [createTodo('1', 'list-todo', 100)];

        const operation = getDragOperation(
          draggedTodo,
          'list-todo',
          targetColumnTodos,
          5 // Invalid index
        );

        expect(operation).toEqual({ type: 'none' });
      });

      it('should return none when target todo has invalid priority', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const invalidTodo: TodoContracts.TodoResponseDto = {
          id: '2',
          title: 'Invalid Todo',
          listId: 'list-todo',
          priority: null as any, // Invalid priority
          userId: 'user1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        };
        const targetColumnTodos = [draggedTodo, invalidTodo];

        const operation = getDragOperation(
          draggedTodo,
          'list-todo',
          targetColumnTodos,
          1
        );

        expect(operation).toEqual({ type: 'none' });
      });

      it('should return none when dropping in empty list of same listId', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const targetColumnTodos: TodoContracts.TodoResponseDto[] = [];

        const operation = getDragOperation(
          draggedTodo,
          'list-todo',
          targetColumnTodos
        );

        expect(operation).toEqual({ type: 'none' });
      });
    });

    describe('edge cases', () => {
      it('should handle priority of 0', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const targetColumnTodos = [
          draggedTodo,
          createTodo('2', 'list-todo', 0),
        ];

        const operation = getDragOperation(
          draggedTodo,
          'list-todo',
          targetColumnTodos,
          1
        );

        expect(operation).toEqual({
          type: 'reorder',
          targetPriority: 0,
        });
      });

      it('should handle negative priorities', () => {
        const draggedTodo = createTodo('1', 'list-todo', 100);
        const targetColumnTodos = [
          draggedTodo,
          createTodo('2', 'list-todo', -50),
        ];

        const operation = getDragOperation(
          draggedTodo,
          'list-todo',
          targetColumnTodos,
          1
        );

        expect(operation).toEqual({
          type: 'reorder',
          targetPriority: -50,
        });
      });
    });
  });

  describe('findTodoById', () => {
    const createTodo = (id: string): TodoContracts.TodoResponseDto => ({
      id,
      title: `Todo ${id}`,
      listId: 'list-todo',
      priority: 100,
      userId: 'user1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    it('should find a todo by id', () => {
      const todos = [createTodo('1'), createTodo('2'), createTodo('3')];

      const result = findTodoById(todos, '2');

      expect(result).toEqual(todos[1]);
    });

    it('should return undefined if todo not found', () => {
      const todos = [createTodo('1'), createTodo('2')];

      const result = findTodoById(todos, '999');

      expect(result).toBeUndefined();
    });

    it('should return undefined for empty list', () => {
      const todos: TodoContracts.TodoResponseDto[] = [];

      const result = findTodoById(todos, '1');

      expect(result).toBeUndefined();
    });

    it('should find the first matching todo if duplicates exist', () => {
      const todo1 = createTodo('1');
      const todo2 = createTodo('1'); // Duplicate ID
      const todos = [todo1, todo2, createTodo('3')];

      const result = findTodoById(todos, '1');

      expect(result).toBe(todo1); // Should return the first one
    });
  });
});
