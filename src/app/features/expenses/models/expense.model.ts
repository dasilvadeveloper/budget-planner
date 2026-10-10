export enum ExpenseType {
  OneTime = 'ONE_TIME',
  Recurring = 'RECURRING',
}

export const ExpenseTypeLabels: Record<ExpenseType, string> = {
  [ExpenseType.OneTime]: 'Pontual',
  [ExpenseType.Recurring]: 'Recorrente',
};

export enum ExpenseStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Overdue = 'OVERDUE',
}

export const ExpenseStatusLabels: Record<ExpenseStatus, string> = {
  [ExpenseStatus.Pending]: 'Pendente',
  [ExpenseStatus.Paid]: 'Pago',
  [ExpenseStatus.Overdue]: 'Atrasado',
};

export enum ExpenseCategory {
  Housing = 'HOUSING',
  Utilities = 'UTILITIES',
  Subscriptions = 'SUBSCRIPTIONS',
  Food = 'FOOD',
  Transport = 'TRANSPORT',
  Health = 'HEALTH',
  Shopping = 'SHOPPING',
  Debt = 'DEBT',
  Other = 'OTHER',
}

export const ExpenseCategoryLabels: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Housing]: 'Habitação',
  [ExpenseCategory.Utilities]: 'Serviços',
  [ExpenseCategory.Subscriptions]: 'Subscrições',
  [ExpenseCategory.Food]: 'Alimentação',
  [ExpenseCategory.Transport]: 'Transporte',
  [ExpenseCategory.Health]: 'Saúde',
  [ExpenseCategory.Shopping]: 'Compras',
  [ExpenseCategory.Debt]: 'Dívidas',
  [ExpenseCategory.Other]: 'Outro',
};

export interface Expense {
  id: number | null;
  name: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string;
  status: ExpenseStatus;
  notes: string | null;
}
