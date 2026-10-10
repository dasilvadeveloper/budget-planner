import { Injectable } from '@angular/core';
import { Income } from '../models/income.model';

// Ainda sem fonte de dados: o backend não tem endpoints de rendimentos.
// Nada é persistido — os rendimentos vivem apenas na store durante a sessão.
@Injectable({
  providedIn: 'root',
})
export class IncomesApi {
  async fetchIncomes(): Promise<Income[]> {
    return [];
  }

  async findIncome(incomeId: number): Promise<Income | undefined> {
    return undefined;
  }

  async addIncome(income: Income): Promise<Income> {
    // o id passará a ser atribuído pelo backend
    return { ...income, id: income.id ?? Date.now() };
  }

  async deleteIncome(incomeId: number): Promise<void> {}

  async editIncome(income: Income): Promise<Income> {
    return income;
  }
}
