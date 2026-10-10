import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';

// Ainda sem fonte de dados: o backend não tem endpoints de despesas.
// Nada é persistido — as despesas vivem apenas na store durante a sessão.
@Injectable({
  providedIn: 'root',
})
export class ExpensesApi {
  async fetchExpenses(): Promise<Expense[]> {
    return [];
  }

  async findExpense(expenseId: number): Promise<Expense | undefined> {
    return undefined;
  }

  async addExpense(expense: Expense): Promise<Expense> {
    // o id passará a ser atribuído pelo backend
    return { ...expense, id: expense.id ?? Date.now() };
  }

  async deleteExpense(expenseId: number): Promise<void> {}

  async editExpense(expense: Expense): Promise<Expense> {
    return expense;
  }
}
