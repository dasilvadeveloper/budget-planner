import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthApi } from '../../core/auth/auth-api';
import { finalize } from 'rxjs';
import { Username } from './directives/username';

// Limites iguais aos do backend: coluna username (30) e o máximo que o BCrypt usa (72).
const USERNAME_MAX_LENGTH = 30;
const PASSWORD_MAX_LENGTH = 72;

const INVALID_CREDENTIALS_CODE = 'E02';

function loginErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Sem ligação ao servidor. Tente novamente.';
    if (error.error?.code === INVALID_CREDENTIALS_CODE) {
      return 'Nome de utilizador ou palavra-passe inválidos.';
    }
  }
  return 'Ocorreu um erro. Tente novamente mais tarde.';
}

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatButtonModule,
    MatInput,
    MatLabel,
    MatError,
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

  readonly passwordMaxLength = PASSWORD_MAX_LENGTH;

  isLoading = signal(false);
  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(USERNAME_MAX_LENGTH)]],
    password: ['', [Validators.required, Validators.maxLength(PASSWORD_MAX_LENGTH)]],
  });

  login(): void {
    if (this.isLoading()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();
    this.isLoading.set(true);

    this.auth
      .login(username, password)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => {
          this._snackBar.open(loginErrorMessage(error), 'Fechar', { duration: 5000 });
        },
      });
  }
}
