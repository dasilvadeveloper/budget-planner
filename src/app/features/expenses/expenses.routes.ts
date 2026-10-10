import { Routes } from '@angular/router';
import { EditExpense } from './pages/edit-expense/edit-expense';
import { ExpensesList } from './pages/expenses-list/expenses-list';

export const routes: Routes = [
  {
    path: 'expenses-list',
    children: [
      {
        path: '',
        component: ExpensesList,
      },
      {
        path: 'add',
        component: EditExpense,
      },
      {
        path: 'edit/:expenseId',
        component: EditExpense,
      }
    ],
  },
];
