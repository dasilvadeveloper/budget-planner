import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Toolbar } from '../toolbar/toolbar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Toolbar, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  protected readonly title = signal('budget-planner');

  isSidebarExpanded = signal<boolean>(false);
  screenWidth = signal<number>(window.innerWidth);

  toggleSidebar(action: boolean): void {
    this.isSidebarExpanded.set(action);
  }
}
