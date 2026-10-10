import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { ExpensesApi } from '../services/expenses-api';
import { Expense, ExpenseCategory, ExpenseStatus, ExpenseType } from '../models/expense.model';
import { currentMonthRange, DateRange } from '../../../shared/utils/date-util';

interface ExpensesState {
  expenses: Expense[];
  isExpensesLoading: boolean;
  expenseOnEdit: Expense | null;
  isExpenseDetailsLoading: boolean;
  categories: ExpenseCategory[];
  selectedDateRange: DateRange;
  selectedStatuses: ExpenseStatus[];
  selectedCategories: ExpenseCategory[];
}

export const DEFAULT_EXPENSE: Expense = {
  id: null,
  name: '',
  amount: 0,
  category: ExpenseCategory.Other,
  type: ExpenseType.OneTime,
  date: '',
  status: ExpenseStatus.Pending,
  notes: null,
};

const initialState: ExpensesState = {
  expenses: [],
  isExpensesLoading: false,
  expenseOnEdit: null,
  isExpenseDetailsLoading: false,
  categories: [],
  selectedDateRange: currentMonthRange(),
  selectedStatuses: Object.values(ExpenseStatus),
  selectedCategories: Object.values(ExpenseCategory),
};

export const ExpensesStore = signalStore(
  { providedIn: 'root' },

  // 🧠 STATE (dados crus)
  withState(initialState),
  withComputed((store) => ({
    expensesCount: () => store.expenses().length,
    expensesForPeriod: () => {
      const { startDate, endDate } = store.selectedDateRange();
      const statuses = store.selectedStatuses();
      const categories = store.selectedCategories();
      // Despesas sem data (ex. dados antigos por migrar) ficam sempre visíveis em vez de
      // desaparecerem silenciosamente de todos os períodos.
      return store
        .expenses()
        .filter(
          (expense) =>
            (!expense.date || (expense.date >= startDate && expense.date <= endDate)) &&
            statuses.includes(expense.status) &&
            categories.includes(expense.category),
        );
    },
  })),
  withMethods((store, expensesApi = inject(ExpensesApi)) => {
    const applyExpenses = (expenses: Expense[]) => {
      patchState(store, { expenses });
    };

    return {
      async loadExpenses() {
        patchState(store, { isExpensesLoading: true });

        try {
          const expenses = await expensesApi.fetchExpenses();

          patchState(store, {
            categories: Object.values(ExpenseCategory),
          });
          applyExpenses(expenses);
        } finally {
          patchState(store, { isExpensesLoading: false });
        }
      },
      async loadExpenseDetails(expenseId: number) {
        patchState(store, { isExpenseDetailsLoading: true });
        try {
          this.loadCategories();

          const expenseDetails = await expensesApi.findExpense(expenseId);

          if (!expenseDetails) throw new Error('Expense not found');

          patchState(store, { expenseOnEdit: expenseDetails });
        } finally {
          patchState(store, { isExpenseDetailsLoading: false });
        }
      },
      clearExpenseDetails() {
        patchState(store, { expenseOnEdit: null });
      },
      // Expenses CRUD — routed through the store so `expenses` stays in
      // sync for every consumer instead of requiring a full reload.
      async addExpense(expense: Expense) {
        const newExpense = await expensesApi.addExpense(expense);
        applyExpenses([...store.expenses(), newExpense]);
        return newExpense;
      },
      async editExpense(expense: Expense) {
        const updated = await expensesApi.editExpense(expense);
        applyExpenses(store.expenses().map((e) => (e.id === updated.id ? updated : e)));
        return updated;
      },
      async deleteExpense(expenseId: number) {
        await expensesApi.deleteExpense(expenseId);
        applyExpenses(store.expenses().filter((e) => e.id !== expenseId));
      },
      async markExpenseAsPaid(expenseId: number) {
        const expense = store.expenses().find((e) => e.id === expenseId);
        if (!expense) return;
        return this.editExpense({ ...expense, status: ExpenseStatus.Paid });
      },
      createNewExpense() {
        patchState(store, {
          expenseOnEdit: DEFAULT_EXPENSE,
        });
      },
      loadCategories() {
        patchState(store, {
          categories: Object.values(ExpenseCategory),
        });
      },
      setDateRange(startDate: string, endDate: string) {
        patchState(store, { selectedDateRange: { startDate, endDate } });
      },
      setStatuses(statuses: ExpenseStatus[]) {
        patchState(store, { selectedStatuses: statuses });
      },
      setCategories(categories: ExpenseCategory[]) {
        patchState(store, { selectedCategories: categories });
      },
    };
  }),
);
