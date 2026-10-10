import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('allows navigation when there is a session', () => {
    localStorage.setItem('token', 'stored-token');

    expect(runGuard()).toBe(true);
  });

  it('redirects to the login page when there is no session', () => {
    const router = TestBed.inject(Router);

    expect(runGuard()).toEqual(router.createUrlTree(['/login']));
  });
});
