import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductSummaryDTO, CategoryDTO, BrandDTO, ProductFilterRequest } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      <!-- Page Header -->
      <div class="border-b pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-serif text-brand-charcoal">Danh Mục Mỹ Phẩm</h1>
          <p class="text-xs text-brand-muted">Khám phá các sản phẩm khoa học lành tính CalmSKIN được nghiên cứu chuyên biệt.</p>
        </div>
        
        <!-- Quick search & Sorting -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative">
            <input 
              type="text" 
              [(ngModel)]="tempQuery" 
              (keyup.enter)="applySearch()"
              placeholder="Tìm theo tên..." 
              class="w-48 sm:w-60 px-4 py-2 text-xs rounded-full border border-brand-fuchsia-light bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia"
            />
            <button (click)="applySearch()" class="absolute right-3 top-2.5 text-brand-muted hover:text-brand-fuchsia">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
          </div>
          
          <select 
            [(ngModel)]="activeSort" 
            (change)="applySort()"
            class="px-4 py-2 text-xs rounded-full border border-brand-fuchsia-light bg-white focus:outline-none focus:ring-1 focus:ring-brand-fuchsia"
          >
            <option value="soldCount,desc">Bán Chạy Nhất</option>
            <option value="createdAt,desc">Mới Nhất</option>
            <option value="price,asc">Giá: Thấp đến Cao</option>
            <option value="price,desc">Giá: Cao đến Thấp</option>
            <option value="name,asc">Tên: A-Z</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        
        <!-- Side Filters panel -->
        <aside class="w-full lg:w-64 space-y-6 shrink-0">
          <div class="glass-card p-5 rounded-skincare space-y-6">
            <div class="flex justify-between items-center border-b pb-2">
              <h3 class="font-bold text-sm text-brand-charcoal">Bộ Lọc Tìm Kiếm</h3>
              <button (click)="resetFilters()" class="text-[10px] text-brand-fuchsia hover:underline">Xóa tất cả</button>
            </div>

            <!-- Categories Filter -->
            <div class="space-y-2">
              <h4 class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Loại Sản Phẩm</h4>
              <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                @for (cat of categories(); track cat.id) {
                  <label class="flex items-center space-x-2 text-xs text-brand-muted hover:text-brand-charcoal cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      [value]="cat.id" 
                      [checked]="activeCategoryId() === cat.id"
                      (change)="selectCategory(cat.id)"
                      class="text-brand-fuchsia focus:ring-brand-fuchsia"
                    />
                    <span>{{ cat.name }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Brand Filter -->
            <div class="space-y-2">
              <h4 class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Thương Hiệu</h4>
              <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                @for (brand of brands(); track brand.id) {
                  <label class="flex items-center space-x-2 text-xs text-brand-muted hover:text-brand-charcoal cursor-pointer">
                    <input 
                      type="radio" 
                      name="brand" 
                      [value]="brand.id" 
                      [checked]="activeBrandId() === brand.id"
                      (change)="selectBrand(brand.id)"
                      class="text-brand-fuchsia focus:ring-brand-fuchsia"
                    />
                    <span>{{ brand.name }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Skin Type Filter -->
            <div class="space-y-2">
              <h4 class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Loại Da Phù Hợp</h4>
              <div class="grid grid-cols-2 gap-2">
                @for (type of skinTypes; track type.value) {
                  <button 
                    (click)="toggleSkinType(type.value)"
                    [class.bg-brand-fuchsia]="activeSkinType() === type.value"
                    [class.text-white]="activeSkinType() === type.value"
                    [class.border-brand-fuchsia]="activeSkinType() === type.value"
                    class="py-1.5 text-center text-[10px] font-semibold border rounded-lg hover:bg-brand-rosewater transition-all"
                  >
                    {{ type.name }}
                  </button>
                }
              </div>
            </div>

            <!-- Skin Concern Filter -->
            <div class="space-y-2">
              <h4 class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Vấn Đề Về Da</h4>
              <div class="space-y-1.5">
                @for (concern of skinConcerns; track concern) {
                  <label class="flex items-center space-x-2 text-xs text-brand-muted hover:text-brand-charcoal cursor-pointer">
                    <input 
                      type="radio" 
                      name="concern" 
                      [value]="concern" 
                      [checked]="activeSkinConcern() === concern"
                      (change)="selectSkinConcern(concern)"
                      class="text-brand-fuchsia focus:ring-brand-fuchsia"
                    />
                    <span>{{ concern }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Price Filter -->
            <div class="space-y-3">
              <h4 class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Khoảng Giá (VND)</h4>
              <div class="flex items-center space-x-2 text-xs">
                <input 
                  type="number" 
                  [(ngModel)]="minPrice" 
                  placeholder="Min"
                  class="w-full px-2 py-1.5 border rounded-lg bg-stone-50 focus:outline-none"
                />
                <span class="text-brand-muted">-</span>
                <input 
                  type="number" 
                  [(ngModel)]="maxPrice" 
                  placeholder="Max"
                  class="w-full px-2 py-1.5 border rounded-lg bg-stone-50 focus:outline-none"
                />
              </div>
              <button 
                (click)="applyPriceRange()"
                class="w-full py-2 bg-brand-rosewater text-brand-fuchsia-dark hover:bg-brand-fuchsia hover:text-white text-[10px] font-bold rounded-lg transition-all"
              >
                Áp Dụng Lọc Giá
              </button>
            </div>

          </div>
        </aside>

        <!-- Product Grid & Pagination -->
        <div class="flex-grow space-y-8">
          
          @if (isLoading()) {
            <!-- Skeleton Loader -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
              @for (skel of [1,2,3,4,5,6]; track skel) {
                <div class="bg-stone-50 rounded-skincare h-80 animate-pulse border"></div>
              }
            </div>
          } @else if (products().length === 0) {
            <div class="text-center py-20 bg-white rounded-skincare border p-8 space-y-4">
              <svg class="w-12 h-12 text-brand-fuchsia-light mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 class="text-base font-semibold text-brand-charcoal">Không Tìm Thấy Sản Phẩm</h3>
              <p class="text-xs text-brand-muted max-w-sm mx-auto">Vui lòng điều chỉnh hoặc xóa bớt các bộ lọc tìm kiếm của bạn và thử lại.</p>
              <button (click)="resetFilters()" class="px-6 py-2 btn-fuchsia-glow rounded-full text-xs font-semibold">Đặt Lại Bộ Lọc</button>
            </div>
          } @else {
            
            <!-- Dynamic Grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              @for (product of products(); track product.id) {
                <div class="bg-white rounded-skincare border border-brand-fuchsia-light/10 shadow-sm p-3 sm:p-4 hover:shadow-md hover:border-brand-fuchsia/40 transition-all duration-300 flex flex-col justify-between group relative">
                  
                  @if (product.discountPercent && product.discountPercent > 0) {
                    <span class="absolute top-3 left-3 z-10 bg-brand-fuchsia text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                      -{{ product.discountPercent }}%
                    </span>
                  }

                  <a [routerLink]="['/products', product.slug]" class="block overflow-hidden rounded-xl mb-3 aspect-square bg-brand-champagne">
                    <img 
                      [src]="product.primaryImageUrl || 'assets/placeholder.jpg'" 
                      [alt]="product.name" 
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </a>

                  <div class="space-y-1.5 flex-grow flex flex-col justify-between">
                    <div>
                      <p class="text-[9px] text-brand-muted uppercase font-semibold tracking-wider">{{ product.brandName }}</p>
                      <a [routerLink]="['/products', product.slug]" class="block">
                        <h3 class="font-semibold text-brand-charcoal text-xs sm:text-sm line-clamp-2 group-hover:text-brand-fuchsia-dark transition-colors">{{ product.name }}</h3>
                      </a>
                    </div>

                    <div>
                      <div class="flex items-center space-x-1 text-[10px] text-amber-400">
                        <div class="flex">
                          @for (star of [1,2,3,4,5]; track star) {
                            <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                          }
                        </div>
                        <span class="text-brand-muted">({{ product.totalReviews || 10 }})</span>
                      </div>

                      <div class="flex items-center justify-between pt-2 border-t border-stone-50 mt-2">
                        <div class="flex flex-col">
                          <span class="text-xs sm:text-sm font-bold text-brand-fuchsia-dark">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
                          @if (product.originalPrice && product.originalPrice > product.price) {
                            <span class="text-[9px] text-brand-muted line-through">{{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
                          }
                        </div>
                        <button 
                          (click)="addToCart(product)" 
                          class="p-2 bg-brand-rosewater text-brand-fuchsia hover:bg-brand-fuchsia hover:text-white rounded-full transition-all duration-300 focus:outline-none"
                          title="Thêm vào giỏ"
                        >
                          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Paginate controls -->
            @if (totalPages() > 1) {
              <div class="flex justify-center items-center space-x-2 pt-6">
                <button 
                  [disabled]="currentPage() === 0"
                  (click)="changePage(currentPage() - 1)"
                  class="p-2 border rounded-full hover:bg-brand-rosewater transition-all disabled:opacity-30"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                
                <span class="text-xs text-brand-charcoal font-semibold">Trang {{ currentPage() + 1 }} / {{ totalPages() }}</span>
                
                <button 
                  [disabled]="currentPage() >= totalPages() - 1"
                  (click)="changePage(currentPage() + 1)"
                  class="p-2 border rounded-full hover:bg-brand-rosewater transition-all disabled:opacity-30"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            }

          }

        </div>
      </div>
    </div>
  `
})
export class ListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // States
  readonly products = signal<ProductSummaryDTO[]>([]);
  readonly categories = signal<CategoryDTO[]>([]);
  readonly brands = signal<BrandDTO[]>([]);
  readonly isLoading = signal(false);

  // Filters State
  readonly activeCategoryId = signal<number | null>(null);
  readonly activeBrandId = signal<number | null>(null);
  readonly activeSkinConcern = signal<string | null>(null);
  readonly activeSkinType = signal<string | null>(null);
  
  tempQuery = '';
  minPrice?: number;
  maxPrice?: number;
  activeSort = 'soldCount,desc';

  // Pagination
  readonly currentPage = signal(0);
  readonly totalPages = signal(1);

  // Static options
  readonly skinConcerns = ['Mụn', 'Sạm Nám', 'Lão Hóa', 'Phục Hồi', 'Sẹo Thâm'];
  readonly skinTypes = [
    { name: 'Da Dầu', value: 'Oily' },
    { name: 'Da Khô', value: 'Dry' },
    { name: 'Da Nhạy Cảm', value: 'Sensitive' },
    { name: 'Da Hỗn Hợp', value: 'Combination' }
  ];

  // Full mock catalog data
  private readonly mockCatalog: ProductSummaryDTO[] = [
    {
      id: 1,
      name: 'Tinh chất Trị Mụn BHA 2% Salicylic Acid Acne Clearing Serum',
      slug: 'tinh-chat-tri-mun-bha-2-percent',
      shortDescription: 'Tinh chất gom cồi mụn, sạch bã nhờn bít tắc và ngăn ngừa mụn tái phát.',
      categoryName: 'Serum',
      brandName: 'CalmSKIN Lab',
      price: 299000,
      originalPrice: 350000,
      discountPercent: 15,
      primaryImageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
      isNewArrival: false,
      isFeatured: true,
      status: 'ACTIVE',
      tags: ['BHA', 'Trị Mụn', 'Kiềm Dầu'],
      averageRating: 4.8,
      totalReviews: 84,
      soldCount: 1205
    },
    {
      id: 2,
      name: 'Kem dưỡng Phục Hồi Làm Dịu Da Tổn Thương Panthenol B5 Cream',
      slug: 'kem-duong-phuc-hoi-b5-cream',
      shortDescription: 'Kem phục hồi cấp ẩm và củng cố hàng rào bảo vệ cho làn da đang điều trị hoặc mẩn ngứa.',
      categoryName: 'Kem dưỡng',
      brandName: 'CalmSKIN Lab',
      price: 320000,
      originalPrice: 320000,
      discountPercent: 0,
      primaryImageUrl: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=400',
      isNewArrival: false,
      isFeatured: true,
      status: 'ACTIVE',
      tags: ['B5', 'Làm Dịu', 'Phục Hồi'],
      averageRating: 4.9,
      totalReviews: 120,
      soldCount: 2310
    },
    {
      id: 3,
      name: 'Tinh chất Niacinamide 15% Dưỡng Sáng Mờ Thâm Sạm Brightening Booster',
      slug: 'tinh-chat-niacinamide-15-percent-brightening',
      shortDescription: 'Tập trung se khít chân lông, mờ đốm thâm mụn sạm sẫm màu cực kỳ hiệu quả.',
      categoryName: 'Serum',
      brandName: 'Luxe Derm',
      price: 450000,
      originalPrice: 500000,
      discountPercent: 10,
      primaryImageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=400',
      isNewArrival: false,
      isFeatured: true,
      status: 'ACTIVE',
      tags: ['Niacinamide', 'Dưỡng Sáng', 'Mờ Thâm'],
      averageRating: 4.7,
      totalReviews: 45,
      soldCount: 540
    },
    {
      id: 4,
      name: 'Sữa Rửa Mặt Tạo Bọt Dịu Nhẹ Trà Xanh Hydrating Green Tea Cleanser',
      slug: 'sua-rua-mat-tao-bot-tra-xanh',
      shortDescription: 'Rửa sạch cặn bẩn bã nhờn, nuôi dưỡng cấp ẩm, không làm khô rát da mặt.',
      categoryName: 'Sữa rửa mặt',
      brandName: 'CalmSKIN Lab',
      price: 185000,
      originalPrice: 220000,
      discountPercent: 16,
      primaryImageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400',
      isNewArrival: false,
      isFeatured: true,
      status: 'ACTIVE',
      tags: ['Trà Xanh', 'Làm Sạch', 'Dịu Nhẹ'],
      averageRating: 4.8,
      totalReviews: 215,
      soldCount: 3980
    },
    {
      id: 5,
      name: 'Kem Chống Nắng Phổ Rộng Hàng Ngày Daily UV Shield Sunscreen SPF50+',
      slug: 'kem-chong-nang-pho-rong-shield-spf50',
      shortDescription: 'Chống nắng quang phổ rộng vượt trội, ngăn ngừa lão hóa UV tối ưu.',
      categoryName: 'Kem chống nắng',
      brandName: 'CalmSKIN Lab',
      price: 360000,
      originalPrice: 360000,
      discountPercent: 0,
      primaryImageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400',
      isNewArrival: true,
      isFeatured: false,
      status: 'ACTIVE',
      tags: ['Chống Nắng', 'Quang Phổ Rộng'],
      averageRating: 5.0,
      totalReviews: 3,
      soldCount: 42
    },
    {
      id: 6,
      name: 'Tinh chất Tái Tạo Trẻ Hóa Da Đêm Retinol Liposome 0.5%',
      slug: 'retinol-liposome-0-5-percent',
      shortDescription: 'Làm phẳng rãnh nhăn, tăng độ căng bóng tươi trẻ cho bề mặt tế bào da.',
      categoryName: 'Serum',
      brandName: 'Luxe Derm',
      price: 520000,
      originalPrice: 600000,
      discountPercent: 13,
      primaryImageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=400',
      isNewArrival: true,
      isFeatured: false,
      status: 'ACTIVE',
      tags: ['Retinol', 'Trẻ Hóa', 'Chống Lão Hóa'],
      averageRating: 4.8,
      totalReviews: 6,
      soldCount: 88
    }
  ];

  constructor() {
    // Listen to query parameters reactively to reload products
    effect(() => {
      this.route.queryParams.subscribe(params => {
        this.tempQuery = params['query'] || '';
        this.activeCategoryId.set(params['categoryId'] ? +params['categoryId'] : null);
        this.activeBrandId.set(params['brandId'] ? +params['brandId'] : null);
        this.activeSkinConcern.set(params['skinConcern'] || null);
        this.activeSkinType.set(params['skinType'] || null);
        this.minPrice = params['minPrice'] ? +params['minPrice'] : undefined;
        this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : undefined;
        this.activeSort = params['sortBy'] || 'soldCount,desc';
        this.currentPage.set(params['page'] ? +params['page'] : 0);
        
        this.fetchProducts();
      });
    });
  }

  ngOnInit(): void {
    // Fetch filter catalogs (Categories & Brands)
    this.productService.getCategories().subscribe(res => {
      if (res.success && res.data) this.categories.set(res.data);
      else this.categories.set([
        { id: 1, name: 'Serum', slug: 'serum' },
        { id: 2, name: 'Kem dưỡng', slug: 'kem-duong' },
        { id: 3, name: 'Sữa rửa mặt', slug: 'sua-rua-mat' },
        { id: 4, name: 'Kem chống nắng', slug: 'kem-chong-nang' }
      ]);
    });

    this.productService.getBrands().subscribe(res => {
      if (res.success && res.data) this.brands.set(res.data);
      else this.brands.set([
        { id: 1, name: 'CalmSKIN Lab', slug: 'calmskin-lab' },
        { id: 2, name: 'Luxe Derm', slug: 'luxe-derm' }
      ]);
    });
  }

  fetchProducts() {
    this.isLoading.set(true);
    
    const filter: ProductFilterRequest = {
      query: this.tempQuery || undefined,
      categoryId: this.activeCategoryId() || undefined,
      brandId: this.activeBrandId() || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      skinConcern: this.activeSkinConcern() || undefined,
      skinType: this.activeSkinType() || undefined,
      sortBy: this.activeSort as any
    };

    this.productService.searchProducts(filter, this.currentPage(), 9).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data && res.data.content && res.data.content.length > 0) {
          this.products.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        } else {
          this.filterMockData();
        }
      },
      error: () => {
        this.filterMockData();
      }
    });
  }

  private filterMockData() {
    this.isLoading.set(false);
    let list = [...this.mockCatalog];

    // Filter by name query
    if (this.tempQuery) {
      list = list.filter(p => p.name.toLowerCase().includes(this.tempQuery.toLowerCase()));
    }
    // Filter by Category
    if (this.activeCategoryId()) {
      const catName = this.activeCategoryId() === 1 ? 'Serum' : this.activeCategoryId() === 2 ? 'Kem dưỡng' : this.activeCategoryId() === 3 ? 'Sữa rửa mặt' : 'Kem chống nắng';
      list = list.filter(p => p.categoryName === catName);
    }
    // Filter by Brand
    if (this.activeBrandId()) {
      const bName = this.activeBrandId() === 1 ? 'CalmSKIN Lab' : 'Luxe Derm';
      list = list.filter(p => p.brandName === bName);
    }
    // Filter by Skin Concern
    if (this.activeSkinConcern()) {
      list = list.filter(p => p.tags.includes(this.activeSkinConcern()!));
    }
    // Filter by Skin Type
    if (this.activeSkinType()) {
      // Mock tagging
      if (this.activeSkinType() === 'Oily') {
        list = list.filter(p => p.tags.includes('Kiềm Dầu') || p.tags.includes('BHA'));
      }
    }
    // Filter by Price range
    if (this.minPrice) {
      list = list.filter(p => p.price >= this.minPrice!);
    }
    if (this.maxPrice) {
      list = list.filter(p => p.price <= this.maxPrice!);
    }

    // Sort
    if (this.activeSort === 'price,asc') {
      list.sort((a,b) => a.price - b.price);
    } else if (this.activeSort === 'price,desc') {
      list.sort((a,b) => b.price - a.price);
    } else if (this.activeSort === 'name,asc') {
      list.sort((a,b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a,b) => b.soldCount - a.soldCount);
    }

    this.products.set(list);
    this.totalPages.set(Math.ceil(list.length / 9));
  }

  updateUrl(params: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }

  applySearch() {
    this.updateUrl({ query: this.tempQuery || null, page: 0 });
  }

  applySort() {
    this.updateUrl({ sortBy: this.activeSort, page: 0 });
  }

  selectCategory(id: number) {
    const nextVal = this.activeCategoryId() === id ? null : id;
    this.updateUrl({ categoryId: nextVal, page: 0 });
  }

  selectBrand(id: number) {
    const nextVal = this.activeBrandId() === id ? null : id;
    this.updateUrl({ brandId: nextVal, page: 0 });
  }

  selectSkinConcern(concern: string) {
    const nextVal = this.activeSkinConcern() === concern ? null : concern;
    this.updateUrl({ skinConcern: nextVal, page: 0 });
  }

  toggleSkinType(type: string) {
    const nextVal = this.activeSkinType() === type ? null : type;
    this.updateUrl({ skinType: nextVal, page: 0 });
  }

  applyPriceRange() {
    this.updateUrl({ 
      minPrice: this.minPrice || null, 
      maxPrice: this.maxPrice || null, 
      page: 0 
    });
  }

  changePage(page: number) {
    this.updateUrl({ page });
  }

  resetFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  addToCart(product: ProductSummaryDTO) {
    this.cartService.addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      primaryImageUrl: product.primaryImageUrl,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      quantity: 1
    });
    alert(`Đã thêm vào giỏ hàng: ${product.name}`);
  }
}
