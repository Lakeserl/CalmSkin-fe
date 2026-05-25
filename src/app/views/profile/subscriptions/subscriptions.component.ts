import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { SubscriptionDTO, SubscriptionStatus } from '../../../core/models/subscription.model';
import { ProductDTO, ProductSummaryDTO } from '../../../core/models/product.model';
import { AddressDTO } from '../../../core/models/auth.model';

interface HydratedSubscription {
  subscription: SubscriptionDTO;
  product?: ProductDTO;
  address?: AddressDTO;
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      
      <!-- Header -->
      <div class="flex justify-between items-center border-b pb-4 mb-8">
        <h1 class="text-3xl font-serif text-brand-charcoal">
          {{ lang.currentLang() === 'vi' ? 'Đăng ký giao định kỳ' : 'My Subscriptions' }}
        </h1>
        <div class="flex items-center space-x-4">
          <button (click)="openCreateModal()" class="px-4 py-2 bg-brand-fuchsia text-white rounded-full font-bold text-[11px] hover:bg-brand-fuchsia-dark transition-all">
            + {{ lang.currentLang() === 'vi' ? 'Tạo đăng ký mới' : 'New Subscription' }}
          </button>
          <a routerLink="/profile" class="text-xs text-brand-fuchsia hover:underline font-bold">
            ← {{ lang.currentLang() === 'vi' ? 'Về Tài khoản' : 'Back to Profile' }}
          </a>
        </div>
      </div>

      <!-- Main Loading -->
      @if (isLoading()) {
        <div class="text-center py-20 text-brand-muted text-sm">
          {{ lang.currentLang() === 'vi' ? 'Đang tải thông tin đăng ký...' : 'Loading subscriptions...' }}
        </div>
      } @else if (hydratedSubscriptions().length === 0) {
        <!-- Empty State -->
        <div class="text-center py-20 bg-white border border-brand-fuchsia-light/10 rounded-skincare space-y-4">
          <div class="text-5xl">📦</div>
          <p class="text-brand-charcoal font-semibold text-sm">
            {{ lang.currentLang() === 'vi' ? 'Bạn chưa đăng ký giao định kỳ cho sản phẩm nào.' : 'You have no periodic product subscriptions.' }}
          </p>
          <p class="text-xs text-brand-muted max-w-sm mx-auto">
            {{ lang.currentLang() === 'vi' ? 'Đăng ký định kỳ để tự động giao mỹ phẩm yêu thích đến nhà mỗi tháng và nhận nhiều ưu đãi hơn.' : 'Subscribe to automatically get your favorite skincare delivered monthly and save.' }}
          </p>
          <button (click)="openCreateModal()" class="mt-4 px-6 py-2.5 bg-brand-fuchsia text-white rounded-full font-bold text-xs">
            {{ lang.currentLang() === 'vi' ? 'Khám phá sản phẩm đăng ký' : 'Subscribe to a Product' }}
          </button>
        </div>
      } @else {
        <!-- Subscriptions Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (item of hydratedSubscriptions(); track item.subscription.id) {
            <div class="bg-white rounded-skincare border border-brand-fuchsia-light/10 shadow-sm p-6 flex flex-col justify-between hover:border-brand-fuchsia/30 transition-all">
              
              <!-- Top Row: Product info and Badge -->
              <div class="space-y-4">
                <div class="flex justify-between items-start gap-4">
                  <div class="flex items-center space-x-3">
                    <img 
                      [src]="item.product?.images?.[0]?.imageUrl || 'assets/placeholder.jpg'" 
                      class="w-16 h-16 object-cover rounded-xl border bg-brand-champagne shrink-0" 
                    />
                    <div>
                      <span class="text-[9px] font-bold text-brand-fuchsia uppercase tracking-wider">{{ item.product?.brand?.name || 'CalmSKIN' }}</span>
                      <h3 class="font-bold text-brand-charcoal text-sm line-clamp-1">{{ item.product?.name || 'Sản phẩm CalmSKIN' }}</h3>
                      <p class="text-xs font-semibold text-brand-fuchsia-dark mt-0.5">
                        {{ (item.product?.salePrice || item.product?.basePrice || 0) | currency:'VND':'symbol':'1.0-0' }}
                      </p>
                    </div>
                  </div>
                  
                  <span class="text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm shrink-0"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-700': item.subscription.status === 'ACTIVE',
                      'bg-amber-100 text-amber-700': item.subscription.status === 'PAUSED',
                      'bg-stone-100 text-brand-muted': item.subscription.status === 'CANCELLED'
                    }"
                  >
                    {{ item.subscription.status }}
                  </span>
                </div>

                <!-- Middle Details -->
                <div class="border-t pt-3 mt-2 text-xs space-y-2 font-medium">
                  <div class="flex justify-between">
                    <span class="text-brand-muted">{{ lang.currentLang() === 'vi' ? 'Tần suất giao:' : 'Frequency:' }}</span>
                    <strong class="text-brand-charcoal">{{ lang.currentLang() === 'vi' ? 'Mỗi ' + item.subscription.frequencyDays + ' ngày' : 'Every ' + item.subscription.frequencyDays + ' days' }}</strong>
                  </div>
                  @if (item.subscription.nextOrderDueAt) {
                    <div class="flex justify-between">
                      <span class="text-brand-muted">{{ lang.currentLang() === 'vi' ? 'Giao tiếp theo:' : 'Next delivery:' }}</span>
                      <strong class="text-brand-charcoal">{{ item.subscription.nextOrderDueAt | date:'dd/MM/yyyy' }}</strong>
                    </div>
                  }
                  @if (item.subscription.lastOrderedAt) {
                    <div class="flex justify-between">
                      <span class="text-brand-muted">{{ lang.currentLang() === 'vi' ? 'Lần giao gần nhất:' : 'Last delivery:' }}</span>
                      <strong class="text-brand-charcoal">{{ item.subscription.lastOrderedAt | date:'dd/MM/yyyy' }}</strong>
                    </div>
                  }
                  
                  <!-- Address snippet -->
                  <div class="border-t pt-2 mt-2 space-y-1">
                    <span class="text-[10px] text-brand-muted uppercase tracking-wider block">{{ lang.currentLang() === 'vi' ? 'Địa chỉ giao hàng' : 'Shipping Address' }}</span>
                    @if (item.address) {
                      <p class="text-brand-charcoal font-semibold">{{ item.address.recipientName }} - {{ item.address.phone }}</p>
                      <p class="text-brand-muted text-[11px] leading-relaxed">
                        {{ item.address.street }}, {{ item.address.ward }}, {{ item.address.district }}, {{ item.address.province }}
                      </p>
                    } @else {
                      <p class="text-red-500 text-[10px]">{{ lang.currentLang() === 'vi' ? 'Địa chỉ không khả dụng (đã bị xóa).' : 'Address unavailable (deleted).' }}</p>
                    }
                  </div>
                </div>
              </div>

              <!-- Bottom Actions -->
              <div class="border-t pt-4 mt-6 flex flex-wrap gap-2 justify-end font-semibold text-[11px]">
                @if (item.subscription.status === 'ACTIVE') {
                  <button (click)="pauseSub(item.subscription.id)" class="px-4 py-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-full transition-all">
                    {{ lang.currentLang() === 'vi' ? 'Tạm ngưng' : 'Pause' }}
                  </button>
                  <button (click)="openEditModal(item)" class="px-4 py-2 border border-brand-fuchsia text-brand-fuchsia hover:bg-brand-rosewater rounded-full transition-all">
                    {{ lang.currentLang() === 'vi' ? 'Thay đổi' : 'Edit' }}
                  </button>
                  <button (click)="cancelSub(item.subscription.id)" class="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-full transition-all">
                    {{ lang.currentLang() === 'vi' ? 'Hủy đăng kỳ' : 'Cancel' }}
                  </button>
                } @else if (item.subscription.status === 'PAUSED') {
                  <button (click)="resumeSub(item.subscription.id)" class="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-full transition-all shadow-sm">
                    {{ lang.currentLang() === 'vi' ? 'Kích hoạt lại' : 'Resume' }}
                  </button>
                  <button (click)="openEditModal(item)" class="px-4 py-2 border border-brand-fuchsia text-brand-fuchsia hover:bg-brand-rosewater rounded-full transition-all">
                    {{ lang.currentLang() === 'vi' ? 'Thay đổi' : 'Edit' }}
                  </button>
                  <button (click)="cancelSub(item.subscription.id)" class="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-full transition-all">
                    {{ lang.currentLang() === 'vi' ? 'Hủy đăng kỳ' : 'Cancel' }}
                  </button>
                } @else {
                  <span class="text-brand-muted text-[10px] py-2">{{ lang.currentLang() === 'vi' ? 'Đã hủy hoàn toàn' : 'Permanently cancelled' }}</span>
                }
              </div>

            </div>
          }
        </div>
      }

      <!-- CREATE SUBSCRIPTION MODAL -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div class="bg-white rounded-skincare p-6 max-w-md w-full border shadow-2xl space-y-4">
            <h3 class="text-lg font-serif font-bold text-brand-charcoal border-b pb-2">
              {{ lang.currentLang() === 'vi' ? 'Tạo gói đăng ký giao định kỳ' : 'Create Skincare Subscription' }}
            </h3>

            <form (ngSubmit)="onCreateSub()" class="space-y-4 text-xs font-semibold">
              
              <!-- Product Select -->
              <div class="space-y-1">
                <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ lang.currentLang() === 'vi' ? 'Chọn mỹ phẩm' : 'Select Product' }}</label>
                <select [(ngModel)]="newProductId" name="prod" required class="w-full px-3 py-2 rounded-xl border border-brand-fuchsia-light bg-white font-medium focus:outline-none">
                  <option [value]="0">{{ lang.currentLang() === 'vi' ? '-- Chọn một sản phẩm --' : '-- Choose a product --' }}</option>
                  @for (p of availableProducts(); track p.id) {
                    <option [value]="p.id">{{ p.brandName }} - {{ p.name }} ({{ p.price | currency:'VND':'symbol':'1.0-0' }})</option>
                  }
                </select>
              </div>

              <!-- Frequency Select -->
              <div class="space-y-1">
                <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ lang.currentLang() === 'vi' ? 'Tần suất giao hàng định kỳ' : 'Delivery Frequency' }}</label>
                <select [(ngModel)]="newFrequency" name="freq" required class="w-full px-3 py-2 rounded-xl border border-brand-fuchsia-light bg-white font-medium focus:outline-none">
                  <option [value]="30">{{ lang.currentLang() === 'vi' ? '30 ngày (Khuyên dùng)' : '30 days (Recommended)' }}</option>
                  <option [value]="45">{{ lang.currentLang() === 'vi' ? '45 ngày' : '45 days' }}</option>
                  <option [value]="60">{{ lang.currentLang() === 'vi' ? '60 ngày' : '60 days' }}</option>
                  <option [value]="90">{{ lang.currentLang() === 'vi' ? '90 ngày' : '90 days' }}</option>
                </select>
              </div>

              <!-- Address Select -->
              <div class="space-y-1">
                <div class="flex justify-between items-center">
                  <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ lang.currentLang() === 'vi' ? 'Địa chỉ nhận hàng' : 'Shipping Address' }}</label>
                  <a routerLink="/profile" class="text-[9px] text-brand-fuchsia hover:underline">{{ lang.currentLang() === 'vi' ? 'Quản lý địa chỉ' : 'Manage Addresses' }}</a>
                </div>
                <select [(ngModel)]="newAddressId" name="addr" required class="w-full px-3 py-2 rounded-xl border border-brand-fuchsia-light bg-white font-medium focus:outline-none">
                  <option value="">{{ lang.currentLang() === 'vi' ? '-- Chọn địa chỉ giao hàng --' : '-- Choose shipping address --' }}</option>
                  @for (addr of userAddresses(); track addr.id) {
                    <option [value]="addr.id">{{ addr.recipientName }} ({{ addr.phone }}) - {{ addr.street }}, {{ addr.ward }}</option>
                  }
                </select>
                @if (userAddresses().length === 0) {
                  <p class="text-red-500 text-[9px] mt-1">⚠️ {{ lang.currentLang() === 'vi' ? 'Bạn cần thêm địa chỉ giao hàng trong trang cá nhân trước.' : 'Please add a shipping address in your profile first.' }}</p>
                }
              </div>

              <div class="flex space-x-2 pt-2">
                <button type="submit" [disabled]="isSaving() || userAddresses().length === 0 || newProductId === 0" class="flex-1 py-3 bg-brand-fuchsia text-white rounded-full font-bold text-[11px] hover:bg-brand-fuchsia-dark transition-all disabled:opacity-50">
                  {{ isSaving() ? '...' : (lang.currentLang() === 'vi' ? 'Đăng Ký Ngay' : 'Subscribe Now') }}
                </button>
                <button type="button" (click)="showCreateModal.set(false)" class="px-5 py-3 border border-stone-200 text-brand-charcoal rounded-full font-bold text-[11px] hover:bg-stone-50 transition-all">
                  {{ lang.currentLang() === 'vi' ? 'Hủy' : 'Cancel' }}
                </button>
              </div>

            </form>
          </div>
        </div>
      }

      <!-- EDIT SUBSCRIPTION MODAL -->
      @if (showEditModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div class="bg-white rounded-skincare p-6 max-w-md w-full border shadow-2xl space-y-4">
            <h3 class="text-lg font-serif font-bold text-brand-charcoal border-b pb-2">
              {{ lang.currentLang() === 'vi' ? 'Cập nhật đăng ký định kỳ' : 'Update Subscription Settings' }}
            </h3>

            <div class="flex items-center space-x-3 p-3 bg-stone-50 rounded-xl">
              <img [src]="editingSub()?.product?.images?.[0]?.imageUrl || 'assets/placeholder.jpg'" class="w-12 h-12 object-cover rounded-lg border bg-brand-champagne" />
              <div>
                <p class="font-bold text-xs text-brand-charcoal">{{ editingSub()?.product?.name }}</p>
                <p class="text-[10px] text-brand-muted">{{ editingSub()?.product?.brand?.name }}</p>
              </div>
            </div>

            <form (ngSubmit)="onUpdateSub()" class="space-y-4 text-xs font-semibold">
              
              <!-- Frequency Select -->
              <div class="space-y-1">
                <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ lang.currentLang() === 'vi' ? 'Tần suất giao hàng định kỳ' : 'Delivery Frequency' }}</label>
                <select [(ngModel)]="editFrequency" name="freqEdit" required class="w-full px-3 py-2 rounded-xl border border-brand-fuchsia-light bg-white font-medium focus:outline-none">
                  <option [value]="30">30 ngày</option>
                  <option [value]="45">45 ngày</option>
                  <option [value]="60">60 ngày</option>
                  <option [value]="90">90 ngày</option>
                </select>
              </div>

              <!-- Address Select -->
              <div class="space-y-1">
                <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ lang.currentLang() === 'vi' ? 'Địa chỉ nhận hàng' : 'Shipping Address' }}</label>
                <select [(ngModel)]="editAddressId" name="addrEdit" required class="w-full px-3 py-2 rounded-xl border border-brand-fuchsia-light bg-white font-medium focus:outline-none">
                  @for (addr of userAddresses(); track addr.id) {
                    <option [value]="addr.id">{{ addr.recipientName }} ({{ addr.phone }}) - {{ addr.street }}, {{ addr.ward }}</option>
                  }
                </select>
              </div>

              <div class="flex space-x-2 pt-2">
                <button type="submit" [disabled]="isSaving()" class="flex-1 py-3 bg-brand-fuchsia text-white rounded-full font-bold text-[11px] hover:bg-brand-fuchsia-dark transition-all disabled:opacity-50">
                  {{ isSaving() ? '...' : (lang.currentLang() === 'vi' ? 'Cập Nhật' : 'Update') }}
                </button>
                <button type="button" (click)="showEditModal.set(false)" class="px-5 py-3 border border-stone-200 text-brand-charcoal rounded-full font-bold text-[11px] hover:bg-stone-50 transition-all">
                  {{ lang.currentLang() === 'vi' ? 'Hủy' : 'Cancel' }}
                </button>
              </div>

            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class SubscriptionsComponent implements OnInit {
  private readonly subService = inject(SubscriptionService);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);

  readonly hydratedSubscriptions = signal<HydratedSubscription[]>([]);
  readonly availableProducts = signal<ProductSummaryDTO[]>([]);
  readonly userAddresses = signal<AddressDTO[]>([]);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);

  // Modal Triggers
  readonly showCreateModal = signal(false);
  readonly showEditModal = signal(false);
  readonly editingSub = signal<HydratedSubscription | null>(null);

  // Form Fields
  newProductId = 0;
  newFrequency = 30;
  newAddressId = '';

  editFrequency = 30;
  editAddressId = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    // Fetch subscriptions
    this.subService.listSubscriptions(0, 100).subscribe({
      next: (subRes) => {
        const subs = subRes.data ?? [];
        if (subs.length === 0) {
          this.hydratedSubscriptions.set([]);
          this.isLoading.set(false);
          return;
        }

        // Fetch addresses
        this.authService.getUserAddresses().subscribe({
          next: (addrRes) => {
            const addrs = addrRes.data ?? [];
            this.userAddresses.set(addrs);

            // Hydrate product details via Compare API (batch load by product IDs)
            const prodIds = Array.from(new Set(subs.map(s => s.productId)));
            this.productService.compareProducts(prodIds).subscribe({
              next: (prodRes) => {
                const products = prodRes.data ?? [];
                const productMap = new Map(products.map(p => [p.id, p]));
                const addressMap = new Map(addrs.map(a => [a.id, a]));

                const hydrated = subs.map(sub => ({
                  subscription: sub,
                  product: productMap.get(sub.productId),
                  address: addressMap.get(sub.addressId)
                }));

                this.hydratedSubscriptions.set(hydrated);
                this.isLoading.set(false);
              },
              error: () => {
                // Fallback if hydration fails
                const addressMap = new Map(addrs.map(a => [a.id, a]));
                const hydrated = subs.map(sub => ({
                  subscription: sub,
                  address: addressMap.get(sub.addressId)
                }));
                this.hydratedSubscriptions.set(hydrated);
                this.isLoading.set(false);
              }
            });
          },
          error: () => {
            this.hydratedSubscriptions.set(subs.map(sub => ({ subscription: sub })));
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.hydratedSubscriptions.set([]);
        this.isLoading.set(false);
      }
    });

    // Pre-fetch addresses & products for the create dialog
    this.authService.getUserAddresses().subscribe(res => this.userAddresses.set(res.data ?? []));
    this.productService.searchProducts({}, 0, 100).subscribe(res => {
      this.availableProducts.set(res.data?.content ?? []);
    });
  }

  openCreateModal() {
    this.newProductId = this.availableProducts().length > 0 ? this.availableProducts()[0].id : 0;
    this.newFrequency = 30;
    const defAddr = this.userAddresses().find(a => a.isDefault) || this.userAddresses()[0];
    this.newAddressId = defAddr ? defAddr.id : '';
    this.showCreateModal.set(true);
  }

  onCreateSub() {
    if (this.newProductId === 0 || !this.newAddressId) {
      alert(this.lang.currentLang() === 'vi' ? 'Vui lòng chọn sản phẩm và địa chỉ!' : 'Please select product and address!');
      return;
    }

    this.isSaving.set(true);
    this.subService.createSubscription({
      productId: Number(this.newProductId),
      frequencyDays: Number(this.newFrequency),
      addressId: this.newAddressId
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showCreateModal.set(false);
        alert(this.lang.currentLang() === 'vi' ? 'Đăng ký thành công!' : 'Subscribed successfully!');
        this.loadData();
      },
      error: (err) => {
        this.isSaving.set(false);
        alert(err.message || 'Đăng ký thất bại.');
      }
    });
  }

  openEditModal(item: HydratedSubscription) {
    this.editingSub.set(item);
    this.editFrequency = item.subscription.frequencyDays;
    this.editAddressId = item.subscription.addressId;
    this.showEditModal.set(true);
  }

  onUpdateSub() {
    const sub = this.editingSub()?.subscription;
    if (!sub) return;

    this.isSaving.set(true);
    this.subService.updateSubscription(sub.id, {
      frequencyDays: Number(this.editFrequency),
      addressId: this.editAddressId
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showEditModal.set(false);
        alert(this.lang.currentLang() === 'vi' ? 'Cập nhật đăng ký thành công!' : 'Updated successfully!');
        this.loadData();
      },
      error: (err) => {
        this.isSaving.set(false);
        alert(err.message || 'Cập nhật thất bại.');
      }
    });
  }

  pauseSub(id: string) {
    if (!confirm(this.lang.currentLang() === 'vi' ? 'Bạn muốn tạm ngưng gói giao định kỳ này?' : 'Do you want to pause this subscription?')) return;
    
    this.subService.pauseSubscription(id).subscribe({
      next: () => {
        alert(this.lang.currentLang() === 'vi' ? 'Đã tạm ngưng giao định kỳ.' : 'Subscription paused.');
        this.loadData();
      },
      error: (err) => alert(err.message || 'Không thể tạm ngưng.')
    });
  }

  resumeSub(id: string) {
    this.subService.resumeSubscription(id).subscribe({
      next: () => {
        alert(this.lang.currentLang() === 'vi' ? 'Đã kích hoạt lại giao định kỳ.' : 'Subscription resumed.');
        this.loadData();
      },
      error: (err) => alert(err.message || 'Không thể kích hoạt lại.')
    });
  }

  cancelSub(id: string) {
    if (!confirm(this.lang.currentLang() === 'vi' ? 'Bạn có chắc chắn muốn hủy bỏ hoàn toàn gói giao định kỳ này?' : 'Are you sure you want to cancel this subscription?')) return;

    this.subService.cancelSubscription(id).subscribe({
      next: () => {
        alert(this.lang.currentLang() === 'vi' ? 'Đã hủy đăng ký định kỳ thành công.' : 'Subscription cancelled.');
        this.loadData();
      },
      error: (err) => alert(err.message || 'Không thể hủy.')
    });
  }
}
