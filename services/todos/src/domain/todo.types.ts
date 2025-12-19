export interface Todo {
  id: string;
  title: string;
  description?: string;
  listId?: string;
  priority: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
