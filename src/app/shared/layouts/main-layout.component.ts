import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-brand-champagne">
      <!-- Premium Glass Navigation Header -->
      <app-header></app-header>
      
      <!-- Main Content Outlet with fade animation -->
      <main class="flex-grow animate-fade-in">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Premium Footer -->
      <app-footer></app-footer>
    </div>
  `
})
export class MainLayoutComponent {}
