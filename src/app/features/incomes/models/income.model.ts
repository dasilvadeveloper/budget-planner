export enum IncomeType {
  OneTime = 'ONE_TIME',
  Recurring = 'RECURRING',
}

export const IncomeTypeLabels: Record<IncomeType, string> = {
  [IncomeType.OneTime]: 'Pontual',
  [IncomeType.Recurring]: 'Recorrente',
};

export enum IncomeStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
}

export const IncomeStatusLabels: Record<IncomeStatus, string> = {
  [IncomeStatus.Pending]: 'Pendente',
  [IncomeStatus.Paid]: 'Pago',
};

export enum IncomeCategory {
  Salary = 'SALARY',
  Freelance = 'FREELANCE',
  Sales = 'SALES',
  Refund = 'REFUND',
  Investment = 'INVESTMENT',
  Gift = 'GIFT',
  Other = 'OTHER',
}

export const IncomeCategoryLabels: Record<IncomeCategory, string> = {
  [IncomeCategory.Salary]: 'Salário',
  [IncomeCategory.Freelance]: 'Freelance',
  [IncomeCategory.Sales]: 'Vendas',
  [IncomeCategory.Refund]: 'Reembolsos',
  [IncomeCategory.Investment]: 'Investimentos',
  [IncomeCategory.Gift]: 'Presentes',
  [IncomeCategory.Other]: 'Outro',
};

export interface Income {
  id: number | null;
  name: string;
  amount: number;
  category: IncomeCategory;
  type: IncomeType;
  date: string;
  status: IncomeStatus;
  notes: string | null;
}
