import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-md w-full glass-card p-8 rounded-skincare space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-3xl font-serif font-bold text-brand-charcoal">Đặt Lại Mật Khẩu</h2>
          <p class="text-xs text-brand-muted">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        @if (errorMessage()) {
          <div class="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-100">
            {{ errorMessage() }}
          </div>
        }
        @if (successMessage()) {
          <div class="bg-emerald-50 text-emerald-700 text-xs p-3.5 rounded-xl border border-emerald-100">
            {{ successMessage() }}
          </div>
        }

        <form (ngSubmit)="submit()" class="space-y-4">
          <div class="space-y-1">
            <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Mật khẩu mới</label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              required
              minlength="8"
              class="w-full px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-sm"
            />
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Xác nhận mật khẩu</label>
            <input
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              class="w-full px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-sm"
            />
          </div>

          <button
            type="submit"
            [disabled]="isSubmitting() || !token"
            class="w-full py-3 btn-fuchsia-glow rounded-full text-xs font-bold"
          >
            {{ isSubmitting() ? 'Đang cập nhật...' : 'Đặt lại mật khẩu' }}
          </button>

          @if (!token) {
            <p class="text-[11px] text-red-500 text-center">
              Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.
            </p>
          }
        </form>

        <div class="text-center text-xs">
          <a routerLink="/login" class="text-brand-fuchsia hover:underline font-semibold">Quay lại đăng nhập</a>
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isSubmitting = signal(false);
  token = '';
  newPassword = '';
  confirmPassword = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  submit() {
    if (!this.token) {
      this.errorMessage.set('Thiếu token đặt lại. Vui lòng dùng liên kết trong email.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.errorMessage.set('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Mật khẩu xác nhận không khớp.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.resetPassword({ token: this.token, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Đã đặt lại mật khẩu thành công. Đang chuyển hướng đến trang đăng nhập...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.message || 'Đặt lại mật khẩu thất bại. Liên kết có thể đã hết hạn.');
      },
    });
  }
}
