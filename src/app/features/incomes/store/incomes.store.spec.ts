import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { IncomesStore } from './incomes.store';
import { IncomesApi } from '../services/incomes-api';
import { Income, IncomeCategory, IncomeStatus, IncomeType } from '../models/income.model';

function makeIncome(overrides: Partial<Income>): Income {
  return {
    id: 1,
    name: 'Rendimento',
    amount: 10,
    category: IncomeCategory.Other,
    type: IncomeType.OneTime,
    date: '2026-09-10',
    status: IncomeStatus.Pending,
    notes: null,
    ...overrides,
  };
}

describe('IncomesStore', () => {
  it('keeps incomes without a date visible regardless of the selected period', async () => {
    const inRange = makeIncome({ id: 1, date: '2026-09-10' });
    const outOfRange = makeIncome({ id: 2, date: '2026-01-01' });
    const withoutDate = makeIncome({ id: 3, date: '' });

    const service = TestBed.inject(IncomesApi);
    vi.spyOn(service, 'fetchIncomes').mockResolvedValue([inRange, outOfRange, withoutDate]);

    const store = TestBed.inject(IncomesStore);
    await store.loadIncomes();
    store.setDateRange('2026-09-01', '2026-09-30');

    const period = store.incomesForPeriod();
    expect(period).toContain(inRange);
    expect(period).toContain(withoutDate);
    expect(period).not.toContain(outOfRange);
  });

  it('filters incomes by the selected statuses and categories', async () => {
    const paidSalary = makeIncome({ id: 1, status: IncomeStatus.Paid, category: IncomeCategory.Salary });
    const pendingSales = makeIncome({ id: 2, status: IncomeStatus.Pending, category: IncomeCategory.Sales });

    const service = TestBed.inject(IncomesApi);
    vi.spyOn(service, 'fetchIncomes').mockResolvedValue([paidSalary, pendingSales]);

    const store = TestBed.inject(IncomesStore);
    await store.loadIncomes();
    store.setDateRange('2026-09-01', '2026-09-30');

    store.setStatuses([IncomeStatus.Paid]);
    store.setCategories([IncomeCategory.Salary, IncomeCategory.Sales]);
    expect(store.incomesForPeriod()).toEqual([paidSalary]);

    store.setStatuses([IncomeStatus.Paid, IncomeStatus.Pending]);
    store.setCategories([]);
    expect(store.incomesForPeriod()).toEqual([]);
  });

  it('markIncomeAsPaid only changes the status of the targeted income', async () => {
    const target = makeIncome({ id: 1, status: IncomeStatus.Pending });
    const other = makeIncome({ id: 2, status: IncomeStatus.Pending });

    const service = TestBed.inject(IncomesApi);
    vi.spyOn(service, 'fetchIncomes').mockResolvedValue([target, other]);
    vi.spyOn(service, 'editIncome').mockImplementation(async (income) => income);

    const store = TestBed.inject(IncomesStore);
    await store.loadIncomes();
    await store.markIncomeAsPaid(1);

    const updated = store.incomes().find((i) => i.id === 1);
    const untouched = store.incomes().find((i) => i.id === 2);
    expect(updated?.status).toBe(IncomeStatus.Paid);
    expect(untouched?.status).toBe(IncomeStatus.Pending);
  });
});
