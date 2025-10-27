import { LedgerEntry, Task } from '@/types';
import { ClockService } from './ClockService';

export class LedgerService {
  static post(task: Task): LedgerEntry {
    const now = ClockService.getCurrentTime();
    const month = ClockService.getCurrentMonth();

    const entry: LedgerEntry = {
      id: `ledger-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: task.assignedTo,
      taskId: task.id,
      taskTitle: task.title,
      listId: task.listId,
      amount: task.stake,
      date: now.toISOString(),
      month,
      fundTargetId: task.fundTargetId,
    };

    console.log('[LedgerService] Posted entry:', entry);
    return entry;
  }

  static reverse(ledgerEntryId: string, entries: LedgerEntry[]): LedgerEntry[] {
    console.log('[LedgerService] Reversing entry:', ledgerEntryId);
    return entries.filter((e) => e.id !== ledgerEntryId);
  }

  static getMonthlyEntries(
    entries: LedgerEntry[],
    month: string,
    listId: string
  ): LedgerEntry[] {
    return entries.filter((e) => e.month === month && e.listId === listId);
  }

  static getUserMonthlyTotal(
    entries: LedgerEntry[],
    userId: string,
    month: string,
    listId: string
  ): number {
    return entries
      .filter((e) => e.userId === userId && e.month === month && e.listId === listId)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  static getFundTargetEntries(
    entries: LedgerEntry[],
    fundTargetId: string
  ): LedgerEntry[] {
    return entries.filter((e) => e.fundTargetId === fundTargetId);
  }

  static getFundTargetTotal(
    entries: LedgerEntry[],
    fundTargetId: string
  ): number {
    return entries
      .filter((e) => e.fundTargetId === fundTargetId)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  static getEntriesByList(
    entries: LedgerEntry[],
    listId: string
  ): LedgerEntry[] {
    return entries.filter((e) => e.listId === listId);
  }
}
