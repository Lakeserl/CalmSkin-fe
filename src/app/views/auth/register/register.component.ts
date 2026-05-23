import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-md w-full glass-card p-8 rounded-skincare space-y-6">
        
        @if (!showOtpVerification()) {
          <!-- Step 1: Sign up details -->
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-serif font-bold text-brand-charcoal">Tạo Tài Khoản</h2>
            <p class="text-xs text-brand-muted">Đăng ký thành viên CalmSKIN để nhận ngay 100 điểm thưởng (xu) mua sắm.</p>
          </div>

          @if (errorMessage()) {
            <div class="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-100 flex items-start space-x-2 animate-fade-in">
              <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form (ngSubmit)="onRegister()" class="space-y-4">
            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Họ và Tên</label>
              <input 
                type="text" 
                [(ngModel)]="fullName" 
                name="fullName" 
                required
                placeholder="VD: Nguyễn Khánh Linh"
                class="w-full px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-sm transition-all"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Địa chỉ Email</label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                required
                placeholder="VD: khanhlinh@gmail.com"
                class="w-full px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-sm transition-all"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Số Điện Thoại</label>
              <input 
                type="tel" 
                [(ngModel)]="phoneNumber" 
                name="phoneNumber" 
                required
                placeholder="VD: 0987654321"
                class="w-full px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-sm transition-all"
              />
            </div>
            
            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Mật khẩu</label>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                required
                placeholder="Ít nhất 6 ký tự..."
                class="w-full px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-sm transition-all"
              />
            </div>

            <button 
              type="submit" 
              [disabled]="isLoading()"
              class="w-full py-3.5 btn-fuchsia-glow rounded-full text-xs font-semibold transition-all flex items-center justify-center space-x-2"
            >
              @if (isLoading()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Đang xử lý đăng ký...</span>
              } @else {
                <span>Đăng Ký Thành Viên</span>
              }
            </button>
          </form>

          <div class="border-t pt-4 text-center">
            <p class="text-xs text-brand-muted">
              Đã có tài khoản CalmSKIN? 
              <a routerLink="/login" class="text-brand-fuchsia font-semibold hover:underline">Đăng nhập</a>
            </p>
          </div>
        } @else {
          
          <!-- Step 2: OTP Verification -->
          <div class="text-center space-y-2 animate-fade-in">
            <div class="w-16 h-16 rounded-full bg-brand-rosewater text-brand-fuchsia flex items-center justify-center mx-auto mb-2 animate-pulse-glow">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0122 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>
            </div>
            <h2 class="text-2xl font-serif font-bold text-brand-charcoal">Xác Thực Tài Khoản</h2>
            <p class="text-xs text-brand-muted">
              Một mã OTP gồm 6 chữ số vừa được gửi tới email <span class="font-bold text-brand-charcoal">{{ email }}</span>. Vui lòng nhập mã để kích hoạt tài khoản CalmSKIN.
            </p>
          </div>

          @if (errorMessage()) {
            <div class="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-100 flex items-start space-x-2 animate-fade-in">
              <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form (ngSubmit)="onVerifyOtp()" class="space-y-4">
            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider block text-center">Mã kích hoạt OTP</label>
              <input 
                type="text" 
                [(ngModel)]="otpCode" 
                name="otpCode" 
                required
                placeholder="Nhập 6 chữ số..."
                class="w-full px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-base transition-all text-center tracking-widest font-bold font-serif"
              />
            </div>

            <button 
              type="submit" 
              [disabled]="isLoading() || !otpCode"
              class="w-full py-3.5 btn-fuchsia-glow rounded-full text-xs font-semibold transition-all flex items-center justify-center space-x-2"
            >
              @if (isLoading()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Đang kích hoạt...</span>
              } @else {
                <span>Kích Hoạt Tài Khoản</span>
              }
            </button>
          </form>

          <div class="pt-4 text-center text-xs text-brand-muted border-t">
            <p>Không nhận được email? <button (click)="resendVerificationCode()" class="text-brand-fuchsia font-semibold hover:underline">Gửi lại mã kích hoạt</button></p>
          </div>
        }

      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  fullName = '';
  email = '';
  phoneNumber = '';
  password = '';

  readonly showOtpVerification = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  
  otpCode = '';

  onRegister() {
    if (!this.fullName || !this.email || !this.phoneNumber || !this.password) return;
    
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = {
      fullName: this.fullName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      password: this.password
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showOtpVerification.set(true);
        this.errorMessage.set(null);
        alert('Đăng ký thành công! Vui lòng kiểm tra hộp thư email của bạn để lấy mã OTP kích hoạt. (Trong môi trường test, mã OTP test được in ra ở console backend là 123456)');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Đăng ký thất bại. Email hoặc Số điện thoại có thể đã được đăng ký.');
      }
    });
  }

  onVerifyOtp() {
    if (!this.otpCode) return;
    
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.verifyEmail(this.email, this.otpCode).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        alert('Kích hoạt tài khoản thành công! Bây giờ bạn có thể đăng nhập.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Mã xác thực OTP không đúng hoặc đã hết hạn.');
      }
    });
  }

  resendVerificationCode() {
    this.authService.resendVerification(this.email).subscribe({
      next: () => {
        alert('Đã gửi lại mã kích hoạt mới tới email của bạn.');
      },
      error: (err) => {
        alert(err.message || 'Gửi lại mã thất bại.');
      }
    });
  }
}
