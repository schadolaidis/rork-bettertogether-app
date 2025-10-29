import { List, CategoryMeta } from '@/types';

export interface ListSettingsPayload {
  name?: string;
  currency?: string;
  currencySymbol?: string;
  defaultGraceMinutes?: number;
  defaultStakeCents?: number;
  allowMemberCategoryManage?: boolean;
}

export class ListService {
  static updateSettings(list: List, payload: ListSettingsPayload): List {
    console.log(`[ListService] Updating list ${list.id} with:`, payload);
    
    return {
      ...list,
      ...payload,
    };
  }

  static createList(
    name: string,
    ownerId: string,
    categories: CategoryMeta[],
    currency: string,
    currencySymbol: string
  ): List {
    const newList: List = {
      id: `list-${Date.now()}`,
      name,
      ownerId,
      memberIds: [ownerId],
      categories,
      currency,
      currencySymbol,
      defaultGraceMinutes: 30,
      defaultStakeCents: 500,
      allowMemberCategoryManage: false,
      createdAt: new Date().toISOString(),
    };
    
    console.log('[ListService] Created new list:', newList.id);
    return newList;
  }

  static archiveList(list: List): List {
    console.log(`[ListService] Archiving list ${list.id}`);
    return {
      ...list,
      archived: true,
    };
  }

  static validate(payload: ListSettingsPayload): { valid: boolean; error?: string } {
    if (payload.defaultGraceMinutes !== undefined && payload.defaultGraceMinutes < 0) {
      return { valid: false, error: 'Grace period must be 0 or greater' };
    }
    
    if (payload.defaultStakeCents !== undefined && payload.defaultStakeCents < 0) {
      return { valid: false, error: 'Default stake must be 0 or greater' };
    }
    
    if (payload.name !== undefined && payload.name.trim().length === 0) {
      return { valid: false, error: 'List name cannot be empty' };
    }
    
    return { valid: true };
  }
}
