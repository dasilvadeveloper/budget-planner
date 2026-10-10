import { Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthApi } from '../../core/auth/auth-api';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  imports: [RouterLink, RouterLinkActive],
})
export class Sidebar {
  authService = inject(AuthApi)
  router = inject(Router)

  isSidebardExpanded = input.required<boolean>();
  changeisSidebardExpanded = output<boolean>();

  collapse(): void {
    this.changeisSidebardExpanded.emit(false);
  }

  logout() {
    this.authService.logout()
    this.router.navigate(['login'])
  }

  expand(): void {
    this.changeisSidebardExpanded.emit(true);
  }
}
