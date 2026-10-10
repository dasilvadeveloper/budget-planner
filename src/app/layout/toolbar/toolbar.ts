import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { CustomInput } from '../../shared/components/input/input';
@Component({
  selector: 'app-toolbar',
  imports: [MatFormFieldModule, MatInputModule, MatIcon, CustomInput],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {}
