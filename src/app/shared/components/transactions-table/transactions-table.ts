import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { NgTemplateOutlet } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPtPipe } from '../../pipes/currency-pt-pipe';
import { Badge } from '../badge/badge';
import { TransactionRow } from '../../interfaces/transaction-row';

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [
    MatTableModule,
    NgTemplateOutlet,
    CurrencyPtPipe,
    Badge,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './transactions-table.html',
  styleUrl: './transactions-table.css',
})
export class TransactionsTable {
  @Input() rows: TransactionRow[] = [];
  @Input() tableHeader: string[] = [];
  @Input() isLoading = false;
  @Input() nameColumnLabel = '';
  @Input() amountColumnLabel = '';
  @Input() emptyStateLabel = '';
  @Input() entityLabelPlural = '';

  @Output() primaryAction = new EventEmitter<TransactionRow>();
  @Output() editRow = new EventEmitter<TransactionRow>();
  @Output() deleteRow = new EventEmitter<TransactionRow>();
}
