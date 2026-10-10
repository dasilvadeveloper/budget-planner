import { Component, Input } from '@angular/core';

const ICON_CLASSES: Record<string, string> = {
  completed: 'fa-solid fa-heart-circle-check',
  pending: 'fa-regular fa-clock',
  paid: 'fa-solid fa-circle-check',
  overdue: 'fa-solid fa-triangle-exclamation',
  failed: 'fa-solid fa-xmark',
  rascunho: 'fa-solid fa-file-pen',
  aceite: 'fa-solid fa-circle-check',
  cancelado: 'fa-solid fa-ban',
  arquivado: 'fa-solid fa-box-archive',
};

const WHITE_TEXT_ICONS = ['failed', 'cancelado', 'arquivado'];

@Component({
  selector: 'app-badge',
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class Badge {
  @Input() icon: string = 'fa-icon';
  @Input() text: string = 'badge';

  get iconClass(): string {
    const base = ICON_CLASSES[this.icon] ?? '';
    return this.hasWhiteText ? `${base} text-[#fff!important]` : base;
  }

  get textClass(): string {
    return this.hasWhiteText ? 'text-[#fff!important]' : '';
  }

  private get hasWhiteText(): boolean {
    return WHITE_TEXT_ICONS.includes(this.icon);
  }
}
