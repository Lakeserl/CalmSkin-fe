import { Component, inject, signal, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { ProductDTO, ProductSummaryDTO, ProductVariantDTO } from '../../../core/models/product.model';
import { AddressDTO } from '../../../core/models/auth.model';
import { ProductReviewsComponent } from '../../../features/reviews/component/product-reviews.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductReviewsComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      @if (isLoading()) {
        <div class="animate-pulse space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 h-96 bg-stone-50 border rounded-skincare"></div>
        </div>
      } @else if (!product()) {
        <div class="text-center py-20 bg-white border rounded-skincare">
          <p class="text-brand-muted text-sm">Không tìm thấy thông tin chi tiết sản phẩm này.</p>
          <a routerLink="/products" class="text-xs text-brand-fuchsia mt-3 inline-block hover:underline">Quay lại danh sách</a>
        </div>
      } @else {
        
        <!-- Breadcrumb -->
        <nav class="flex space-x-2 text-xs text-brand-muted mb-6">
          <a routerLink="/" class="hover:text-brand-fuchsia">Trang chủ</a>
          <span>/</span>
          <a routerLink="/products" class="hover:text-brand-fuchsia">Sản phẩm</a>
          <span>/</span>
          <span class="text-brand-charcoal font-medium truncate max-w-xs">{{ product()?.name }}</span>
        </nav>

        <!-- Main Product Details Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start bg-white p-6 sm:p-8 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm mb-12">
          
          <!-- Column 1: Image Gallery -->
          <div class="space-y-4">
            <!-- Active Image Box -->
            <div class="overflow-hidden rounded-skincare border bg-brand-champagne aspect-square">
              <img [src]="activeImage()" class="w-full h-full object-cover" />
            </div>
            
            <!-- Thumbnail Carousel -->
            @if (product()!.images && product()!.images.length > 1) {
              <div class="flex space-x-2 overflow-x-auto py-1">
                @for (img of product()!.images; track img.id) {
                  <button 
                    (click)="activeImage.set(img.imageUrl)"
                    [class.border-brand-fuchsia]="activeImage() === img.imageUrl"
                    class="w-16 h-16 sm:w-20 sm:h-20 shrink-0 border rounded-lg overflow-hidden bg-brand-champagne relative transition-all"
                  >
                    <img [src]="img.imageUrl" class="w-full h-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Column 2: Specs & Details -->
          <div class="space-y-6">
            <div class="space-y-2">
              <span class="text-xs font-bold text-brand-fuchsia uppercase tracking-wider">{{ product()?.brand?.name }}</span>
              <h1 class="text-2xl sm:text-3xl font-serif text-brand-charcoal leading-tight">{{ product()?.name }}</h1>
              
              <!-- Review stars and sold counts -->
              <div class="flex items-center space-x-3 text-xs text-brand-muted">
                <div class="flex items-center text-amber-400">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <span class="text-brand-charcoal font-semibold ml-1">{{ (product()?.reviewSummary?.averageRating | number: '1.1-1') || '—' }}</span>
                  <span class="text-brand-muted ml-1">({{ product()?.reviewSummary?.totalReviews ?? 0 }})</span>
                </div>
                <span>|</span>
                <span>Đã bán: <strong class="text-brand-charcoal">{{ product()?.soldCount ?? 0 }}</strong> sản phẩm</span>
              </div>
            </div>

            <!-- Price Display -->
            <div class="p-4 bg-brand-rosewater/50 rounded-xl flex items-center justify-between">
              <div>
                <span class="text-2xl font-bold text-brand-fuchsia-dark">{{ activePrice() | currency:'VND':'symbol':'1.0-0' }}</span>
                @if (product()?.salePrice && product()?.basePrice && product()!.basePrice > product()!.salePrice!) {
                  <span class="text-xs text-brand-muted line-through ml-2">{{ product()?.basePrice | currency:'VND':'symbol':'1.0-0' }}</span>
                }
              </div>
              @if (product()?.discountPercent && product()!.discountPercent! > 0) {
                <span class="bg-brand-fuchsia text-white text-[10px] font-extrabold px-2 py-1 rounded">TIẾT KIỆM {{ product()?.discountPercent }}%</span>
              }
            </div>

            <!-- Variant Selector -->
            @if (product()!.variants && product()!.variants.length > 0) {
              <div class="space-y-2">
                <h3 class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Lựa Chọn Dung Tích</h3>
                <div class="flex flex-wrap gap-2">
                  @for (variant of product()!.variants; track variant.id) {
                    <button 
                      (click)="selectVariant(variant)"
                      [class.border-brand-fuchsia]="activeVariant()?.id === variant.id"
                      [class.bg-brand-rosewater]="activeVariant()?.id === variant.id"
                      [class.text-brand-fuchsia-dark]="activeVariant()?.id === variant.id"
                      class="px-4 py-2 border rounded-xl text-xs font-semibold hover:border-brand-fuchsia transition-all"
                    >
                      {{ variant.name }} - {{ variant.price | currency:'VND':'symbol':'1.0-0' }}
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Tags (Skin concerns and types) -->
            <div class="space-y-2">
              <h3 class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Khuyên Dùng Cho</h3>
              <div class="flex flex-wrap gap-1.5">
                @for (concern of product()!.skinConcerns; track concern) {
                  <span class="bg-brand-fuchsia/10 text-brand-fuchsia-dark text-[10px] font-semibold px-2.5 py-1 rounded-full">{{ concern }}</span>
                }
                @for (type of product()!.suitableSkinTypes; track type) {
                  <span class="bg-stone-100 text-brand-charcoal text-[10px] font-semibold px-2.5 py-1 rounded-full">Da {{ type === 'Oily' ? 'Dầu' : type === 'Dry' ? 'Khô' : type === 'Sensitive' ? 'Nhạy Cảm' : 'Hỗn Hợp' }}</span>
                }
              </div>
            </div>

            <!-- Volume/Weight -->
            <div class="text-xs text-brand-muted flex space-x-6 border-b pb-4">
              <span>Dung tích: <strong class="text-brand-charcoal">{{ product()?.volumeMl || activeVariant()?.volumeMl || '50' }}ml</strong></span>
              <span>Xuất xứ: <strong class="text-brand-charcoal">Việt Nam</strong></span>
              <span>Hạn sử dụng: <strong class="text-brand-charcoal">36 tháng</strong></span>
            </div>

            <!-- Buy Action -->
            <div class="flex items-center space-x-4">
              <!-- Qty picker -->
              <div class="flex items-center border border-brand-fuchsia-light rounded-xl overflow-hidden shrink-0">
                <button (click)="changeQty(-1)" class="px-3 py-2 text-brand-muted hover:bg-brand-rosewater hover:text-brand-fuchsia focus:outline-none">-</button>
                <span class="px-4 py-2 text-xs font-semibold w-12 text-center">{{ quantity() }}</span>
                <button (click)="changeQty(1)" class="px-3 py-2 text-brand-muted hover:bg-brand-rosewater hover:text-brand-fuchsia focus:outline-none">+</button>
              </div>

              <!-- Cart button -->
              <button (click)="addToCart()" class="flex-1 py-3.5 btn-fuchsia-glow rounded-full text-xs font-bold transition-all">
                Thêm Vào Giỏ Hàng
              </button>
            </div>

            <!-- Subscribe & Save Action -->
            <div class="p-4 bg-brand-rosewater/25 border border-brand-fuchsia-light/10 rounded-skincare space-y-3 mt-4">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-xs font-bold text-brand-charcoal">📅 Đăng ký giao định kỳ & Tiết kiệm</p>
                  <p class="text-[10px] text-brand-muted">Giao hàng tự động mỗi 30-90 ngày. Dễ dàng tạm ngưng hay hủy.</p>
                </div>
                <button (click)="openSubModal()" class="px-4 py-2 bg-brand-fuchsia text-white hover:bg-brand-fuchsia-dark rounded-full font-bold text-[10px] transition-all shadow-sm">
                  Đăng Ký Giao
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Product Details tabs & EWG safety rating -->
        <section class="bg-white rounded-skincare border border-brand-fuchsia-light/10 p-6 sm:p-8 space-y-6 mb-12 shadow-sm">
          <div class="flex border-b border-brand-fuchsia-light/20">
            <button 
              (click)="activeTab.set('desc')"
              [class.border-brand-fuchsia]="activeTab() === 'desc'"
              [class.text-brand-fuchsia-dark]="activeTab() === 'desc'"
              class="pb-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-brand-muted transition-all px-4 sm:px-6"
            >
              Mô Tả Sản Phẩm
            </button>
            <button 
              (click)="activeTab.set('usage')"
              [class.border-brand-fuchsia]="activeTab() === 'usage'"
              [class.text-brand-fuchsia-dark]="activeTab() === 'usage'"
              class="pb-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-brand-muted transition-all px-4 sm:px-6"
            >
              Hướng Dẫn Sử Dụng
            </button>
            <button 
              (click)="activeTab.set('ingredients')"
              [class.border-brand-fuchsia]="activeTab() === 'ingredients'"
              [class.text-brand-fuchsia-dark]="activeTab() === 'ingredients'"
              class="pb-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-brand-muted transition-all px-4 sm:px-6"
            >
              Bảng Thành Phần & EWG
            </button>
          </div>

          <!-- Tab Content 1: Description -->
          @if (activeTab() === 'desc') {
            <div class="text-xs sm:text-sm text-brand-muted leading-relaxed space-y-4 animate-fade-in">
              <p>{{ product()?.description }}</p>
            </div>
          }

          <!-- Tab Content 2: Usage -->
          @if (activeTab() === 'usage') {
            <div class="text-xs sm:text-sm text-brand-muted leading-relaxed space-y-3 animate-fade-in">
              <p class="font-semibold text-brand-charcoal">Các bước khuyên dùng từ chuyên gia CalmSKIN:</p>
              <p>{{ product()?.howToUse || 'Thoa nhẹ sản phẩm lên mặt vào buổi sáng và tối sau khi rửa mặt sạch.' }}</p>
            </div>
          }

          <!-- Tab Content 3: Ingredients & EWG rating -->
          @if (activeTab() === 'ingredients') {
            <div class="space-y-4 animate-fade-in">
              <p class="text-xs text-brand-muted leading-relaxed">
                Chúng tôi cam kết sử dụng công thức tối giản nhưng hiệu quả cao. Dưới đây là các thành phần chủ chốt được chấm điểm an toàn bởi EWG (Environmental Working Group) Hoa Kỳ:
              </p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (ing of product()!.keyIngredients; track ing.id) {
                  <div class="p-3 border rounded-xl flex items-center justify-between space-x-3 bg-stone-50">
                    <div class="min-w-0">
                      <h4 class="font-semibold text-brand-charcoal text-xs truncate">{{ ing.name }}</h4>
                      <p class="text-[10px] text-brand-muted mt-0.5 line-clamp-1">{{ ing.description || 'Thành phần hữu cơ lành tính bảo vệ da.' }}</p>
                    </div>
                    
                    @if (ing.safetyRating) {
                      <div class="shrink-0 flex flex-col items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold text-white shadow-sm"
                        [ngClass]="{
                          'bg-emerald-500': ing.safetyRating <= 2,
                          'bg-amber-500': ing.safetyRating > 2 && ing.safetyRating <= 5,
                          'bg-red-500': ing.safetyRating > 5
                        }"
                      >
                        {{ ing.safetyRating }}
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </section>

        <!-- Reviews Section -->
        <div class="mb-12">
          <app-product-reviews
            [productId]="product()!.id"
            [summary]="product()!.reviewSummary ?? null"
          />
        </div>

        <!-- Similar Products Section -->
        @if (similarProducts().length > 0) {
          <section class="space-y-6">
            <h2 class="text-xl sm:text-2xl font-serif text-brand-charcoal border-b pb-3 mb-6">Sản Phẩm Tương Tự</h2>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              @for (similar of similarProducts(); track similar.id) {
                <div class="bg-white rounded-skincare border border-brand-fuchsia-light/10 shadow-sm p-3 sm:p-4 hover:shadow-md hover:border-brand-fuchsia/40 transition-all duration-300 flex flex-col justify-between group">
                  <a [routerLink]="['/products', similar.slug]" class="block overflow-hidden rounded-xl mb-3 aspect-square bg-brand-champagne">
                    <img 
                      [src]="similar.primaryImageUrl || 'assets/placeholder.jpg'" 
                      [alt]="similar.name" 
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </a>
                  <div class="space-y-1.5">
                    <p class="text-[9px] text-brand-muted uppercase font-semibold tracking-wider">{{ similar.brandName }}</p>
                    <a [routerLink]="['/products', similar.slug]">
                      <h3 class="font-semibold text-brand-charcoal text-xs line-clamp-2 hover:text-brand-fuchsia transition-colors">{{ similar.name }}</h3>
                    </a>
                    <div class="flex items-center justify-between pt-2 border-t mt-2">
                      <span class="text-xs sm:text-sm font-bold text-brand-fuchsia-dark">{{ similar.price | currency:'VND':'symbol':'1.0-0' }}</span>
                      <a [routerLink]="['/products', similar.slug]" class="text-[10px] text-brand-fuchsia font-bold hover:underline">Chi tiết</a>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        }

      }

        <!-- SUBSCRIPTION DETAIL MODAL -->
        @if (showSubModal()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in text-brand-charcoal">
            <div class="bg-white rounded-skincare p-6 max-w-md w-full border shadow-2xl space-y-4">
              <h3 class="text-base font-serif font-bold text-brand-charcoal border-b pb-2 uppercase tracking-wide">
                Đăng ký giao hàng định kỳ
              </h3>
              
              <div class="flex items-center space-x-3 p-3 bg-brand-rosewater/20 rounded-xl">
                <img [src]="activeImage()" class="w-12 h-12 object-cover rounded-lg border bg-brand-champagne" />
                <div class="min-w-0">
                  <p class="font-bold text-xs truncate">{{ product()?.name }}</p>
                  <p class="text-[10px] text-brand-fuchsia font-semibold">{{ activePrice() | currency:'VND':'symbol':'1.0-0' }}</p>
                </div>
              </div>

              <div class="space-y-4 text-xs font-semibold">
                <!-- Frequency -->
                <div class="space-y-1">
                  <label class="text-[10px] text-brand-muted uppercase tracking-wider">Tần suất giao hàng</label>
                  <select [(ngModel)]="selectedSubFrequency" class="w-full px-3 py-2 rounded-xl border border-brand-fuchsia-light bg-white font-medium focus:outline-none">
                    <option [value]="30">Mỗi 30 ngày (Khuyên dùng)</option>
                    <option [value]="45">Mỗi 45 ngày</option>
                    <option [value]="60">Mỗi 60 ngày</option>
                    <option [value]="90">Mỗi 90 ngày</option>
                  </select>
                </div>

                <!-- Address -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <label class="text-[10px] text-brand-muted uppercase tracking-wider">Địa chỉ giao hàng</label>
                    <a routerLink="/profile" target="_blank" class="text-[9px] text-brand-fuchsia hover:underline">Thêm địa chỉ mới</a>
                  </div>
                  <select [(ngModel)]="selectedSubAddressId" class="w-full px-3 py-2 rounded-xl border border-brand-fuchsia-light bg-white font-medium focus:outline-none">
                    <option value="">-- Chọn địa chỉ giao hàng --</option>
                    @for (addr of userAddresses(); track addr.id) {
                      <option [value]="addr.id">{{ addr.recipientName }} ({{ addr.phone }}) - {{ addr.street }}, {{ addr.ward }}</option>
                    }
                  </select>
                  @if (userAddresses().length === 0) {
                    <p class="text-red-500 text-[9px] mt-1">⚠️ Bạn cần thêm địa chỉ giao hàng trong trang cá nhân trước.</p>
                  }
                </div>

                <div class="flex space-x-2 pt-2">
                  <button (click)="confirmSubscription()" [disabled]="isSubscribing() || userAddresses().length === 0" 
                    class="flex-1 py-3 bg-brand-fuchsia text-white rounded-full font-bold text-[11px] hover:bg-brand-fuchsia-dark transition-all disabled:opacity-50">
                    {{ isSubscribing() ? 'Đang đăng ký...' : 'Xác Nhận Đăng Ký' }}
                  </button>
                  <button (click)="showSubModal.set(false)" class="px-5 py-3 border border-stone-200 text-brand-charcoal rounded-full font-bold text-[11px] hover:bg-stone-50 transition-all">
                    Hủy
                  </button>
                </div>
              </div>

            </div>
          </div>
        }

      </div>
  `
})
export class DetailComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly subService = inject(SubscriptionService);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly showSubModal = signal(false);
  readonly isSubscribing = signal(false);
  readonly userAddresses = signal<AddressDTO[]>([]);

  selectedSubAddressId = '';
  selectedSubFrequency = 30;

  readonly product = signal<ProductDTO | null>(null);
  readonly similarProducts = signal<ProductSummaryDTO[]>([]);
  readonly isLoading = signal(false);

  readonly activeImage = signal('');
  readonly activePrice = signal(0);
  readonly activeVariant = signal<ProductVariantDTO | null>(null);
  readonly quantity = signal(1);

  readonly activeTab = signal<'desc' | 'usage' | 'ingredients'>('desc');


  constructor() {
    // Re-trigger load if slug query changes
    effect(() => {
      this.route.params.subscribe(params => {
        const slug = params['slug'];
        if (slug) {
          this.loadProduct(slug);
        }
      });
    });
  }

  ngOnInit(): void {}

  loadProduct(slug: string) {
    this.isLoading.set(true);
    this.quantity.set(1);

    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.setProductData(res.data);
        } else {
          this.product.set(null);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.product.set(null);
      },
    });
  }

  private setProductData(data: ProductDTO) {
    this.product.set(data);
    this.activeImage.set(data.images && data.images.length > 0 ? data.images[0].imageUrl : 'assets/placeholder.jpg');

    if (data.variants && data.variants.length > 0) {
      this.selectVariant(data.variants[0]);
    } else {
      this.activeVariant.set(null);
      this.activePrice.set(data.salePrice || data.basePrice);
    }

    this.productService.getSimilarProducts(data.slug).subscribe({
      next: (res) => this.similarProducts.set(res.data ?? []),
      error: () => this.similarProducts.set([]),
    });
  }

  selectVariant(variant: ProductVariantDTO) {
    this.activeVariant.set(variant);
    this.activePrice.set(variant.price);
    if (variant.imageUrl) {
      this.activeImage.set(variant.imageUrl);
    }
  }

  changeQty(amount: number) {
    this.quantity.set(Math.max(1, Math.min(99, this.quantity() + amount)));
  }

  addToCart() {
    const prod = this.product();
    if (!prod) return;

    this.cartService.addToCart({
      productId: prod.id,
      productName: prod.name,
      productSlug: prod.slug,
      primaryImageUrl: this.activeImage(),
      variantId: this.activeVariant()?.id,
      variantName: this.activeVariant()?.name,
      price: this.activePrice(),
      originalPrice: prod.basePrice,
      quantity: this.quantity()
    });

    alert(`Đã thêm ${this.quantity()} sản phẩm vào giỏ hàng thành công!`);
  }

  openSubModal() {
    if (!this.isAuthenticated()) {
      alert('Vui lòng đăng nhập để đăng ký giao hàng định kỳ!');
      return;
    }
    
    this.authService.getUserAddresses().subscribe({
      next: (res) => {
        const addrs = res.data ?? [];
        this.userAddresses.set(addrs);
        const defAddr = addrs.find(a => a.isDefault) || addrs[0];
        this.selectedSubAddressId = defAddr ? defAddr.id : '';
        this.selectedSubFrequency = 30;
        this.showSubModal.set(true);
      },
      error: () => {
        alert('Không tải được danh sách địa chỉ. Vui lòng thử lại sau.');
      }
    });
  }

  confirmSubscription() {
    const prod = this.product();
    if (!prod) return;

    if (!this.selectedSubAddressId) {
      alert('Vui lòng chọn hoặc thêm địa chỉ giao hàng trong trang cá nhân!');
      return;
    }

    this.isSubscribing.set(true);
    this.subService.createSubscription({
      productId: prod.id,
      frequencyDays: Number(this.selectedSubFrequency),
      addressId: this.selectedSubAddressId
    }).subscribe({
      next: () => {
        this.isSubscribing.set(false);
        this.showSubModal.set(false);
        alert(`Đăng ký giao định kỳ sản phẩm ${prod.name} thành công! Bạn có thể quản lý tại Trang cá nhân > Đăng ký định kỳ.`);
      },
      error: (err) => {
        this.isSubscribing.set(false);
        alert(err.message || 'Đăng ký giao định kỳ thất bại.');
      }
    });
  }
}
