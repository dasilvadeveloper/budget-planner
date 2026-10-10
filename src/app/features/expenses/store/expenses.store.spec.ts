import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ExpensesStore } from './expenses.store';
import { ExpensesApi } from '../services/expenses-api';
import { Expense, ExpenseCategory, ExpenseStatus, ExpenseType } from '../models/expense.model';

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: 1,
    name: 'Despesa',
    amount: 10,
    category: ExpenseCategory.Other,
    type: ExpenseType.OneTime,
    date: '2026-09-10',
    status: ExpenseStatus.Pending,
    notes: null,
    ...overrides,
  };
}

describe('ExpensesStore', () => {
  it('keeps expenses without a date visible regardless of the selected period', async () => {
    const inRange = makeExpense({ id: 1, date: '2026-09-10' });
    const outOfRange = makeExpense({ id: 2, date: '2026-01-01' });
    const withoutDate = makeExpense({ id: 3, date: '' });

    const service = TestBed.inject(ExpensesApi);
    vi.spyOn(service, 'fetchExpenses').mockResolvedValue([inRange, outOfRange, withoutDate]);

    const store = TestBed.inject(ExpensesStore);
    await store.loadExpenses();
    store.setDateRange('2026-09-01', '2026-09-30');

    const period = store.expensesForPeriod();
    expect(period).toContain(inRange);
    expect(period).toContain(withoutDate);
    expect(period).not.toContain(outOfRange);
  });

  it('filters expenses by the selected statuses and categories', async () => {
    const paidHousing = makeExpense({ id: 1, status: ExpenseStatus.Paid, category: ExpenseCategory.Housing });
    const pendingFood = makeExpense({ id: 2, status: ExpenseStatus.Pending, category: ExpenseCategory.Food });

    const service = TestBed.inject(ExpensesApi);
    vi.spyOn(service, 'fetchExpenses').mockResolvedValue([paidHousing, pendingFood]);

    const store = TestBed.inject(ExpensesStore);
    await store.loadExpenses();
    store.setDateRange('2026-09-01', '2026-09-30');

    store.setStatuses([ExpenseStatus.Paid]);
    store.setCategories([ExpenseCategory.Housing, ExpenseCategory.Food]);
    expect(store.expensesForPeriod()).toEqual([paidHousing]);

    store.setStatuses([ExpenseStatus.Paid, ExpenseStatus.Pending]);
    store.setCategories([]);
    expect(store.expensesForPeriod()).toEqual([]);
  });
});
