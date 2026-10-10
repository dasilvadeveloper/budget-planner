import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthApi } from './auth-api';
import { LoginResponse } from './login-response.model';

const LOGIN_URL = `${environment.apiUrl}/login`;

const LOGIN_RESPONSE: LoginResponse = {
  id: '7f1c2a',
  name: 'Hendrik Lelis',
  username: 'hendrik',
  token: 'jwt-token',
};

describe('AuthApi', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('starts logged out when there is no stored token', () => {
    expect(TestBed.inject(AuthApi).isLoggedIn()).toBe(false);
  });

  it('restores the session from a stored token', () => {
    localStorage.setItem('token', 'stored-token');

    expect(TestBed.inject(AuthApi).isLoggedIn()).toBe(true);
  });

  it('sends the credentials and stores the token on a successful login', () => {
    const auth = TestBed.inject(AuthApi);
    let response: LoginResponse | undefined;

    auth.login('hendrik', 'secret').subscribe((res) => (response = res));

    const request = http.expectOne(LOGIN_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'hendrik', password: 'secret' });
    request.flush(LOGIN_RESPONSE);

    expect(response).toEqual(LOGIN_RESPONSE);
    expect(auth.isLoggedIn()).toBe(true);
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('stays logged out and propagates the error on a failed login', () => {
    const auth = TestBed.inject(AuthApi);
    let status: number | undefined;

    auth.login('hendrik', 'wrong').subscribe({ error: (error) => (status = error.status) });

    http
      .expectOne(LOGIN_URL)
      .flush(
        { message: 'Invalid credentials', code: 'E02' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(status).toBe(401);
    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('clears the token on logout', () => {
    localStorage.setItem('token', 'stored-token');
    const auth = TestBed.inject(AuthApi);

    auth.logout();

    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
