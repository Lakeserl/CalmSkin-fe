import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../core/services/admin.service';
import {
  PromotionDTO,
  PromotionStatus,
  PromotionType,
  DiscountType,
  CreatePromotionRequest,
  UpdateStatusRequest,
} from '../../../core/models/promotion.model';
import { SpringPage } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-serif font-bold text-stone-800">Promotions</h1>
          <p class="text-xs text-stone-500 mt-1">Manage discount codes, flash sales and campaigns.</p>
        </div>
        <button
          (click)="openCreate()"
          class="px-4 py-2 bg-brand-fuchsia hover:bg-brand-fuchsia-dark text-white rounded-xl text-xs font-bold transition-all"
        >
          + New promotion
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-skincare border border-stone-200 p-4 mb-4 flex flex-wrap gap-3 items-center text-xs">
        <label class="font-semibold text-stone-600">Status:</label>
        <select [(ngModel)]="statusFilter" (change)="onFilterChange()" class="px-3 py-1.5 border border-stone-200 rounded-lg bg-white">
          <option value="">All</option>
          <option value="DRAFT">DRAFT</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PAUSED">PAUSED</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <span class="text-stone-400 ml-auto">{{ totalElements() }} total</span>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-skincare border border-stone-200 overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th class="p-3">ID</th>
              <th class="p-3">Code / Name</th>
              <th class="p-3">Type</th>
              <th class="p-3">Discount</th>
              <th class="p-3">Period</th>
              <th class="p-3">Status</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (isLoading()) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr class="border-b border-stone-100">
                  <td colspan="7" class="p-4"><div class="h-4 bg-stone-100 rounded animate-pulse"></div></td>
                </tr>
              }
            } @else if (promotions().length === 0) {
              <tr><td colspan="7" class="p-10 text-center text-stone-400">No promotions found.</td></tr>
            } @else {
              @for (p of promotions(); track p.id) {
                <tr class="border-b border-stone-100 hover:bg-stone-50/60">
                  <td class="p-3 font-mono text-stone-500">#{{ p.id }}</td>
                  <td class="p-3">
                    <div class="font-bold text-stone-800">{{ p.name }}</div>
                    @if (p.code) { <div class="text-[10px] font-mono text-brand-fuchsia-dark">{{ p.code }}</div> }
                  </td>
                  <td class="p-3"><span class="bg-stone-100 px-2 py-0.5 rounded text-[10px] font-bold">{{ p.type }}</span></td>
                  <td class="p-3 font-bold">
                    {{ p.discountValue }}{{ p.discountType === 'PERCENTAGE' ? '%' : '' }}
                    <div class="text-[10px] font-normal text-stone-500">{{ p.discountType }}</div>
                  </td>
                  <td class="p-3 text-[10px] text-stone-500">
                    {{ p.startsAt | date:'dd/MM/yy HH:mm' }}<br>
                    → {{ p.endsAt | date:'dd/MM/yy HH:mm' }}
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-extrabold"
                      [class.bg-emerald-100]="p.status === 'ACTIVE'"
                      [class.text-emerald-700]="p.status === 'ACTIVE'"
                      [class.bg-amber-100]="p.status === 'PAUSED' || p.status === 'SCHEDULED' || p.status === 'DRAFT'"
                      [class.text-amber-700]="p.status === 'PAUSED' || p.status === 'SCHEDULED' || p.status === 'DRAFT'"
                      [class.bg-stone-100]="p.status === 'EXPIRED' || p.status === 'CANCELLED'"
                      [class.text-stone-600]="p.status === 'EXPIRED' || p.status === 'CANCELLED'"
                    >{{ p.status }}</span>
                  </td>
                  <td class="p-3 text-right space-x-2 whitespace-nowrap">
                    @if (p.status !== 'ACTIVE') {
                      <button (click)="changeStatus(p, 'ACTIVE')" class="text-emerald-600 hover:underline font-bold">Activate</button>
                    }
                    @if (p.status === 'ACTIVE') {
                      <button (click)="changeStatus(p, 'PAUSED')" class="text-amber-600 hover:underline font-bold">Pause</button>
                    }
                    @if (p.status !== 'CANCELLED' && p.status !== 'EXPIRED') {
                      <button (click)="changeStatus(p, 'CANCELLED')" class="text-red-500 hover:underline font-bold">Cancel</button>
                    }
                  </td>
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
                  class="px-3 py-1.5 border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50">Prev</button>
          <span class="text-stone-500">{{ page() + 1 }} / {{ totalPages() }}</span>
          <button [disabled]="page() + 1 >= totalPages()" (click)="goToPage(page() + 1)"
                  class="px-3 py-1.5 border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50">Next</button>
        </div>
      }

      <!-- Create modal -->
      @if (showCreate()) {
        <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" (click)="closeCreate()">
          <div class="bg-white rounded-skincare w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-4 pb-3 border-b">
              <h2 class="text-lg font-serif font-bold">New promotion</h2>
              <button (click)="closeCreate()" class="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form (ngSubmit)="onSubmitCreate()" class="space-y-3 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Code (optional)</label>
                  <input [(ngModel)]="newCode" name="code" placeholder="WELCOME10"
                         class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg uppercase" />
                </div>
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Name *</label>
                  <input [(ngModel)]="newName" name="name" required
                         class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg" />
                </div>
              </div>

              <div>
                <label class="font-bold text-stone-600 uppercase text-[10px]">Description</label>
                <textarea [(ngModel)]="newDescription" name="description" rows="2"
                          class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Type *</label>
                  <select [(ngModel)]="newType" name="type" class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg bg-white">
                    <option value="VOUCHER">VOUCHER</option>
                    <option value="FLASH_SALE">FLASH_SALE</option>
                    <option value="PRODUCT_DISCOUNT">PRODUCT_DISCOUNT</option>
                    <option value="CATEGORY_DISCOUNT">CATEGORY_DISCOUNT</option>
                    <option value="BUNDLE">BUNDLE</option>
                    <option value="FREE_GIFT">FREE_GIFT</option>
                  </select>
                </div>
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Discount type *</label>
                  <select [(ngModel)]="newDiscountType" name="discountType" class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg bg-white">
                    <option value="PERCENTAGE">PERCENTAGE</option>
                    <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
                    <option value="FREE_SHIPPING">FREE_SHIPPING</option>
                    <option value="FREE_GIFT">FREE_GIFT</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Discount value *</label>
                  <input type="number" [(ngModel)]="newDiscountValue" name="discountValue" required min="0"
                         class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg" />
                </div>
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Max discount</label>
                  <input type="number" [(ngModel)]="newMaxDiscount" name="maxDiscount" min="0"
                         class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg" />
                </div>
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Min order</label>
                  <input type="number" [(ngModel)]="newMinOrder" name="minOrder" min="0"
                         class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Starts at *</label>
                  <input type="datetime-local" [(ngModel)]="newStartsAt" name="startsAt" required
                         class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg" />
                </div>
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Ends at *</label>
                  <input type="datetime-local" [(ngModel)]="newEndsAt" name="endsAt" required
                         class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Total usage limit</label>
                  <input type="number" [(ngModel)]="newTotalLimit" name="totalLimit" min="0"
                         class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg" />
                </div>
                <div>
                  <label class="font-bold text-stone-600 uppercase text-[10px]">Per-user limit</label>
                  <input type="number" [(ngModel)]="newPerUserLimit" name="perUserLimit" min="0"
                         class="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg" />
                </div>
              </div>

              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="newIsStackable" name="isStackable" />
                <span class="text-stone-600">Stackable with other promotions</span>
              </label>

              @if (createError()) {
                <p class="text-red-500 font-bold">{{ createError() }}</p>
              }

              <div class="flex justify-end gap-2 pt-3 border-t">
                <button type="button" (click)="closeCreate()" class="px-4 py-2 border border-stone-200 rounded-xl">Cancel</button>
                <button type="submit" [disabled]="isSaving()" class="px-4 py-2 bg-brand-fuchsia text-white rounded-xl font-bold">
                  {{ isSaving() ? 'Saving...' : 'Create promotion' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminPromotionsComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly promotions = signal<PromotionDTO[]>([]);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly isLoading = signal(false);
  readonly showCreate = signal(false);
  readonly isSaving = signal(false);
  readonly createError = signal('');

  statusFilter = '';
  newCode = '';
  newName = '';
  newDescription = '';
  newType: PromotionType = 'VOUCHER';
  newDiscountType: DiscountType = 'PERCENTAGE';
  newDiscountValue = 10;
  newMaxDiscount: number | null = null;
  newMinOrder: number | null = null;
  newStartsAt = '';
  newEndsAt = '';
  newTotalLimit: number | null = null;
  newPerUserLimit: number | null = null;
  newIsStackable = false;

  ngOnInit(): void {
    this.load();
  }

  onFilterChange() {
    this.page.set(0);
    this.load();
  }

  goToPage(p: number) {
    this.page.set(p);
    this.load();
  }

  private load() {
    this.isLoading.set(true);
    this.admin.listPromotions(this.page(), 20, this.statusFilter || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data as SpringPage<PromotionDTO>;
          this.promotions.set(data?.content ?? []);
          this.totalPages.set(data?.totalPages ?? 0);
          this.totalElements.set(data?.totalElements ?? 0);
          this.isLoading.set(false);
        },
        error: () => {
          this.promotions.set([]);
          this.isLoading.set(false);
        },
      });
  }

  changeStatus(p: PromotionDTO, status: PromotionStatus) {
    const body: UpdateStatusRequest = { status };
    this.admin.updatePromotionStatus(p.id, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.load(),
        error: (err) => alert(err?.message || 'Failed to update status'),
      });
  }

  openCreate() {
    this.createError.set('');
    this.showCreate.set(true);
  }

  closeCreate() {
    this.showCreate.set(false);
  }

  onSubmitCreate() {
    if (!this.newName || !this.newStartsAt || !this.newEndsAt) return;
    this.isSaving.set(true);
    this.createError.set('');

    const body: CreatePromotionRequest = {
      code: this.newCode || undefined,
      name: this.newName,
      description: this.newDescription || undefined,
      type: this.newType,
      discountType: this.newDiscountType,
      discountValue: this.newDiscountValue,
      maxDiscountAmount: this.newMaxDiscount ?? undefined,
      minOrderValue: this.newMinOrder ?? undefined,
      totalUsageLimit: this.newTotalLimit ?? undefined,
      perUserLimit: this.newPerUserLimit ?? undefined,
      startsAt: this.newStartsAt,
      endsAt: this.newEndsAt,
      isStackable: this.newIsStackable,
    };

    this.admin.createPromotion(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.showCreate.set(false);
          this.resetForm();
          this.load();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.createError.set(err?.message || 'Failed to create promotion');
        },
      });
  }

  private resetForm() {
    this.newCode = '';
    this.newName = '';
    this.newDescription = '';
    this.newType = 'VOUCHER';
    this.newDiscountType = 'PERCENTAGE';
    this.newDiscountValue = 10;
    this.newMaxDiscount = null;
    this.newMinOrder = null;
    this.newStartsAt = '';
    this.newEndsAt = '';
    this.newTotalLimit = null;
    this.newPerUserLimit = null;
    this.newIsStackable = false;
  }
}
