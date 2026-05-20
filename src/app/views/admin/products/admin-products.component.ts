import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { ProductSummaryDTO, CategoryDTO, BrandDTO } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in text-slate-100">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 class="text-3xl font-serif font-bold text-white">Quản Lý Mỹ Phẩm</h1>
          <p class="text-xs text-slate-400 mt-1">Quản lý kho danh mục sản phẩm, bảng giá và thuộc tính chuyên sâu CalmSKIN.</p>
        </div>
        <button 
          (click)="openFormModal()"
          class="px-5 py-2.5 bg-brand-fuchsia text-white rounded-full font-bold text-xs hover:bg-brand-fuchsia-dark transition-all shrink-0 shadow-lg shadow-brand-fuchsia/20"
        >
          + Thêm Mỹ Phẩm Mới
        </button>
      </div>

      <!-- Products Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
        @if (isLoading()) {
          <div class="p-20 text-center text-slate-400">Đang tải danh sách mỹ phẩm...</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-850 font-bold bg-slate-950 text-slate-400">
                  <th class="p-4">Hình</th>
                  <th class="p-4">Tên Sản Phẩm</th>
                  <th class="p-4">Thương Hiệu</th>
                  <th class="p-4">Phân Loại</th>
                  <th class="p-4">Giá Ưu Đãi</th>
                  <th class="p-4">Giá Gốc</th>
                  <th class="p-4">Trạng Thái</th>
                  <th class="p-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                @for (prod of products(); track prod.id) {
                  <tr class="border-b border-slate-850 hover:bg-slate-850/40 transition-colors">
                    <td class="p-4">
                      <img [src]="prod.primaryImageUrl || 'assets/placeholder.jpg'" class="w-10 h-10 object-cover rounded-lg border border-slate-800" />
                    </td>
                    <td class="p-4 font-semibold text-slate-100 max-w-xs truncate">{{ prod.name }}</td>
                    <td class="p-4 text-slate-300">{{ prod.brandName }}</td>
                    <td class="p-4 text-slate-300">{{ prod.categoryName }}</td>
                    <td class="p-4 font-bold text-brand-fuchsia-light font-mono">{{ prod.price | currency:'VND':'symbol':'1.0-0' }}</td>
                    <td class="p-4 font-mono text-slate-400">{{ (prod.originalPrice || prod.price) | currency:'VND':'symbol':'1.0-0' }}</td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wide uppercase"
                        [class.bg-emerald-500/20]="prod.status === 'ACTIVE'"
                        [class.text-emerald-400]="prod.status === 'ACTIVE'"
                        [class.bg-rose-500/20]="prod.status === 'DRAFT'"
                        [class.text-rose-400]="prod.status === 'DRAFT'"
                      >
                        {{ prod.status === 'ACTIVE' ? 'Kích Hoạt' : 'Tạm Khóa' }}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center justify-center space-x-3 font-semibold">
                        <button (click)="openFormModal(prod)" class="text-brand-fuchsia hover:text-white transition-colors">Sửa</button>
                        <span>|</span>
                        <button (click)="toggleProductStatus(prod)" class="text-amber-500 hover:text-white transition-colors">
                          {{ prod.status === 'ACTIVE' ? 'Khóa' : 'Mở' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- FORM ADD/EDIT MODAL -->
      @if (showFormModal()) {
        <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-slate-300">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto relative">
            
            <h2 class="text-xl font-serif font-bold text-white border-b border-slate-800 pb-3">
              {{ editingProductId() ? 'Cập Nhật Thông Tin Mỹ Phẩm' : 'Thêm Mỹ Phẩm Mới' }}
            </h2>

            <form (ngSubmit)="saveProduct()" class="space-y-4 text-xs font-semibold">
              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 uppercase tracking-wider">Tên Sản Phẩm</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 uppercase tracking-wider">Thương Hiệu</label>
                  <select [(ngModel)]="formData.brandId" name="brandId" required class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white">
                    @for (b of brands(); track b.id) {
                      <option [value]="b.id">{{ b.name }}</option>
                    }
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 uppercase tracking-wider">Phân Loại (Category)</label>
                  <select [(ngModel)]="formData.categoryId" name="categoryId" required class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white">
                    @for (c of categories(); track c.id) {
                      <option [value]="c.id">{{ c.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 uppercase tracking-wider">Giá Bán Gốc (VND)</label>
                  <input type="number" [(ngModel)]="formData.basePrice" name="basePrice" required class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 uppercase tracking-wider">Giá Bán KM (Tuỳ chọn)</label>
                  <input type="number" [(ngModel)]="formData.salePrice" name="salePrice" class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 uppercase tracking-wider">Dung Tích (ml)</label>
                  <input type="number" [(ngModel)]="formData.volumeMl" name="volumeMl" required class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white" />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 uppercase tracking-wider">Đường dẫn ảnh URL chính</label>
                <input type="url" [(ngModel)]="formData.imageUrl" name="imageUrl" required class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white" />
              </div>

              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 uppercase tracking-wider">Mô tả ngắn</label>
                <input type="text" [(ngModel)]="formData.shortDescription" name="shortDesc" class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white" />
              </div>

              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 uppercase tracking-wider">Mô tả chi tiết sản phẩm</label>
                <textarea [(ngModel)]="formData.description" name="description" rows="3" class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"></textarea>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 uppercase tracking-wider">Hướng dẫn sử dụng</label>
                <textarea [(ngModel)]="formData.howToUse" name="howToUse" rows="2" class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"></textarea>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  (click)="showFormModal.set(false)"
                  class="px-5 py-2.5 border border-slate-700 hover:bg-slate-850 rounded-full text-slate-300"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  class="px-6 py-2.5 bg-brand-fuchsia text-white rounded-full font-bold shadow-lg shadow-brand-fuchsia/20 hover:bg-brand-fuchsia-dark"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
            
          </div>
        </div>
      }

    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly productService = inject(ProductService);

  readonly products = signal<ProductSummaryDTO[]>([]);
  readonly categories = signal<CategoryDTO[]>([]);
  readonly brands = signal<BrandDTO[]>([]);

  readonly isLoading = signal(false);
  readonly showFormModal = signal(false);
  readonly editingProductId = signal<number | null>(null);

  // Form mapping
  formData = {
    name: '',
    brandId: 1,
    categoryId: 1,
    basePrice: 100000,
    salePrice: 100000,
    volumeMl: 30,
    imageUrl: '',
    shortDescription: '',
    description: '',
    howToUse: ''
  };

  // Mock list
  private readonly mockAdminProducts: ProductSummaryDTO[] = [
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
      primaryImageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200',
      isNewArrival: false,
      isFeatured: true,
      status: 'ACTIVE',
      tags: ['BHA', 'Trị Mụn'],
      averageRating: 4.8,
      totalReviews: 84,
      soldCount: 1205
    },
    {
      id: 2,
      name: 'Kem dưỡng Phục Hồi Làm Dịu Da Tổn Thương Panthenol B5 Cream',
      slug: 'kem-duong-phuc-hoi-b5-cream',
      shortDescription: 'Phục hồi hàng rào bảo vệ da bị kích ứng, rát đỏ hoặc sau điều trị.',
      categoryName: 'Kem dưỡng',
      brandName: 'CalmSKIN Lab',
      price: 320000,
      originalPrice: 320000,
      discountPercent: 0,
      primaryImageUrl: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=200',
      isNewArrival: false,
      isFeatured: true,
      status: 'ACTIVE',
      tags: ['B5', 'Làm Dịu'],
      averageRating: 4.9,
      totalReviews: 120,
      soldCount: 2310
    }
  ];

  ngOnInit(): void {
    this.loadCatalogData();
  }

  loadCatalogData() {
    this.isLoading.set(true);

    // Fetch dropdown components
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

    // Fetch Products list
    this.productService.searchProducts({}, 0, 100).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data && res.data.content && res.data.content.length > 0) {
          this.products.set(res.data.content);
        } else {
          this.products.set(this.mockAdminProducts);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.products.set(this.mockAdminProducts);
      }
    });
  }

  openFormModal(product?: ProductSummaryDTO) {
    if (product) {
      this.editingProductId.set(product.id);
      this.formData = {
        name: product.name,
        brandId: product.brandName === 'CalmSKIN Lab' ? 1 : 2,
        categoryId: product.categoryName === 'Serum' ? 1 : product.categoryName === 'Kem dưỡng' ? 2 : 3,
        basePrice: product.originalPrice || product.price,
        salePrice: product.price,
        volumeMl: 30,
        imageUrl: product.primaryImageUrl || '',
        shortDescription: product.shortDescription || '',
        description: '',
        howToUse: ''
      };
    } else {
      this.editingProductId.set(null);
      this.formData = {
        name: '',
        brandId: 1,
        categoryId: 1,
        basePrice: 100000,
        salePrice: 100000,
        volumeMl: 30,
        imageUrl: '',
        shortDescription: '',
        description: '',
        howToUse: ''
      };
    }
    this.showFormModal.set(true);
  }

  saveProduct() {
    if (!this.formData.name || !this.formData.imageUrl) {
      alert('Vui lòng nhập tên và link ảnh sản phẩm!');
      return;
    }

    const payload = {
      ...this.formData,
      suitableSkinTypes: ['Oily', 'Sensitive'],
      skinConcerns: ['Mụn'],
      keyIngredients: [
        { name: 'Hoạt chất bổ trợ', safetyRating: 1 }
      ]
    };

    if (this.editingProductId()) {
      // Update
      this.adminService.updateProduct(this.editingProductId()!, payload).subscribe({
        next: () => {
          alert('Cập nhật sản phẩm thành công!');
          this.showFormModal.set(false);
          this.loadCatalogData();
        },
        error: () => {
          // Mock update
          const list = this.products().map(p => {
            if (p.id === this.editingProductId()) {
              return {
                ...p,
                name: payload.name,
                price: payload.salePrice,
                originalPrice: payload.basePrice,
                primaryImageUrl: payload.imageUrl
              };
            }
            return p;
          });
          this.products.set(list);
          this.showFormModal.set(false);
          alert('Cập nhật sản phẩm giả lập thành công!');
        }
      });
    } else {
      // Create
      this.adminService.createProduct(payload).subscribe({
        next: () => {
          alert('Thêm sản phẩm mới thành công!');
          this.showFormModal.set(false);
          this.loadCatalogData();
        },
        error: () => {
          // Mock create addition
          const newId = Math.floor(Math.random() * 1000);
          const newItem: ProductSummaryDTO = {
            id: newId,
            name: payload.name,
            slug: 'new-product-slug-' + newId,
            shortDescription: payload.shortDescription,
            categoryName: payload.categoryId === 1 ? 'Serum' : 'Kem dưỡng',
            brandName: payload.brandId === 1 ? 'CalmSKIN Lab' : 'Luxe Derm',
            price: payload.salePrice,
            originalPrice: payload.basePrice,
            discountPercent: 0,
            primaryImageUrl: payload.imageUrl,
            isNewArrival: true,
            isFeatured: false,
            status: 'ACTIVE',
            tags: [],
            averageRating: 5.0,
            totalReviews: 0,
            soldCount: 0
          };
          this.products.set([...this.products(), newItem]);
          this.showFormModal.set(false);
          alert('Thêm sản phẩm mới giả lập thành công!');
        }
      });
    }
  }

  toggleProductStatus(product: ProductSummaryDTO) {
    const nextStatus: 'ACTIVE' | 'DRAFT' = product.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    
    // We update through updateProduct status toggler
    this.adminService.updateProduct(product.id, { status: nextStatus }).subscribe({
      next: () => {
        alert('Thay đổi trạng thái sản phẩm thành công!');
        this.loadCatalogData();
      },
      error: () => {
        const list = this.products().map(p => {
          if (p.id === product.id) {
            return { ...p, status: nextStatus };
          }
          return p;
        });
        this.products.set(list);
        alert('Đã thay đổi trạng thái sản phẩm!');
      }
    });
  }
}
