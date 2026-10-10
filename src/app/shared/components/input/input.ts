import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input',
  imports: [NgClass],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class CustomInput {
  @Input() icon?: string;
  @Input() name?: string = 'Input';
}
