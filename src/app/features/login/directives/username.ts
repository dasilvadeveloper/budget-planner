import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

const DISALLOWED_CHARACTERS = /[^a-zA-Z0-9_]/g;

// NFD separa a letra do acento ("ã" → "a" + "~"), por isso "joão" fica "joao" em vez de "joo".
function sanitizeUsername(value: string): string {
  return value.normalize('NFD').replace(DISALLOWED_CHARACTERS, '');
}

@Directive({
  selector: 'input[appUsername]',
  host: {
    '(input)': 'onInput($event)',
    '(compositionend)': 'onInput($event)',
  },
})
export class Username {
  private readonly ngControl = inject(NgControl, { self: true });

  protected onInput(event: Event): void {
    // a meio de uma composição (acentos, teclados móveis) o valor ainda não é final
    if (event instanceof InputEvent && event.isComposing) return;

    const input = event.target as HTMLInputElement;
    const sanitized = sanitizeUsername(input.value);
    if (sanitized === input.value) return;

    // mantém o cursor onde estava em vez de saltar para o fim
    const caret = sanitizeUsername(input.value.slice(0, input.selectionStart ?? input.value.length)).length;

    this.ngControl.control?.setValue(sanitized);
    input.setSelectionRange(caret, caret);
  }
}
