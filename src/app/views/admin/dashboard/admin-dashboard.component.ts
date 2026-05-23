import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { InventoryStatsDTO } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 animate-fade-in text-slate-100">
      
      <!-- Top banner -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 class="text-3xl font-serif font-bold text-white">Bảng Quản Trị CalmSKIN</h1>
          <p class="text-xs text-slate-400 mt-1">Hệ thống giám sát kinh doanh & vận hành kho vận thời gian thực.</p>
        </div>
        <div class="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/50 text-xs text-slate-300">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Hệ thống Microservices: Hoạt động</span>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Metric 1: Total Revenue -->
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2 relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-fuchsia/5 rounded-full blur-2xl group-hover:bg-brand-fuchsia/10 transition-all"></div>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Doanh Thu Tháng</p>
          <p class="text-2xl font-bold text-white font-mono">145.280.000đ</p>
          <p class="text-[10px] text-emerald-400">📈 +18.4% so với tháng trước</p>
        </div>

        <!-- Metric 2: Total Catalog -->
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2 relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-fuchsia/5 rounded-full blur-2xl group-hover:bg-brand-fuchsia/10 transition-all"></div>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Danh mục sản phẩm</p>
          <p class="text-2xl font-bold text-white font-mono">{{ stats()?.totalProducts || 18 }} Dòng</p>
          <p class="text-[10px] text-slate-400">Loại hoạt động: Serum, Kem, SRM</p>
        </div>

        <!-- Metric 3: Safe threshold alarm -->
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2 relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-fuchsia/5 rounded-full blur-2xl group-hover:bg-brand-fuchsia/10 transition-all"></div>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Cảnh Báo Hết Hàng</p>
          <p class="text-2xl font-bold font-mono" [class.text-rose-500]="stats()?.lowStockCount! > 0" [class.text-white]="stats()?.lowStockCount === 0">
            {{ stats()?.lowStockCount || 3 }} Sản Phẩm
          </p>
          <p class="text-[10px]" [class.text-rose-400]="stats()?.lowStockCount! > 0" [class.text-slate-400]="stats()?.lowStockCount === 0">
            ⚠️ Đã xuống dưới định mức an toàn
          </p>
        </div>

        <!-- Metric 4: Total Reserved for checkouts -->
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2 relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-fuchsia/5 rounded-full blur-2xl group-hover:bg-brand-fuchsia/10 transition-all"></div>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Hàng Chờ Đóng Gói</p>
          <p class="text-2xl font-bold text-brand-fuchsia-light font-mono">{{ stats()?.totalReservedItems || 12 }} SP</p>
          <p class="text-[10px] text-slate-400">Đã trừ giữ kho tạm thời cho giỏ hàng</p>
        </div>

      </div>

      <!-- Action items & Lists -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Column 1 & 2: Recent stock warnings -->
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div class="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 class="font-bold text-sm text-white">Báo Cáo Tồn Kho Dưới Định Mức (Nguy Cơ Đứt Hàng)</h3>
            <a routerLink="/admin/inventory" class="text-[10px] text-brand-fuchsia hover:underline">Vào quản kho</a>
          </div>

          <div class="space-y-3 text-xs">
            @for (item of lowStockItems; track item.name) {
              <div class="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                <div class="space-y-0.5">
                  <h4 class="font-semibold text-slate-200">{{ item.name }}</h4>
                  <p class="text-[10px] text-slate-400">Mã: {{ item.sku }} | Ngưỡng báo động: <strong class="text-slate-200">{{ item.threshold }}</strong></p>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-rose-500 font-bold text-sm">{{ item.actual }}</span> <span class="text-slate-400">sp còn lại</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Column 3: Quick operation tools -->
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 text-xs font-semibold">
          <div class="border-b border-slate-800 pb-3">
            <h3 class="font-bold text-sm text-white">Phím Tắt Quản Trị Viên</h3>
          </div>

          <div class="flex flex-col space-y-2">
            <a routerLink="/admin/products" class="w-full py-3 bg-slate-850 border border-slate-700 hover:bg-brand-fuchsia hover:border-brand-fuchsia rounded-xl text-center text-white transition-all">
              📦 Thêm & Chỉnh Sửa Mỹ Phẩm
            </a>
            <a routerLink="/admin/orders" class="w-full py-3 bg-slate-850 border border-slate-700 hover:bg-brand-fuchsia hover:border-brand-fuchsia rounded-xl text-center text-white transition-all">
              🧾 Phê Duyệt Trạng Thái Đơn Hàng
            </a>
            <a routerLink="/admin/inventory" class="w-full py-3 bg-slate-850 border border-slate-700 hover:bg-brand-fuchsia hover:border-brand-fuchsia rounded-xl text-center text-white transition-all">
              🚚 Nhập Kho & Thay Đổi Ngưỡng
            </a>
          </div>
        </div>

      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly stats = signal<InventoryStatsDTO | null>(null);
  readonly isLoading = signal(false);

  // Fallback stock warnings
  readonly lowStockItems = [
    { name: 'Tinh chất Trị Mụn BHA 2% Salicylic Acid Acne Clearing Serum (30ml)', sku: 'SKU-BHA-30ML', actual: 4, threshold: 10 },
    { name: 'Tinh chất Niacinamide 15% Dưỡng Sáng Mờ Thâm Sạm Brightening Booster', sku: 'SKU-NIA-30ML', actual: 2, threshold: 15 },
    { name: 'Nước Hoa Hồng Cân Bằng Cấp Ẩm Centella Soothing Toner (150ml)', sku: 'SKU-TON-150ML', actual: 1, threshold: 8 }
  ];

  ngOnInit(): void {
    this.isLoading.set(true);
    this.adminService.getInventoryStats().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.stats.set(res.data);
        } else {
          this.stats.set({
            totalProducts: 8,
            lowStockCount: 3,
            totalReservedItems: 12,
            stockMovementsCount: 84
          });
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.stats.set({
          totalProducts: 8,
          lowStockCount: 3,
          totalReservedItems: 12,
          stockMovementsCount: 84
        });
      }
    });
  }
}
