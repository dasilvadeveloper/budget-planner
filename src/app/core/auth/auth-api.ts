import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { debounceTime, delay, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private http = inject(HttpClient);

  private _token = signal<string | null>(localStorage.getItem('token'));
  isLoggedIn = computed<boolean>(() => !!this._token());
  private readonly loginUrl = `${environment.apiUrl}/login`;

  login(username: string, password: string) {
    return this.http.post(this.loginUrl, { username, password }).pipe(
      tap((response: any) => {
        const token = response.token;
        this._token.set(token);
        localStorage.setItem('token', token);
      }),
    );
  }

  logout() {
    localStorage.removeItem('token');
    this._token.set(null);
  }
}
