import { Routes } from '@angular/router';
import { EditIncome } from './pages/edit-income/edit-income';
import { IncomesList } from './pages/incomes-list/incomes-list';

export const routes: Routes = [
  {
    path: 'incomes-list',
    children: [
      {
        path: '',
        component: IncomesList,
      },
      {
        path: 'add',
        component: EditIncome,
      },
      {
        path: 'edit/:incomeId',
        component: EditIncome,
      }
    ],
  },
];
