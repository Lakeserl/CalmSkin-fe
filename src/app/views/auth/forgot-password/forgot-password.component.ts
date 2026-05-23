import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-md w-full glass-card p-8 rounded-skincare space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-3xl font-serif font-bold text-brand-charcoal">Quên Mật Khẩu</h2>
          <p class="text-xs text-brand-muted">Nhập email — chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
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
            <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="VD: nguyenanh@gmail.com"
              class="w-full px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-sm"
            />
          </div>

          <button
            type="submit"
            [disabled]="isSubmitting()"
            class="w-full py-3 btn-fuchsia-glow rounded-full text-xs font-bold"
          >
            {{ isSubmitting() ? 'Đang gửi...' : 'Gửi liên kết đặt lại' }}
          </button>
        </form>

        <div class="text-center text-xs">
          <a routerLink="/login" class="text-brand-fuchsia hover:underline font-semibold">Quay lại đăng nhập</a>
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isSubmitting = signal(false);
  email = '';

  submit() {
    if (!this.email) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Đã gửi liên kết đặt lại tới email của bạn. Vui lòng kiểm tra hộp thư.');
        this.email = '';
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.message || 'Không thể gửi email đặt lại. Vui lòng thử lại sau.');
      },
    });
  }
}
