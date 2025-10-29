import { Task, CategoryMeta } from '@/types';

export class CategoryService {
  static updateCategory(
    categories: CategoryMeta[],
    categoryId: string,
    updates: Partial<Omit<CategoryMeta, 'id' | 'createdAt' | 'isDefault'>>
  ): CategoryMeta[] {
    console.log(`[CategoryService] Updating category ${categoryId}:`, updates);
    
    return categories.map((cat) =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    );
  }

  static addCategory(
    categories: CategoryMeta[],
    category: Omit<CategoryMeta, 'createdAt'>
  ): CategoryMeta[] {
    console.log(`[CategoryService] Adding new category:`, category);
    
    const newCategory: CategoryMeta = {
      ...category,
      createdAt: new Date().toISOString(),
    };
    
    return [...categories, newCategory];
  }

  static deleteCategory(
    categories: CategoryMeta[],
    categoryId: string
  ): CategoryMeta[] {
    console.log(`[CategoryService] Deleting category ${categoryId}`);
    
    return categories.filter((cat) => cat.id !== categoryId);
  }

  static getCategoryById(
    categories: CategoryMeta[],
    categoryId: string
  ): CategoryMeta | undefined {
    return categories.find((cat) => cat.id === categoryId);
  }

  static reassign(
    tasks: Task[],
    oldCategoryId: string,
    newCategoryId: string
  ): Task[] {
    console.log(
      `[CategoryService] Reassigning tasks from ${oldCategoryId} to ${newCategoryId}`
    );
    
    return tasks.map((task) => {
      if (task.category === oldCategoryId) {
        return {
          ...task,
          category: newCategoryId,
        };
      }
      return task;
    });
  }

  static isInUse(tasks: Task[], categoryId: string): boolean {
    return tasks.some((task) => task.category === categoryId);
  }

  static getUsageCount(tasks: Task[], categoryId: string): number {
    return tasks.filter((task) => task.category === categoryId).length;
  }
}
