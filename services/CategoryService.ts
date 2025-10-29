import { Task, TaskCategory, CategoryMeta } from '@/types';

export class CategoryService {
  static updateCategory(
    categories: Record<TaskCategory, CategoryMeta>,
    category: TaskCategory,
    updates: Partial<CategoryMeta>
  ): Record<TaskCategory, CategoryMeta> {
    console.log(`[CategoryService] Updating category ${category}:`, updates);
    
    return {
      ...categories,
      [category]: {
        ...categories[category],
        ...updates,
      },
    };
  }

  static reassign(
    tasks: Task[],
    oldCategory: TaskCategory,
    newCategory: TaskCategory
  ): Task[] {
    console.log(
      `[CategoryService] Reassigning tasks from ${oldCategory} to ${newCategory}`
    );
    
    return tasks.map((task) => {
      if (task.category === oldCategory) {
        return {
          ...task,
          category: newCategory,
        };
      }
      return task;
    });
  }

  static isInUse(tasks: Task[], category: TaskCategory): boolean {
    return tasks.some((task) => task.category === category);
  }

  static getUsageCount(tasks: Task[], category: TaskCategory): number {
    return tasks.filter((task) => task.category === category).length;
  }
}
