import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PromotionService } from '../../../core/services/promotion.service';
import { LanguageService } from '../../../core/services/language.service';
import { MyVoucherDTO, VoucherInfoDTO } from '../../../core/models/promotion.model';

@Component({
  selector: 'app-vouchers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <div class="flex items-center justify-between border-b pb-4 mb-6">
        <h1 class="text-2xl font-serif text-brand-charcoal">
          {{ lang.currentLang() === 'vi' ? 'Ví Voucher' : 'My Vouchers' }}
        </h1>
        <a routerLink="/profile" class="text-xs text-brand-fuchsia hover:underline font-semibold">
          ← {{ lang.currentLang() === 'vi' ? 'Quay lại hồ sơ' : 'Back to profile' }}
        </a>
      </div>

      <!-- Claim by code -->
      <div class="bg-white p-5 rounded-skincare border border-brand-fuchsia-light/20 shadow-sm mb-8">
        <h2 class="text-sm font-bold text-brand-charcoal mb-3">
          {{ lang.currentLang() === 'vi' ? 'Nhập mã voucher' : 'Redeem voucher code' }}
        </h2>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            [(ngModel)]="claimCode"
            (input)="previewMessage.set(''); previewInfo.set(null)"
            placeholder="WELCOME10"
            class="flex-1 px-4 py-2.5 rounded-xl border border-brand-fuchsia-light/40 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-fuchsia uppercase"
          />
          <button
            (click)="onPreview()"
            [disabled]="!claimCode || isPreviewing()"
            class="px-4 py-2.5 border border-brand-fuchsia text-brand-fuchsia hover:bg-brand-rosewater rounded-xl text-xs font-bold transition-all"
          >
            {{ isPreviewing() ? '...' : (lang.currentLang() === 'vi' ? 'Kiểm tra' : 'Preview') }}
          </button>
          <button
            (click)="onClaim()"
            [disabled]="!claimCode || isClaiming()"
            class="px-4 py-2.5 btn-fuchsia-glow rounded-xl text-xs font-bold"
          >
            {{ isClaiming() ? '...' : (lang.currentLang() === 'vi' ? 'Nhận voucher' : 'Claim') }}
          </button>
        </div>

        @if (previewInfo(); as info) {
          <div class="mt-3 text-xs rounded-xl p-3 border"
               [class.bg-emerald-50]="info.isValid"
               [class.border-emerald-200]="info.isValid"
               [class.text-emerald-700]="info.isValid"
               [class.bg-red-50]="!info.isValid"
               [class.border-red-200]="!info.isValid"
               [class.text-red-700]="!info.isValid">
            <strong>{{ info.name }}</strong> — {{ info.discountType }} {{ info.discountValue }}
            @if (info.minOrderValue) {
              <span> · min {{ info.minOrderValue | currency:'VND':'symbol':'1.0-0' }}</span>
            }
            <div class="text-[10px] mt-1">
              {{ lang.currentLang() === 'vi' ? 'Hết hạn' : 'Expires' }}:
              {{ info.endsAt | date:'dd/MM/yyyy HH:mm' }}
              @if (!info.isValid && info.reason) {
                <span class="block mt-0.5">{{ info.reason }}</span>
              }
            </div>
          </div>
        }

        @if (claimMessage()) {
          <p class="mt-3 text-xs text-brand-fuchsia-dark font-semibold">{{ claimMessage() }}</p>
        }
        @if (errorMessage()) {
          <p class="mt-3 text-xs text-red-500 font-semibold">{{ errorMessage() }}</p>
        }
      </div>

      <!-- My vouchers list -->
      <h2 class="text-sm font-bold text-brand-charcoal mb-3">
        {{ lang.currentLang() === 'vi' ? 'Voucher của bạn' : 'Your vouchers' }}
      </h2>

      @if (isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white rounded-skincare h-28 animate-pulse border border-stone-100"></div>
          }
        </div>
      } @else if (myVouchers().length === 0) {
        <div class="text-center py-12 text-brand-muted text-xs">
          {{ lang.currentLang() === 'vi' ? 'Chưa có voucher nào. Hãy nhập mã ở trên!' : 'No vouchers yet. Enter a code above!' }}
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @for (v of myVouchers(); track v.code) {
            <div class="relative bg-gradient-to-br from-brand-fuchsia to-brand-fuchsia-dark text-white rounded-skincare p-5 shadow-md overflow-hidden">
              <div class="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
              <div class="absolute -left-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full"></div>

              <p class="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                {{ lang.currentLang() === 'vi' ? 'Mã' : 'Code' }}
              </p>
              <p class="text-lg font-extrabold font-mono">{{ v.code }}</p>
              <p class="text-xs font-semibold mt-1 opacity-90">{{ v.name }}</p>
              <div class="text-[10px] mt-2 space-y-0.5 opacity-90">
                <p>
                  {{ lang.currentLang() === 'vi' ? 'Đã dùng' : 'Used' }}:
                  <strong>{{ v.usedCount }}{{ v.usageLimit ? ' / ' + v.usageLimit : '' }}</strong>
                </p>
                <p>{{ lang.currentLang() === 'vi' ? 'Hết hạn' : 'Expires' }}: {{ v.endsAt | date:'dd/MM/yyyy' }}</p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class VouchersComponent implements OnInit {
  private readonly promotionService = inject(PromotionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly lang = inject(LanguageService);

  readonly myVouchers = signal<MyVoucherDTO[]>([]);
  readonly previewInfo = signal<VoucherInfoDTO | null>(null);
  readonly previewMessage = signal('');
  readonly claimMessage = signal('');
  readonly errorMessage = signal('');
  readonly isLoading = signal(false);
  readonly isPreviewing = signal(false);
  readonly isClaiming = signal(false);
  claimCode = '';

  ngOnInit(): void {
    this.loadVouchers();
  }

  private loadVouchers() {
    this.isLoading.set(true);
    this.promotionService.getMyVouchers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.myVouchers.set(res.data ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.myVouchers.set([]);
          this.isLoading.set(false);
        },
      });
  }

  onPreview() {
    if (!this.claimCode) return;
    this.isPreviewing.set(true);
    this.errorMessage.set('');
    this.promotionService.getInfoByCode(this.claimCode.trim().toUpperCase())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.previewInfo.set(res.data);
          this.isPreviewing.set(false);
        },
        error: (err) => {
          this.isPreviewing.set(false);
          this.previewInfo.set(null);
          this.errorMessage.set(err?.message || (this.lang.currentLang() === 'vi' ? 'Mã không hợp lệ' : 'Invalid code'));
        },
      });
  }

  onClaim() {
    if (!this.claimCode) return;
    this.isClaiming.set(true);
    this.errorMessage.set('');
    this.claimMessage.set('');
    this.promotionService.claimVoucher(this.claimCode.trim().toUpperCase())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isClaiming.set(false);
          this.claimMessage.set(
            this.lang.currentLang() === 'vi' ? 'Đã thêm vào ví voucher của bạn!' : 'Voucher added to your wallet!',
          );
          this.claimCode = '';
          this.previewInfo.set(null);
          this.loadVouchers();
        },
        error: (err) => {
          this.isClaiming.set(false);
          this.errorMessage.set(err?.message || (this.lang.currentLang() === 'vi' ? 'Không thể nhận voucher' : 'Failed to claim voucher'));
        },
      });
  }
}
