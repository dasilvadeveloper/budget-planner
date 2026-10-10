import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { DateTime } from 'luxon';
import { IncomesStore } from '../../store/incomes.store';
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
  Income,
  IncomeCategory,
  IncomeCategoryLabels,
  IncomeStatus,
  IncomeStatusLabels,
  IncomeTypeLabels,
} from '../../models/income.model';

// Maps status to the badge's icon/style keys.
const STATUS_BADGE_ICON: Record<IncomeStatus, string> = {
  [IncomeStatus.Pending]: 'pending',
  [IncomeStatus.Paid]: 'paid',
};

@Component({
  selector: 'app-incomes-list',
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
  templateUrl: './incomes-list.html',
  styleUrl: './incomes-list.css',
})
export class IncomesList implements OnInit {
  incomesStore = inject(IncomesStore);
  router = inject(Router);
  route = inject(ActivatedRoute);

  readonly allStatuses = Object.values(IncomeStatus);
  readonly allCategories = Object.values(IncomeCategory);
  readonly statusLabels = IncomeStatusLabels;
  readonly categoryLabels = IncomeCategoryLabels;

  // Datas ainda não aplicadas — só refletem o que o utilizador escolheu nos inputs.
  pendingStartDate = signal(this.incomesStore.selectedDateRange().startDate);
  pendingEndDate = signal(this.incomesStore.selectedDateRange().endDate);
  pendingStatuses = signal(this.incomesStore.selectedStatuses());
  pendingCategories = signal(this.incomesStore.selectedCategories());

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

  incomesRows = computed(() => this.incomesStore.incomesForPeriod().map((income) => this.toRow(income)));

  // Headers da tabela
  incomesTableHeader: string[] = ['name', 'status', 'date', 'amount', 'options'];

  ngOnInit(): void {
    this.initializeFiltersFromUrl();
    this.loadData();
  }

  addIncome() {
    this.router.navigate(['incomes', 'incomes-list', 'add'], {
      queryParams: { action: Action.Create },
    });
  }

  editIncome(row: TransactionRow) {
    this.router.navigate(['incomes', 'incomes-list', 'add'], {
      queryParams: { action: Action.Edit, incomeId: row.id },
    });
  }

  deleteIncome(row: TransactionRow) {
    if (!confirm(`Tem a certeza que pretende eliminar a receita "${row.name}"?`)) return;
    this.incomesStore.deleteIncome(row.id);
  }

  markAsPaid(row: TransactionRow) {
    this.incomesStore.markIncomeAsPaid(row.id);
  }

  private toRow(income: Income): TransactionRow {
    return {
      id: income.id!,
      name: income.name,
      notes: income.notes,
      metaLine: `${IncomeCategoryLabels[income.category]} · ${IncomeTypeLabels[income.type]}`,
      amount: income.amount,
      statusIcon: STATUS_BADGE_ICON[income.status],
      statusLabel: IncomeStatusLabels[income.status],
      dateLabel: parseIsoDate(income.date)?.toFormat('dd/MM/yyyy') ?? '—',
      primaryAction:
        income.status === IncomeStatus.Pending
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

    this.incomesStore.setDateRange(startDate, endDate);
    this.incomesStore.setStatuses(statuses);
    this.incomesStore.setCategories(categories);
    this.updateUrlFilters(startDate, endDate, statuses, categories);
  }

  private initializeFiltersFromUrl() {
    const queryParams = this.route.snapshot.queryParamMap;
    const startDateParam = queryParams.get('startDate');
    const endDateParam = queryParams.get('endDate');

    const { startDate: defaultStart, endDate: defaultEnd } = this.incomesStore.selectedDateRange();
    const dateRangeValid =
      isValidIsoDateString(startDateParam) &&
      isValidIsoDateString(endDateParam) &&
      startDateParam <= endDateParam;

    const startDate = dateRangeValid ? startDateParam! : defaultStart;
    const endDate = dateRangeValid ? endDateParam! : defaultEnd;

    const statuses = this.parseEnumListParam(queryParams.get('status'), this.allStatuses) ?? this.allStatuses;
    const categories =
      this.parseEnumListParam(queryParams.get('category'), this.allCategories) ?? this.allCategories;

    this.incomesStore.setDateRange(startDate, endDate);
    this.incomesStore.setStatuses(statuses);
    this.incomesStore.setCategories(categories);

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
    statuses: IncomeStatus[],
    categories: IncomeCategory[],
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
    await this.incomesStore.loadIncomes();
  }
}
