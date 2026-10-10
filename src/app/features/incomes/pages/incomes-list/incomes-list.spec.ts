import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSelectChange } from '@angular/material/select';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateTime } from 'luxon';
import { vi } from 'vitest';

import { IncomesList } from './incomes-list';
import { IncomeCategory, IncomeStatus } from '../../models/income.model';

function datepickerEvent(isoDate: string): MatDatepickerInputEvent<DateTime> {
  return { value: DateTime.fromISO(isoDate) } as MatDatepickerInputEvent<DateTime>;
}

function selectChangeEvent(value: unknown): MatSelectChange {
  return { value } as MatSelectChange;
}

describe('IncomesList', () => {
  let component: IncomesList;
  let fixture: ComponentFixture<IncomesList>;
  let router: Router;

  async function setup(queryParams: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [IncomesList],
      providers: [
        provideLuxonDateAdapter(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
      ],
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(IncomesList);
    component = fixture.componentInstance;
    vi.spyOn(component.incomesStore, 'loadIncomes').mockResolvedValue();
    await fixture.whenStable();
  }

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('defaults to the current month and all statuses/categories, and syncs the URL when there are no query params', async () => {
    await setup();

    const now = DateTime.now();
    expect(component.pendingStartDate()).toBe(now.startOf('month').toISODate());
    expect(component.pendingEndDate()).toBe(now.endOf('month').toISODate());
    expect(component.pendingStatuses()).toEqual(component.allStatuses);
    expect(component.pendingCategories()).toEqual(component.allCategories);
    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: {
          startDate: component.pendingStartDate(),
          endDate: component.pendingEndDate(),
          status: component.allStatuses.join(','),
          category: component.allCategories.join(','),
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
    );
  });

  it('uses valid dates from the URL, taking priority over the default range', async () => {
    await setup({ startDate: '2026-02-01', endDate: '2026-02-15' });

    expect(component.pendingStartDate()).toBe('2026-02-01');
    expect(component.pendingEndDate()).toBe('2026-02-15');
    expect(component.incomesStore.selectedDateRange()).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-02-15',
    });
  });

  it('ignores an invalid range in the URL (start after end) and falls back to the default', async () => {
    await setup({ startDate: '2026-02-15', endDate: '2026-02-01' });

    const now = DateTime.now();
    expect(component.pendingStartDate()).toBe(now.startOf('month').toISODate());
    expect(component.pendingEndDate()).toBe(now.endOf('month').toISODate());
  });

  it('ignores malformed dates in the URL and falls back to the default', async () => {
    await setup({ startDate: 'not-a-date', endDate: 'also-not-a-date' });

    const now = DateTime.now();
    expect(component.pendingStartDate()).toBe(now.startOf('month').toISODate());
    expect(component.pendingEndDate()).toBe(now.endOf('month').toISODate());
    expect(component.incomesStore.selectedDateRange()).toEqual({
      startDate: now.startOf('month').toISODate(),
      endDate: now.endOf('month').toISODate(),
    });
  });

  it('uses valid statuses/categories from the URL, taking priority over the default', async () => {
    await setup({ status: IncomeStatus.Paid, category: IncomeCategory.Sales });

    expect(component.pendingStatuses()).toEqual([IncomeStatus.Paid]);
    expect(component.pendingCategories()).toEqual([IncomeCategory.Sales]);
    expect(component.incomesStore.selectedStatuses()).toEqual([IncomeStatus.Paid]);
    expect(component.incomesStore.selectedCategories()).toEqual([IncomeCategory.Sales]);
  });

  it('treats an explicitly empty status/category param as "none selected" rather than the default', async () => {
    await setup({ status: '', category: '' });

    expect(component.pendingStatuses()).toEqual([]);
    expect(component.pendingCategories()).toEqual([]);
    expect(component.incomesStore.selectedStatuses()).toEqual([]);
    expect(component.incomesStore.selectedCategories()).toEqual([]);
  });

  it('falls back to all statuses/categories when the URL values are all invalid', async () => {
    await setup({ status: 'not-a-status', category: 'not-a-category' });

    expect(component.pendingStatuses()).toEqual(component.allStatuses);
    expect(component.pendingCategories()).toEqual(component.allCategories);
  });

  it('ignores invalid entries mixed with valid ones from the URL', async () => {
    await setup({ status: `${IncomeStatus.Paid},bogus` });

    expect(component.pendingStatuses()).toEqual([IncomeStatus.Paid]);
  });

  it('does not update the store until applyFilters is called', async () => {
    await setup();

    const initialRange = component.incomesStore.selectedDateRange();
    component.pendingStartDate.set('2026-01-01');
    component.pendingEndDate.set('2026-01-31');

    expect(component.incomesStore.selectedDateRange()).toEqual(initialRange);

    component.applyFilters();

    expect(component.incomesStore.selectedDateRange()).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });
    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({ startDate: '2026-01-01', endDate: '2026-01-31' }),
      }),
    );
  });

  it('updates the pending dates from datepicker selection events', async () => {
    await setup();

    component.onStartDateChange(datepickerEvent('2026-05-01'));
    component.onEndDateChange(datepickerEvent('2026-05-31'));

    expect(component.pendingStartDate()).toBe('2026-05-01');
    expect(component.pendingEndDate()).toBe('2026-05-31');
  });

  it('does not apply an invalid range (start after end)', async () => {
    await setup();

    const initialRange = component.incomesStore.selectedDateRange();
    component.pendingStartDate.set('2026-03-31');
    component.pendingEndDate.set('2026-03-01');

    expect(component.isDateRangeInvalid()).toBe(true);

    vi.mocked(router.navigate).mockClear();
    component.applyFilters();

    expect(component.incomesStore.selectedDateRange()).toEqual(initialRange);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('updates pending statuses/categories from select change events, applying only on applyFilters', async () => {
    await setup();

    component.onStatusSelectionChange(selectChangeEvent([IncomeStatus.Pending]));
    component.onCategorySelectionChange(selectChangeEvent([IncomeCategory.Salary, IncomeCategory.Sales]));

    expect(component.pendingStatuses()).toEqual([IncomeStatus.Pending]);
    expect(component.pendingCategories()).toEqual([IncomeCategory.Salary, IncomeCategory.Sales]);
    expect(component.incomesStore.selectedStatuses()).toEqual(component.allStatuses);

    component.applyFilters();

    expect(component.incomesStore.selectedStatuses()).toEqual([IncomeStatus.Pending]);
    expect(component.incomesStore.selectedCategories()).toEqual([IncomeCategory.Salary, IncomeCategory.Sales]);
  });

  it('toggles all statuses/categories on and off', async () => {
    await setup();

    expect(component.isAllStatusesSelected()).toBe(true);

    component.toggleAllStatuses();
    expect(component.pendingStatuses()).toEqual([]);
    expect(component.isAllStatusesSelected()).toBe(false);

    component.toggleAllStatuses();
    expect(component.pendingStatuses()).toEqual(component.allStatuses);

    component.toggleAllCategories();
    expect(component.pendingCategories()).toEqual([]);
    component.toggleAllCategories();
    expect(component.pendingCategories()).toEqual(component.allCategories);
  });

  it('reflects the "Todos" checkbox tri-state (checked/unchecked/indeterminate) for statuses', async () => {
    await setup();

    // Todos selecionados por default.
    expect(component.isAllStatusesSelected()).toBe(true);
    expect(component.isStatusesPartiallySelected()).toBe(false);

    // Nenhum selecionado.
    component.pendingStatuses.set([]);
    expect(component.isAllStatusesSelected()).toBe(false);
    expect(component.isStatusesPartiallySelected()).toBe(false);

    // Seleção parcial.
    component.pendingStatuses.set([IncomeStatus.Paid]);
    expect(component.isAllStatusesSelected()).toBe(false);
    expect(component.isStatusesPartiallySelected()).toBe(true);
  });

  it('reflects the "Todos" checkbox tri-state (checked/unchecked/indeterminate) for categories', async () => {
    await setup();

    expect(component.isAllCategoriesSelected()).toBe(true);
    expect(component.isCategoriesPartiallySelected()).toBe(false);

    component.pendingCategories.set([]);
    expect(component.isAllCategoriesSelected()).toBe(false);
    expect(component.isCategoriesPartiallySelected()).toBe(false);

    component.pendingCategories.set([IncomeCategory.Salary]);
    expect(component.isAllCategoriesSelected()).toBe(false);
    expect(component.isCategoriesPartiallySelected()).toBe(true);
  });
});
