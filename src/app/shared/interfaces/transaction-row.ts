export interface TransactionRowAction {
  icon: string;
  ariaLabel: string;
}

/** Purely presentational view model for `app-transactions-table` — no domain semantics. */
export interface TransactionRow {
  id: number;
  name: string;
  notes: string | null;
  metaLine: string;
  amount: number;
  statusIcon: string;
  statusLabel: string;
  dateLabel: string;
  primaryAction?: TransactionRowAction;
}
