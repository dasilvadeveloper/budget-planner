import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { DateTime } from 'luxon';
import { ExpensesStore } from '../../store/expenses.store';
import { TransactionsTable } from '../../../../shared/components/transactions-table/transactions-table';
import { TransactionRow } from '../../../../shared/interfaces/transaction-row';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Action } from '../../../../shared/enums/actions';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { isValidIsoDateString, parseIsoDate, toIsoDateString } from '../../../../shared/utils/date-util';
import {
  Expense,
  ExpenseCategory,
  ExpenseCategoryLabels,
  ExpenseStatus,
  ExpenseStatusLabels,
  ExpenseTypeLabels,
} from '../../models/expense.model';

// Maps status to the badge's icon/style keys.
const STATUS_BADGE_ICON: Record<ExpenseStatus, string> = {
  [ExpenseStatus.Pending]: 'pending',
  [ExpenseStatus.Paid]: 'paid',
  [ExpenseStatus.Overdue]: 'overdue',
};

@Component({
  selector: 'app-expenses-list',
  imports: [
    TransactionsTable,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
  ],
  templateUrl: './expenses-list.html',
  styleUrl: './expenses-list.css',
})
export class ExpensesList implements OnInit {
  expensesStore = inject(ExpensesStore);
  router = inject(Router);
  route = inject(ActivatedRoute);

  readonly allStatuses = Object.values(ExpenseStatus);
  readonly allCategories = Object.values(ExpenseCategory);
  readonly statusLabels = ExpenseStatusLabels;
  readonly categoryLabels = ExpenseCategoryLabels;

  // Datas ainda não aplicadas — só refletem o que o utilizador escolheu nos inputs.
  pendingStartDate = signal(this.expensesStore.selectedDateRange().startDate);
  pendingEndDate = signal(this.expensesStore.selectedDateRange().endDate);
  pendingStatuses = signal(this.expensesStore.selectedStatuses());
  pendingCategories = signal(this.expensesStore.selectedCategories());

  // O mat-datepicker trabalha com DateTime (adapter Luxon); os signals pendentes mantêm-se em ISO.
  pendingStartDateTime = computed(() => parseIsoDate(this.pendingStartDate()));
  pendingEndDateTime = computed(() => parseIsoDate(this.pendingEndDate()));

  isDateRangeInvalid = computed(() => this.pendingStartDate() > this.pendingEndDate());

  isAllStatusesSelected = computed(() => this.pendingStatuses().length === this.allStatuses.length);
  isAllCategoriesSelected = computed(() => this.pendingCategories().length === this.allCategories.length);

  isStatusesPartiallySelected = computed(
    () => this.pendingStatuses().length > 0 && !this.isAllStatusesSelected(),
  );
  isCategoriesPartiallySelected = computed(
    () => this.pendingCategories().length > 0 && !this.isAllCategoriesSelected(),
  );

  expensesRows = computed(() => this.expensesStore.expensesForPeriod().map((expense) => this.toRow(expense)));

  // Headers da tabela
  expensesTableHeader: string[] = ['name', 'status', 'date', 'amount', 'options'];

  ngOnInit(): void {
    this.initializeFiltersFromUrl();
    this.loadData();
  }

  addExpense() {
    this.router.navigate(['expenses', 'expenses-list', 'add'], {
      queryParams: { action: Action.Create },
    });
  }

  editExpense(row: TransactionRow) {
    this.router.navigate(['expenses', 'expenses-list', 'add'], {
      queryParams: { action: Action.Edit, expenseId: row.id },
    });
  }

  deleteExpense(row: TransactionRow) {
    if (!confirm(`Tem a certeza que pretende eliminar a despesa "${row.name}"?`)) return;
    this.expensesStore.deleteExpense(row.id);
  }

  markAsPaid(row: TransactionRow) {
    this.expensesStore.markExpenseAsPaid(row.id);
  }

  private toRow(expense: Expense): TransactionRow {
    return {
      id: expense.id!,
      name: expense.name,
      notes: expense.notes,
      metaLine: `${ExpenseCategoryLabels[expense.category]} · ${ExpenseTypeLabels[expense.type]}`,
      amount: expense.amount,
      statusIcon: STATUS_BADGE_ICON[expense.status],
      statusLabel: ExpenseStatusLabels[expense.status],
      dateLabel: parseIsoDate(expense.date)?.toFormat('dd/MM/yyyy') ?? '—',
      primaryAction:
        expense.status === ExpenseStatus.Pending
          ? { icon: 'fa-circle-check', ariaLabel: 'Marcar como pago' }
          : undefined,
    };
  }

  onStartDateChange(event: MatDatepickerInputEvent<DateTime>) {
    const isoDate = toIsoDateString(event.value ?? null);
    if (isoDate) this.pendingStartDate.set(isoDate);
  }

  onEndDateChange(event: MatDatepickerInputEvent<DateTime>) {
    const isoDate = toIsoDateString(event.value ?? null);
    if (isoDate) this.pendingEndDate.set(isoDate);
  }

  onStatusSelectionChange(event: MatSelectChange) {
    this.pendingStatuses.set(event.value);
  }

  onCategorySelectionChange(event: MatSelectChange) {
    this.pendingCategories.set(event.value);
  }

  toggleAllStatuses() {
    this.pendingStatuses.set(this.isAllStatusesSelected() ? [] : [...this.allStatuses]);
  }

  toggleAllCategories() {
    this.pendingCategories.set(this.isAllCategoriesSelected() ? [] : [...this.allCategories]);
  }

  applyFilters() {
    if (this.isDateRangeInvalid()) return;

    const startDate = this.pendingStartDate();
    const endDate = this.pendingEndDate();
    const statuses = this.pendingStatuses();
    const categories = this.pendingCategories();

    this.expensesStore.setDateRange(startDate, endDate);
    this.expensesStore.setStatuses(statuses);
    this.expensesStore.setCategories(categories);
    this.updateUrlFilters(startDate, endDate, statuses, categories);
  }

  private initializeFiltersFromUrl() {
    const queryParams = this.route.snapshot.queryParamMap;
    const startDateParam = queryParams.get('startDate');
    const endDateParam = queryParams.get('endDate');

    const { startDate: defaultStart, endDate: defaultEnd } = this.expensesStore.selectedDateRange();
    const dateRangeValid =
      isValidIsoDateString(startDateParam) &&
      isValidIsoDateString(endDateParam) &&
      startDateParam <= endDateParam;

    const startDate = dateRangeValid ? startDateParam! : defaultStart;
    const endDate = dateRangeValid ? endDateParam! : defaultEnd;

    const statuses = this.parseEnumListParam(queryParams.get('status'), this.allStatuses) ?? this.allStatuses;
    const categories =
      this.parseEnumListParam(queryParams.get('category'), this.allCategories) ?? this.allCategories;

    this.expensesStore.setDateRange(startDate, endDate);
    this.expensesStore.setStatuses(statuses);
    this.expensesStore.setCategories(categories);

    this.pendingStartDate.set(startDate);
    this.pendingEndDate.set(endDate);
    this.pendingStatuses.set(statuses);
    this.pendingCategories.set(categories);

    this.updateUrlFilters(startDate, endDate, statuses, categories);
  }

  // Interpreta uma lista separada por vírgulas de um parâmetro da URL, mantendo apenas
  // valores válidos do enum. Devolve `null` quando o parâmetro está ausente ou não contém
  // nenhum valor válido — nesse caso o chamador aplica o default (todos selecionados).
  // Um parâmetro presente mas vazio ('') é uma seleção válida e intencional (nenhum selecionado).
  private parseEnumListParam<T extends string>(raw: string | null, validValues: readonly T[]): T[] | null {
    if (raw === null) return null;
    if (raw === '') return [];

    const valid = new Set<T>();
    for (const value of raw.split(',')) {
      if ((validValues as readonly string[]).includes(value)) valid.add(value as T);
    }

    return valid.size > 0 ? Array.from(valid) : null;
  }

  private updateUrlFilters(
    startDate: string,
    endDate: string,
    statuses: ExpenseStatus[],
    categories: ExpenseCategory[],
  ) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        startDate,
        endDate,
        status: statuses.join(','),
        category: categories.join(','),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  async loadData() {
    await this.expensesStore.loadExpenses();
  }
}
