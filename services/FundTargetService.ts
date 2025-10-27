import { FundTarget } from '@/types';

export class FundTargetService {
  static create(
    listId: string,
    name: string,
    emoji: string,
    description?: string
  ): FundTarget {
    const fundTarget: FundTarget = {
      id: `fund-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      listId,
      name,
      emoji,
      description,
      totalCollectedCents: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    console.log('[FundTargetService] Created fund target:', fundTarget);
    return fundTarget;
  }

  static update(
    fundTarget: FundTarget,
    updates: Partial<Omit<FundTarget, 'id' | 'listId' | 'createdAt' | 'totalCollectedCents'>>
  ): FundTarget {
    const updated = {
      ...fundTarget,
      ...updates,
    };

    console.log('[FundTargetService] Updated fund target:', updated);
    return updated;
  }

  static addAmount(fundTarget: FundTarget, amountCents: number): FundTarget {
    const updated = {
      ...fundTarget,
      totalCollectedCents: fundTarget.totalCollectedCents + amountCents,
    };

    console.log('[FundTargetService] Added amount to fund target:', {
      id: fundTarget.id,
      amount: amountCents,
      newTotal: updated.totalCollectedCents,
    });
    return updated;
  }

  static archive(fundTarget: FundTarget): FundTarget {
    const archived = {
      ...fundTarget,
      isActive: false,
    };

    console.log('[FundTargetService] Archived fund target:', archived.id);
    return archived;
  }

  static getByList(fundTargets: FundTarget[], listId: string): FundTarget[] {
    return fundTargets.filter((ft) => ft.listId === listId && ft.isActive);
  }

  static getActiveCount(fundTargets: FundTarget[], listId: string): number {
    return fundTargets.filter((ft) => ft.listId === listId && ft.isActive).length;
  }

  static getTotalCollected(fundTargets: FundTarget[], listId: string): number {
    return fundTargets
      .filter((ft) => ft.listId === listId && ft.isActive)
      .reduce((sum, ft) => sum + ft.totalCollectedCents, 0);
  }

  static validate(name: string, emoji: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Name is required' };
    }

    if (name.length > 50) {
      return { valid: false, error: 'Name must be 50 characters or less' };
    }

    if (!emoji || emoji.trim().length === 0) {
      return { valid: false, error: 'Emoji is required' };
    }

    return { valid: true };
  }
}
