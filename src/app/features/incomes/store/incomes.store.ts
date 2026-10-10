import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { IncomesApi } from '../services/incomes-api';
import { Income, IncomeCategory, IncomeStatus, IncomeType } from '../models/income.model';
import { currentMonthRange, DateRange } from '../../../shared/utils/date-util';

interface IncomesState {
  incomes: Income[];
  isIncomesLoading: boolean;
  incomeOnEdit: Income | null;
  isIncomeDetailsLoading: boolean;
  categories: IncomeCategory[];
  selectedDateRange: DateRange;
  selectedStatuses: IncomeStatus[];
  selectedCategories: IncomeCategory[];
}

export const DEFAULT_INCOME: Income = {
  id: null,
  name: '',
  amount: 0,
  category: IncomeCategory.Other,
  type: IncomeType.OneTime,
  date: '',
  status: IncomeStatus.Pending,
  notes: null,
};

const initialState: IncomesState = {
  incomes: [],
  isIncomesLoading: false,
  incomeOnEdit: null,
  isIncomeDetailsLoading: false,
  categories: [],
  selectedDateRange: currentMonthRange(),
  selectedStatuses: Object.values(IncomeStatus),
  selectedCategories: Object.values(IncomeCategory),
};

export const IncomesStore = signalStore(
  { providedIn: 'root' },

  // 🧠 STATE (dados crus)
  withState(initialState),
  withComputed((store) => ({
    incomesCount: () => store.incomes().length,
    incomesForPeriod: () => {
      const { startDate, endDate } = store.selectedDateRange();
      const statuses = store.selectedStatuses();
      const categories = store.selectedCategories();
      // Rendimentos sem data (ex. dados antigos por migrar) ficam sempre visíveis em vez de
      // desaparecerem silenciosamente de todos os períodos.
      return store
        .incomes()
        .filter(
          (income) =>
            (!income.date || (income.date >= startDate && income.date <= endDate)) &&
            statuses.includes(income.status) &&
            categories.includes(income.category),
        );
    },
  })),
  withMethods((store, incomesApi = inject(IncomesApi)) => {
    const applyIncomes = (incomes: Income[]) => {
      patchState(store, { incomes });
    };

    return {
      async loadIncomes() {
        patchState(store, { isIncomesLoading: true });

        try {
          const incomes = await incomesApi.fetchIncomes();

          patchState(store, {
            categories: Object.values(IncomeCategory),
          });
          applyIncomes(incomes);
        } finally {
          patchState(store, { isIncomesLoading: false });
        }
      },
      async loadIncomeDetails(incomeId: number) {
        patchState(store, { isIncomeDetailsLoading: true });
        try {
          this.loadCategories();

          const incomeDetails = await incomesApi.findIncome(incomeId);

          if (!incomeDetails) throw new Error('Income not found');

          patchState(store, { incomeOnEdit: incomeDetails });
        } finally {
          patchState(store, { isIncomeDetailsLoading: false });
        }
      },
      clearIncomeDetails() {
        patchState(store, { incomeOnEdit: null });
      },
      // Incomes CRUD — routed through the store so `incomes` stays in
      // sync for every consumer instead of requiring a full reload.
      async addIncome(income: Income) {
        const newIncome = await incomesApi.addIncome(income);
        applyIncomes([...store.incomes(), newIncome]);
        return newIncome;
      },
      async editIncome(income: Income) {
        const updated = await incomesApi.editIncome(income);
        applyIncomes(store.incomes().map((i) => (i.id === updated.id ? updated : i)));
        return updated;
      },
      async deleteIncome(incomeId: number) {
        await incomesApi.deleteIncome(incomeId);
        applyIncomes(store.incomes().filter((i) => i.id !== incomeId));
      },
      async markIncomeAsPaid(incomeId: number) {
        const income = store.incomes().find((i) => i.id === incomeId);
        if (!income) return;
        return this.editIncome({ ...income, status: IncomeStatus.Paid });
      },
      createNewIncome() {
        patchState(store, {
          incomeOnEdit: DEFAULT_INCOME,
        });
      },
      loadCategories() {
        patchState(store, {
          categories: Object.values(IncomeCategory),
        });
      },
      setDateRange(startDate: string, endDate: string) {
        patchState(store, { selectedDateRange: { startDate, endDate } });
      },
      setStatuses(statuses: IncomeStatus[]) {
        patchState(store, { selectedStatuses: statuses });
      },
      setCategories(categories: IncomeCategory[]) {
        patchState(store, { selectedCategories: categories });
      },
    };
  }),
);
