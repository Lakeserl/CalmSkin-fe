import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';
import { ChatbotWidgetComponent } from '../../features/chatbot/chatbot-widget.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatbotWidgetComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-brand-champagne">
      <app-header />

      <main class="flex-grow animate-fade-in">
        <router-outlet />
      </main>

      <app-footer />

      <!-- Floating AI advisor (auth-gated inside the component) -->
      <app-chatbot-widget />
    </div>
  `
})
export class MainLayoutComponent {}
