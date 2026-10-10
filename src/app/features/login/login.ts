import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthApi } from '../../core/auth/auth-api';
import { finalize } from 'rxjs';
import { Username } from './directives/username';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatButtonModule,
    MatInput,
    MatLabel,
    MatSnackBarModule,
    Username,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthApi);
  private router = inject(Router);
  private _snackBar = inject(MatSnackBar);

  isLoading = signal(false);
  form = this.fb.group({
    username: ['', { validators: [Validators.required, Validators.maxLength(30)] }],
    password: ['', { validators: [Validators.required, Validators.maxLength(100)] }],
  });

  isValidCredentials: WritableSignal<boolean | null> = signal(null);

  login(): void {
    const { username, password } = this.form.value;
    if (!username || !password) return;

    this.isLoading.set(true);

    this.auth
      .login(username, password)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          const errorMessage = error.error.message;
          this._snackBar.open(errorMessage ? errorMessage : 'Erro desconhecido', 'Fechar', {
            duration: 3000,
          });
        },
      });
  }
}
