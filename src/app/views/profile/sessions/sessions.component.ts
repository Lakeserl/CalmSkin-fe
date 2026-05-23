import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { SessionInfo } from '../../../core/models/user.model';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <div class="flex justify-between items-center border-b pb-4 mb-8">
        <h1 class="text-3xl font-serif text-brand-charcoal">
          {{ lang.currentLang() === 'vi' ? 'Phiên đăng nhập' : 'Active Sessions' }}
        </h1>
        <a routerLink="/profile" class="text-xs text-brand-fuchsia hover:underline font-bold">
          ← {{ lang.currentLang() === 'vi' ? 'Về Tài khoản' : 'Back to Profile' }}
        </a>
      </div>

      <p class="text-xs text-brand-muted mb-6">
        {{ lang.currentLang() === 'vi'
          ? 'Danh sách thiết bị đang đăng nhập vào tài khoản của bạn. Hủy phiên nếu bạn không nhận ra.'
          : 'Devices currently signed in to your account. Revoke any you do not recognise.' }}
      </p>

      @if (isLoading()) {
        <div class="text-center py-20 text-brand-muted text-sm">
          {{ lang.currentLang() === 'vi' ? 'Đang tải...' : 'Loading...' }}
        </div>
      } @else if (sessions().length === 0) {
        <p class="text-center py-12 text-brand-muted text-sm">
          {{ lang.currentLang() === 'vi' ? 'Không có phiên hoạt động.' : 'No active sessions.' }}
        </p>
      } @else {
        <div class="space-y-3">
          @for (s of sessions(); track s.id) {
            <div class="bg-white border border-brand-fuchsia-light/20 rounded-xl p-4 flex items-start justify-between gap-4">
              <div class="text-xs space-y-1 flex-1 min-w-0">
                <p class="font-bold text-brand-charcoal truncate" [title]="s.deviceInfo">
                  {{ s.deviceInfo || 'Unknown device' }}
                </p>
                <p class="text-brand-muted font-mono text-[11px]">IP: {{ s.ipAddress || '—' }}</p>
                <p class="text-brand-muted text-[11px]">
                  {{ lang.currentLang() === 'vi' ? 'Đăng nhập' : 'Signed in' }}:
                  {{ s.createdAt | date:'dd/MM/yyyy HH:mm' }}
                </p>
              </div>
              <button (click)="revoke(s.id)" class="px-4 py-2 border border-red-300 text-red-500 rounded-full text-[10px] font-bold hover:bg-red-50 transition shrink-0">
                {{ lang.currentLang() === 'vi' ? 'Hủy phiên' : 'Revoke' }}
              </button>
            </div>
          }
        </div>

        <div class="mt-8 pt-6 border-t border-stone-200">
          <button (click)="logoutAll()" class="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition">
            {{ lang.currentLang() === 'vi' ? 'Đăng xuất khỏi tất cả thiết bị' : 'Sign out of all devices' }}
          </button>
        </div>
      }
    </div>
  `
})
export class SessionsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly lang = inject(LanguageService);

  readonly sessions = signal<SessionInfo[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.userService.getSessions().subscribe({
      next: res => { this.sessions.set(res.data ?? []); this.isLoading.set(false); },
      error: () => { this.sessions.set([]); this.isLoading.set(false); }
    });
  }

  revoke(sessionId: string): void {
    if (!confirm(this.lang.currentLang() === 'vi' ? 'Hủy phiên này?' : 'Revoke this session?')) return;
    this.userService.revokeSession(sessionId).subscribe({
      next: () => this.sessions.update(list => list.filter(s => s.id !== sessionId)),
      error: () => alert(this.lang.currentLang() === 'vi' ? 'Hủy phiên thất bại' : 'Failed to revoke')
    });
  }

  logoutAll(): void {
    if (!confirm(this.lang.currentLang() === 'vi'
      ? 'Đăng xuất khỏi tất cả thiết bị? Bạn sẽ cần đăng nhập lại.'
      : 'Sign out everywhere? You will need to log in again.')) return;
    this.authService.logoutAll().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])  // local state cleared either way
    });
  }
}
