import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPtPipe',
  standalone: true
})
export class CurrencyPtPipe implements PipeTransform {
  transform(value: number | null | undefined, fractionDigits: number = 2): string {
    if (value == null) return '';
    
    // Intl.NumberFormat com locale pt-PT
    const formatted = new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      useGrouping: true, // ativa separador de milhar
    }).format(value);

    return `${formatted} €`; // € à direita
  }
}