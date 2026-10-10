import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse } from './login-response.model';

const TOKEN_STORAGE_KEY = 'token';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private http = inject(HttpClient);

  private _token = signal<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  isLoggedIn = computed<boolean>(() => !!this._token());
  private readonly loginUrl = `${environment.apiUrl}/login`;

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, { username, password }).pipe(
      tap(({ token }) => {
        this._token.set(token);
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this._token.set(null);
  }
}
