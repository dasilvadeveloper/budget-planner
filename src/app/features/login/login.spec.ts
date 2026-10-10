import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthApi } from '../../core/auth/auth-api';
import { LoginResponse } from '../../core/auth/login-response.model';
import { Login } from './login';

const LOGIN_RESPONSE: LoginResponse = {
  id: '7f1c2a',
  name: 'Hendrik Lelis',
  username: 'hendrik',
  token: 'jwt-token',
};

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let auth: { login: ReturnType<typeof vi.fn> };
  let navigate: ReturnType<typeof vi.spyOn>;
  let openSnackBar: ReturnType<typeof vi.spyOn>;

  const submit = (username = 'hendrik', password = 'secret') => {
    component.form.setValue({ username, password });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  const submitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');

  const shownMessage = () => openSnackBar.mock.calls[0][0];

  beforeEach(async () => {
    auth = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [{ provide: AuthApi, useValue: auth }],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    openSnackBar = vi.spyOn(TestBed.inject(MatSnackBar), 'open').mockReturnValue(undefined as never);

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not call the API while a required field is empty', () => {
    submit('hendrik', '');

    expect(auth.login).not.toHaveBeenCalled();
    expect(component.form.controls.password.touched).toBe(true);
  });

  it('does not call the API when the password exceeds the backend limit', () => {
    submit('hendrik', 'a'.repeat(73));

    expect(auth.login).not.toHaveBeenCalled();
  });

  it('logs in and navigates to the dashboard', () => {
    auth.login.mockReturnValue(of(LOGIN_RESPONSE));

    submit();

    expect(auth.login).toHaveBeenCalledWith('hendrik', 'secret');
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(openSnackBar).not.toHaveBeenCalled();
  });

  it('disables the submit button while the request is pending', () => {
    const pending = new Subject<LoginResponse>();
    auth.login.mockReturnValue(pending);

    submit();
    expect(submitButton().disabled).toBe(true);

    pending.error(new HttpErrorResponse({ status: 401 }));
    fixture.detectChanges();
    expect(submitButton().disabled).toBe(false);
  });

  it('reports invalid credentials', () => {
    auth.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            error: { message: 'Invalid credentials', code: 'E02' },
          }),
      ),
    );

    submit();

    expect(shownMessage()).toBe('Nome de utilizador ou palavra-passe inválidos.');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('reports a connection failure when the server cannot be reached', () => {
    auth.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

    submit();

    expect(shownMessage()).toBe('Sem ligação ao servidor. Tente novamente.');
  });

  it('reports a generic error when the response has no body', () => {
    auth.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: null })),
    );

    submit();

    expect(shownMessage()).toBe('Ocorreu um erro. Tente novamente mais tarde.');
  });
});
