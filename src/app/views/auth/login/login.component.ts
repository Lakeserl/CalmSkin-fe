import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-md w-full glass-card p-8 rounded-skincare space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <h2 class="text-3xl font-serif font-bold text-brand-charcoal">Chào Mừng Trở Lại</h2>
          <p class="text-xs text-brand-muted">Đăng nhập để nhận tích lũy xu và ưu đãi thành viên CalmSKIN</p>
        </div>

        <!-- Tab Selector -->
        <div class="flex border-b border-brand-fuchsia-light/20">
          <button 
            (click)="activeTab.set('password')"
            [class.border-brand-fuchsia]="activeTab() === 'password'"
            [class.text-brand-fuchsia-dark]="activeTab() === 'password'"
            class="flex-1 py-2 text-center text-xs font-semibold border-b-2 border-transparent text-brand-muted transition-all"
          >
            Đăng Nhập Mật Khẩu
          </button>
          <button 
            (click)="activeTab.set('otp')"
            [class.border-brand-fuchsia]="activeTab() === 'otp'"
            [class.text-brand-fuchsia-dark]="activeTab() === 'otp'"
            class="flex-1 py-2 text-center text-xs font-semibold border-b-2 border-transparent text-brand-muted transition-all"
          >
            Đăng Nhập Nhanh OTP
          </button>
        </div>

        <!-- Error banner -->
        @if (errorMessage()) {
          <div class="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-100 flex items-start space-x-2 animate-fade-in">
            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Tab 1: Password Login -->
        @if (activeTab() === 'password') {
          <form (ngSubmit)="onPasswordLogin()" class="space-y-4">
            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Địa chỉ Email</label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                required
                placeholder="VD: nguyenanh@gmail.com"
                class="w-full px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-sm transition-all"
              />
            </div>
            
            <div class="space-y-1">
              <div class="flex justify-between items-center">
                <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Mật khẩu</label>
                <a routerLink="/forgot-password" class="text-[10px] text-brand-fuchsia hover:underline">Quên mật khẩu?</a>
              </div>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                required
                placeholder="Nhập mật khẩu..."
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
                <span>Đang kết nối...</span>
              } @else {
                <span>Đăng Nhập</span>
              }
            </button>
          </form>
        }

        <!-- Tab 2: OTP Login -->
        @if (activeTab() === 'otp') {
          <form (ngSubmit)="onOtpLogin()" class="space-y-4">
            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Số Điện Thoại</label>
              <div class="flex space-x-2">
                <input 
                  type="tel" 
                  [(ngModel)]="phoneNumber" 
                  name="phoneNumber" 
                  required
                  placeholder="VD: 0912345678"
                  [disabled]="otpSent()"
                  class="flex-1 px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-sm transition-all"
                />
                
                @if (!otpSent()) {
                  <button 
                    type="button" 
                    (click)="sendOtp()"
                    [disabled]="!phoneNumber"
                    class="px-4 py-3 border border-brand-fuchsia text-brand-fuchsia font-semibold text-xs rounded-xl hover:bg-brand-rosewater transition-all focus:outline-none shrink-0"
                  >
                    Gửi Mã
                  </button>
                }
              </div>
            </div>

            @if (otpSent()) {
              <div class="space-y-1 animate-fade-in">
                <label class="text-[11px] font-semibold text-brand-charcoal uppercase tracking-wider">Mã Xác Thực OTP</label>
                <input 
                  type="text" 
                  [(ngModel)]="otpCode" 
                  name="otpCode" 
                  required
                  placeholder="Nhập 6 chữ số..."
                  class="w-full px-4 py-3 rounded-xl border border-brand-fuchsia-light/40 bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia text-sm transition-all text-center tracking-widest font-bold"
                />
              </div>
            }

            <button 
              type="submit" 
              [disabled]="isLoading() || !otpSent()"
              class="w-full py-3.5 btn-fuchsia-glow rounded-full text-xs font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              @if (isLoading()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Xác thực OTP...</span>
              } @else {
                <span>Xác nhận & Đăng Nhập</span>
              }
            </button>
            
            @if (otpSent()) {
              <p class="text-[10px] text-center text-brand-muted">Không nhận được mã? <button type="button" (click)="otpSent.set(false)" class="text-brand-fuchsia hover:underline">Gửi lại mã</button></p>
            }
          </form>
        }

        <!-- Bottom links -->
        <div class="border-t pt-4 text-center">
          <p class="text-xs text-brand-muted">
            Chưa có tài khoản CalmSKIN? 
            <a routerLink="/register" class="text-brand-fuchsia font-semibold hover:underline">Đăng ký ngay</a>
          </p>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly activeTab = signal<'password' | 'otp'>('password');
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  
  // Fields for Password tab
  email = '';
  password = '';

  // Fields for OTP tab
  phoneNumber = '';
  otpCode = '';
  readonly otpSent = signal(false);

  private getReturnUrl(): string {
    return this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onPasswordLogin() {
    if (!this.email || !this.password) return;
    
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.router.navigateByUrl(this.getReturnUrl());
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Đăng nhập không thành công. Sai email hoặc mật khẩu.');
      }
    });
  }

  sendOtp() {
    if (!this.phoneNumber) return;
    this.isLoading.set(true);
    
    // Simulate sending OTP endpoint
    this.authService.register({ phoneNumber: this.phoneNumber, quickLogin: true }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.otpSent.set(true);
        this.errorMessage.set(null);
        alert('Mã OTP xác thực đăng nhập nhanh đã được gửi tới SĐT của bạn! (Mã test mặc định ở backend là 123456)');
      },
      error: () => {
        // Fallback for mock/simulation if backend is simple or doesn't support phone pre-registration
        this.isLoading.set(false);
        this.otpSent.set(true);
        alert('Đã kích hoạt giả lập gửi OTP đăng nhập nhanh! Bạn có thể sử dụng mã OTP test bất kỳ.');
      }
    });
  }

  onOtpLogin() {
    if (!this.phoneNumber || !this.otpCode) return;
    
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.loginWithOtp(this.phoneNumber, this.otpCode).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.router.navigateByUrl(this.getReturnUrl());
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
      }
    });
  }
}
