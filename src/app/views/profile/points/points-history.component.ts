import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user.service';
import { LanguageService } from '../../../core/services/language.service';
import { PointTransactionDTO, PointTransactionType, UserPointDTO } from '../../../core/models/user.model';

@Component({
  selector: 'app-points-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <div class="flex items-center justify-between border-b pb-4 mb-6">
        <h1 class="text-2xl font-serif text-brand-charcoal">
          {{ lang.currentLang() === 'vi' ? 'Lịch Sử Điểm Thưởng' : 'Points History' }}
        </h1>
        <a routerLink="/profile" class="text-xs text-brand-fuchsia hover:underline font-semibold">
          ← {{ lang.currentLang() === 'vi' ? 'Quay lại hồ sơ' : 'Back to profile' }}
        </a>
      </div>

      <!-- Summary card -->
      @if (points(); as p) {
        <div class="bg-gradient-to-br from-brand-fuchsia to-brand-fuchsia-dark text-white rounded-skincare p-6 shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider opacity-80">
              {{ lang.currentLang() === 'vi' ? 'Tổng điểm hiện có' : 'Available points' }}
            </p>
            <p class="text-4xl font-extrabold mt-1">{{ p.totalPoints }} <span class="text-base font-semibold opacity-80">xu</span></p>
          </div>
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider opacity-80">
              {{ lang.currentLang() === 'vi' ? 'Hạng thành viên' : 'Tier' }}
            </p>
            <p class="text-xl font-extrabold mt-1">{{ p.tier }}</p>
          </div>
        </div>
      }

      <!-- Filter -->
      <div class="flex flex-wrap gap-2 mb-4 text-xs">
        <button (click)="setFilter('ALL')"
                [class.bg-brand-fuchsia]="filter() === 'ALL'"
                [class.text-white]="filter() === 'ALL'"
                class="px-3 py-1.5 rounded-full border border-brand-fuchsia-light/40 hover:bg-brand-rosewater transition-all">
          {{ lang.currentLang() === 'vi' ? 'Tất cả' : 'All' }}
        </button>
        <button (click)="setFilter('EARN')"
                [class.bg-emerald-500]="filter() === 'EARN'"
                [class.text-white]="filter() === 'EARN'"
                class="px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-50 transition-all">
          + {{ lang.currentLang() === 'vi' ? 'Cộng' : 'Earned' }}
        </button>
        <button (click)="setFilter('SPEND')"
                [class.bg-red-500]="filter() === 'SPEND'"
                [class.text-white]="filter() === 'SPEND'"
                class="px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-50 transition-all">
          − {{ lang.currentLang() === 'vi' ? 'Trừ' : 'Spent' }}
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-skincare border border-stone-100 overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-stone-50 border-b text-brand-charcoal font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th class="p-3">{{ lang.currentLang() === 'vi' ? 'Ngày' : 'Date' }}</th>
              <th class="p-3">{{ lang.currentLang() === 'vi' ? 'Loại' : 'Type' }}</th>
              <th class="p-3 text-right">{{ lang.currentLang() === 'vi' ? 'Điểm' : 'Points' }}</th>
              <th class="p-3">{{ lang.currentLang() === 'vi' ? 'Mô tả' : 'Description' }}</th>
            </tr>
          </thead>
          <tbody>
            @if (isLoading()) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr class="border-b border-stone-100">
                  <td colspan="4" class="p-4"><div class="h-4 bg-stone-100 rounded animate-pulse"></div></td>
                </tr>
              }
            } @else if (filtered().length === 0) {
              <tr><td colspan="4" class="p-10 text-center text-stone-400">
                {{ lang.currentLang() === 'vi' ? 'Chưa có giao dịch nào.' : 'No transactions yet.' }}
              </td></tr>
            } @else {
              @for (tx of filtered(); track tx.id) {
                <tr class="border-b border-stone-100 hover:bg-stone-50/60">
                  <td class="p-3 text-stone-500 font-mono text-[11px]">{{ tx.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider"
                      [class.bg-emerald-100]="isEarn(tx.type)"
                      [class.text-emerald-700]="isEarn(tx.type)"
                      [class.bg-red-100]="!isEarn(tx.type)"
                      [class.text-red-700]="!isEarn(tx.type)">
                      {{ tx.type }}
                    </span>
                  </td>
                  <td class="p-3 text-right font-extrabold font-mono"
                      [class.text-emerald-600]="isEarn(tx.type)"
                      [class.text-red-600]="!isEarn(tx.type)">
                    {{ isEarn(tx.type) ? '+' : '−' }}{{ tx.points }}
                  </td>
                  <td class="p-3 text-brand-charcoal">{{ tx.description }}</td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-end gap-2 mt-4 text-xs">
          <button [disabled]="page() === 0" (click)="goToPage(page() - 1)"
                  class="px-3 py-1.5 border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50">
            {{ lang.currentLang() === 'vi' ? 'Trước' : 'Prev' }}
          </button>
          <span class="text-stone-500">{{ page() + 1 }} / {{ totalPages() }}</span>
          <button [disabled]="page() + 1 >= totalPages()" (click)="goToPage(page() + 1)"
                  class="px-3 py-1.5 border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50">
            {{ lang.currentLang() === 'vi' ? 'Sau' : 'Next' }}
          </button>
        </div>
      }
    </div>
  `,
})
export class PointsHistoryComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  readonly lang = inject(LanguageService);

  readonly points = signal<UserPointDTO | null>(null);
  readonly transactions = signal<PointTransactionDTO[]>([]);
  readonly isLoading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly filter = signal<'ALL' | 'EARN' | 'SPEND'>('ALL');

  readonly filtered = computed(() => {
    const f = this.filter();
    const all = this.transactions();
    if (f === 'ALL') return all;
    if (f === 'EARN') return all.filter((t) => this.isEarn(t.type));
    return all.filter((t) => !this.isEarn(t.type));
  });

  ngOnInit(): void {
    this.loadPoints();
    this.loadTransactions();
  }

  isEarn(type: PointTransactionType): boolean {
    return type === 'EARN' || type === 'REFUND' || type === 'BONUS';
  }

  setFilter(f: 'ALL' | 'EARN' | 'SPEND') {
    this.filter.set(f);
  }

  goToPage(p: number) {
    this.page.set(p);
    this.loadTransactions();
  }

  private loadPoints() {
    this.userService.getPoints()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.points.set(res.data ?? null),
        error: () => this.points.set(null),
      });
  }

  private loadTransactions() {
    this.isLoading.set(true);
    this.userService.getPointTransactions(this.page(), 20)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.transactions.set(res.data?.content ?? []);
          this.totalPages.set(res.data?.totalPages ?? 0);
          this.isLoading.set(false);
        },
        error: () => {
          this.transactions.set([]);
          this.isLoading.set(false);
        },
      });
  }
}
