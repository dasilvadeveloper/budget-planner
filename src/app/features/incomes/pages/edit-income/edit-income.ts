import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Component, computed, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { IncomesStore } from '../../store/incomes.store';
import { Action } from '../../../../shared/enums/actions';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  Income,
  IncomeCategory,
  IncomeCategoryLabels,
  IncomeStatus,
  IncomeStatusLabels,
  IncomeType,
  IncomeTypeLabels,
} from '../../models/income.model';
import { parseIsoDate, toIsoDateString } from '../../../../shared/utils/date-util';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-edit-income',
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
  templateUrl: './edit-income.html',
  styleUrl: './edit-income.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditIncome implements OnInit, OnDestroy {
  activatedRoute = inject(ActivatedRoute);
  store = inject(IncomesStore);
  fb = inject(FormBuilder);
  router = inject(Router);

  action: Action = Action.Create;
  categoryLabels = IncomeCategoryLabels;
  typeLabels = IncomeTypeLabels;
  statusLabels = IncomeStatusLabels;
  incomeTypes = Object.values(IncomeType);
  incomeStatuses = Object.values(IncomeStatus);
  isLoadingDetails = computed(() => {
    return this.store.isIncomeDetailsLoading;
  });

  form = this.fb.group({
    id: [0],
    name: [''],
    amount: [0],
    category: [null as IncomeCategory | null],
    type: [IncomeType.OneTime],
    date: [null as DateTime | null],
    status: [IncomeStatus.Pending],
    notes: [''],
  });

  constructor() {
    //wait for income details to load and then patch form values
    effect(() => {
      const income = this.store.incomeOnEdit();

      if (income) {
        this.form.patchValue(
          { ...income, date: parseIsoDate(income.date) },
          { emitEvent: false },
        );
      } else {
        this.store.createNewIncome();
      }
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const incomeId = Number(params['incomeId']);
      this.action = params['action'];

      if (incomeId && this.action === Action.Edit) {
        this.store.loadIncomeDetails(incomeId);
      } else if (this.action === Action.Create) {
        this.store.createNewIncome();
        this.store.loadCategories();
      } else {
        // Handle case when no incomeId is provided for edit action
        console.warn('No incomeId provided for edit action');
      }
    });
  }

  addIncome() {
    const formValue = this.form.value;

    const income: Income = {
      id: null, // gerado pelo backend
      name: formValue.name!,
      amount: formValue.amount!,
      category: formValue.category ?? IncomeCategory.Other,
      type: formValue.type ?? IncomeType.OneTime,
      date: toIsoDateString(formValue.date ?? null),
      status: IncomeStatus.Pending,
      notes: formValue.notes?.trim() || null,
    };
    this.store.addIncome(income).then(() => {
      this.router.navigate(['/incomes', 'incomes-list']);
    });
  }

  editIncome() {
    const formValue = this.form.value;
    const currentIncome = this.store.incomeOnEdit();

    if (!currentIncome) return;

    const income: Income = {
      ...currentIncome,
      name: formValue.name!,
      amount: formValue.amount!,
      category: formValue.category ?? IncomeCategory.Other,
      type: formValue.type ?? currentIncome.type,
      date: toIsoDateString(formValue.date ?? null),
      status: formValue.status ?? currentIncome.status,
      notes: formValue.notes?.trim() || null,
    };
    this.store.editIncome(income).then(() => {
      this.router.navigate(['/incomes', 'incomes-list']);
    });
  }

  cancel() {
    this.router.navigate(['/incomes', 'incomes-list']);
  }

  deleteIncome() {
    const currentIncome = this.store.incomeOnEdit();

    if (!currentIncome) return;

    this.store.deleteIncome(currentIncome.id!).then(() => {
      this.router.navigate(['/incomes', 'incomes-list']);
    });
  }

  ngOnDestroy(): void {
    this.store.clearIncomeDetails();
  }
}
