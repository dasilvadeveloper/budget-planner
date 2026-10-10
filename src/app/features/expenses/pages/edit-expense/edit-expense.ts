import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Component, computed, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { ExpensesStore } from '../../store/expenses.store';
import { Action } from '../../../../shared/enums/actions';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  Expense,
  ExpenseCategory,
  ExpenseCategoryLabels,
  ExpenseStatus,
  ExpenseStatusLabels,
  ExpenseType,
  ExpenseTypeLabels,
} from '../../models/expense.model';
import { parseIsoDate, toIsoDateString } from '../../../../shared/utils/date-util';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-edit-expense',
  imports: [
    MatProgressSpinnerModule,
    NgTemplateOutlet,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
      MatAnchor,
    MatIcon,
  ],
  templateUrl: './edit-expense.html',
  styleUrl: './edit-expense.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditExpense implements OnInit, OnDestroy {
  activatedRoute = inject(ActivatedRoute);
  store = inject(ExpensesStore);
  fb = inject(FormBuilder);
  router = inject(Router);

  action: Action = Action.Create;
  categoryLabels = ExpenseCategoryLabels;
  typeLabels = ExpenseTypeLabels;
  statusLabels = ExpenseStatusLabels;
  expenseTypes = Object.values(ExpenseType);
  expenseStatuses = Object.values(ExpenseStatus);
  isLoadingDetails = computed(() => {
    return this.store.isExpenseDetailsLoading;
  });

  form = this.fb.group({
    id: [0],
    name: [''],
    amount: [0],
    category: [null as ExpenseCategory | null],
    type: [ExpenseType.OneTime],
    date: [null as DateTime | null],
    status: [ExpenseStatus.Pending],
    notes: [''],
  });

  constructor() {
    //wait for expense details to load and then patch form values
    effect(() => {
      const expense = this.store.expenseOnEdit();

      if (expense) {
        this.form.patchValue(
          { ...expense, date: parseIsoDate(expense.date) },
          { emitEvent: false },
        );
      } else {
        this.store.createNewExpense();
      }
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const expenseId = Number(params['expenseId']);
      this.action = params['action'];

      if (expenseId && this.action === Action.Edit) {
        this.store.loadExpenseDetails(expenseId);
      } else if (this.action === Action.Create) {
        this.store.createNewExpense();
        this.store.loadCategories();
      } else {
        // Handle case when no expenseId is provided for edit action
        console.warn('No expenseId provided for edit action');
      }
    });
  }

  addExpense() {
    const formValue = this.form.value;

    const expense: Expense = {
      id: null, // gerado pelo backend
      name: formValue.name!,
      amount: formValue.amount!,
      category: formValue.category ?? ExpenseCategory.Other,
      type: formValue.type ?? ExpenseType.OneTime,
      date: toIsoDateString(formValue.date ?? null),
      status: ExpenseStatus.Pending,
      notes: formValue.notes?.trim() || null,
    };
    this.store.addExpense(expense).then(() => {
      this.router.navigate(['/expenses', 'expenses-list']);
    });
  }

  editExpense() {
    const formValue = this.form.value;
    const currentExpense = this.store.expenseOnEdit();

    if (!currentExpense) return;

    const expense: Expense = {
      ...currentExpense,
      name: formValue.name!,
      amount: formValue.amount!,
      category: formValue.category ?? ExpenseCategory.Other,
      type: formValue.type ?? currentExpense.type,
      date: toIsoDateString(formValue.date ?? null),
      status: formValue.status ?? currentExpense.status,
      notes: formValue.notes?.trim() || null,
    };
    this.store.editExpense(expense).then(() => {
      this.router.navigate(['/expenses', 'expenses-list']);
    });
  }

  cancel() {
    this.router.navigate(['/expenses', 'expenses-list']);
  }

  deleteExpense() {
    const currentExpense = this.store.expenseOnEdit();

    if (!currentExpense) return;

    this.store.deleteExpense(currentExpense.id!).then(() => {
      this.router.navigate(['/expenses', 'expenses-list']);
    });
  }

  ngOnDestroy(): void {
    this.store.clearExpenseDetails();
  }
}
