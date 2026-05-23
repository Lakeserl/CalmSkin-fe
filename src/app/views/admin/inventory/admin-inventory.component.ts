import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { InventoryDTO, StockMovementDTO } from '../../../core/models/order.model';
import { ProductSummaryDTO } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in text-slate-100">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 class="text-3xl font-serif font-bold text-white">Quản Lý Tồn Kho</h1>
          <p class="text-xs text-slate-400 mt-1">Giám sát lượng hàng bán được, lượng giữ kho tạm thời và nhập hàng mới về kho CalmSKIN.</p>
        </div>
        <div class="flex items-center space-x-2 shrink-0">
          <button 
            (click)="activeTab.set('stocks')"
            [class.bg-brand-fuchsia]="activeTab() === 'stocks'"
            [class.border-brand-fuchsia]="activeTab() === 'stocks'"
            class="px-4 py-2 border border-slate-800 bg-slate-900 text-xs rounded-full hover:bg-slate-800 transition-all font-bold text-white"
          >
            Số Lượng Thực Tế
          </button>
          <button 
            (click)="activeTab.set('movements')"
            [class.bg-brand-fuchsia]="activeTab() === 'movements'"
            [class.border-brand-fuchsia]="activeTab() === 'movements'"
            class="px-4 py-2 border border-slate-800 bg-slate-900 text-xs rounded-full hover:bg-slate-800 transition-all font-bold text-white"
          >
            Lịch Sử Biến Động
          </button>
        </div>
      </div>

      <!-- TAB CONTENT 1: STOCKS MATRIX -->
      @if (activeTab() === 'stocks') {
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <!-- Inventory Table (2/3 width) -->
          <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
            @if (isLoading()) {
              <div class="p-20 text-center text-slate-400">Đang cập nhật tồn kho...</div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-slate-850 font-bold bg-slate-950 text-slate-400">
                      <th class="p-4">Mã SKU</th>
                      <th class="p-4">Tên Sản Phẩm</th>
                      <th class="p-4 text-center">Bán Được (Available)</th>
                      <th class="p-4 text-center">Giữ Kho (Reserved)</th>
                      <th class="p-4 text-center">Ngưỡng Báo Động</th>
                      <th class="p-4 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (inv of inventories(); track inv.id) {
                      <tr class="border-b border-slate-850 hover:bg-slate-850/40 transition-colors"
                        [class.bg-rose-900/15]="inv.quantityAvailable <= inv.lowStockThreshold"
                      >
                        <td class="p-4 font-mono font-bold text-slate-300">{{ getSKU(inv) }}</td>
                        <td class="p-4 font-semibold text-slate-100 max-w-xs truncate">{{ inv.productName || 'Mỹ phẩm CalmSkin' }}</td>
                        <td class="p-4 text-center text-sm font-bold text-emerald-400 font-mono">{{ inv.quantityAvailable }}</td>
                        <td class="p-4 text-center text-sm font-mono text-cyan-400">{{ inv.quantityReserved }}</td>
                        <td class="p-4 text-center text-slate-300 font-mono">{{ inv.lowStockThreshold }}</td>
                        <td class="p-4 text-center">
                          <button (click)="openThresholdEdit(inv)" class="text-brand-fuchsia hover:text-white font-bold transition-colors">Sửa Ngưỡng</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Stock Intake Form (1/3 width) -->
          <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 text-xs font-semibold">
            <h3 class="text-base font-serif font-bold text-white border-b border-slate-800 pb-2">Nhập Thêm Hàng Mới</h3>
            
            <form (ngSubmit)="submitStockImport()" class="space-y-4">
              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 uppercase tracking-wider">Chọn Mỹ Phẩm Nhập</label>
                <select [(ngModel)]="importInventoryId" name="impInv" required class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white">
                  <option [value]="0">Chọn sản phẩm...</option>
                  @for (inv of inventories(); track inv.id) {
                    <option [value]="inv.id">{{ inv.productName }} ({{ getSKU(inv) }})</option>
                  }
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 uppercase tracking-wider">Số lượng nhập thêm</label>
                <input type="number" [(ngModel)]="importQuantity" name="impQty" required min="1" class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono font-bold" />
              </div>

              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 uppercase tracking-wider">Ghi chú nhập kho</label>
                <textarea [(ngModel)]="importNote" name="impNote" rows="2" placeholder="VD: Nhập hàng lô tháng 5, lô SX 2026..." class="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"></textarea>
              </div>

              <button 
                type="submit" 
                [disabled]="isLoading() || importInventoryId === 0 || importQuantity <= 0"
                class="w-full py-3 bg-brand-fuchsia text-white rounded-xl font-bold hover:bg-brand-fuchsia-dark transition-all disabled:opacity-50"
              >
                Xác Nhận Nhập Hàng
              </button>
            </form>
          </div>

        </div>

      }

      <!-- TAB CONTENT 2: STOCK MOVEMENT LOGS -->
      @if (activeTab() === 'movements') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs animate-fade-in">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-850 font-bold bg-slate-950 text-slate-400">
                  <th class="p-4">Thời Gian</th>
                  <th class="p-4">Mã SKU / Giao Dịch ID</th>
                  <th class="p-4">Giao Dịch</th>
                  <th class="p-4 text-center">Biến Động</th>
                  <th class="p-4">Ghi Chú Chi Tiết</th>
                </tr>
              </thead>
              <tbody>
                @for (move of movements(); track move.id) {
                  <tr class="border-b border-slate-850 hover:bg-slate-850/40 transition-colors">
                    <td class="p-4 text-slate-400 font-mono">{{ move.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="p-4 font-mono text-slate-300">ID-{{ move.inventoryId }} / {{ move.referenceId || 'INT-TRX' }}</td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide"
                        [ngClass]="{
                          'bg-emerald-500/20 text-emerald-400': move.movementType === 'IN',
                          'bg-red-500/20 text-red-400': move.movementType === 'OUT',
                          'bg-amber-500/20 text-amber-400': move.movementType === 'RESERVE',
                          'bg-indigo-500/20 text-indigo-400': move.movementType === 'RELEASE'
                        }"
                      >
                        {{ getMovementTypeText(move.movementType) }}
                      </span>
                    </td>
                    <td class="p-4 text-center font-bold font-mono"
                      [class.text-emerald-400]="move.movementType === 'IN' || move.movementType === 'RELEASE'"
                      [class.text-rose-400]="move.movementType === 'OUT' || move.movementType === 'RESERVE'"
                    >
                      {{ (move.movementType === 'IN' || move.movementType === 'RELEASE') ? '+' : '-' }}{{ move.quantity }}
                    </td>
                    <td class="p-4 text-slate-300 font-normal">{{ move.note || 'Không có ghi chú.' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

    </div>
  `
})
export class AdminInventoryComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly productService = inject(ProductService);

  readonly activeTab = signal<'stocks' | 'movements'>('stocks');
  readonly inventories = signal<InventoryDTO[]>([]);
  readonly movements = signal<StockMovementDTO[]>([]);
  readonly isLoading = signal(false);

  // Form states
  importInventoryId = 0;
  importQuantity = 10;
  importNote = '';

  // Mock list matching Spring Boot lowStockThreshold
  private readonly mockInventories: InventoryDTO[] = [
    {
      id: 1,
      productId: 1,
      variantId: 11,
      productName: 'Tinh chất Trị Mụn BHA 2% Salicylic Acid Acne Clearing Serum (30ml)',
      quantityAvailable: 4,
      quantityReserved: 2,
      quantitySold: 120,
      lowStockThreshold: 10,
      warehouseLocation: 'SHELF-A1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      productId: 2,
      variantId: 21,
      productName: 'Kem dưỡng Phục Hồi Làm Dịu Da Tổn Thương Panthenol B5 Cream (50ml)',
      quantityAvailable: 245,
      quantityReserved: 10,
      quantitySold: 580,
      lowStockThreshold: 15,
      warehouseLocation: 'SHELF-B3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  private readonly mockMovements: StockMovementDTO[] = [
    {
      id: 881,
      inventoryId: 1,
      quantity: 100,
      movementType: 'IN',
      note: 'Nhập lô hàng BHA mới về kho đợt đầu tháng 5',
      referenceId: 'PO-2026-001',
      createdAt: '2026-05-01T09:00:00Z'
    },
    {
      id: 882,
      inventoryId: 1,
      quantity: 1,
      movementType: 'RESERVE',
      note: 'Khách hàng đặt giữ kho tạm thời cho mã đơn hàng ORD-7492',
      referenceId: 'ORD-7492',
      createdAt: new Date().toISOString()
    }
  ];

  ngOnInit(): void {
    this.loadInventoryData();
  }

  loadInventoryData() {
    this.isLoading.set(true);

    // Fetch actual stock levels from adminService
    this.adminService.getInventory(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content && res.data.content.length > 0) {
          this.inventories.set(res.data.content);
        } else {
          this.inventories.set(this.mockInventories);
        }

        // Fetch movements for ID 1 (mock/or resolved)
        this.adminService.getInventoryMovements(1).subscribe({
          next: (movRes) => {
            this.isLoading.set(false);
            if (movRes.success && movRes.data && movRes.data.content) {
              this.movements.set(movRes.data.content);
            } else {
              this.movements.set(this.mockMovements);
            }
          },
          error: () => {
            this.isLoading.set(false);
            this.movements.set(this.mockMovements);
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.inventories.set(this.mockInventories);
        this.movements.set(this.mockMovements);
      }
    });
  }

  getSKU(inv: InventoryDTO): string {
    if (inv.productId === 1) return 'SKU-BHA-30ML';
    if (inv.productId === 2) return 'SKU-B5-50ML';
    return `SKU-PROD-${inv.productId}`;
  }

  openThresholdEdit(inv: InventoryDTO) {
    const nextVal = prompt(`Nhập định mức ngưỡng báo động an toàn mới cho sản phẩm:`, inv.lowStockThreshold.toString());
    if (nextVal === null) return;
    const threshold = parseInt(nextVal);
    if (isNaN(threshold) || threshold < 0) {
      alert('Ngưỡng phải là số nguyên dương!');
      return;
    }

    this.isLoading.set(true);
    this.adminService.updateInventoryThreshold(inv.id, threshold, inv.warehouseLocation).subscribe({
      next: () => {
        alert('Cập nhật ngưỡng an toàn thành công!');
        this.loadInventoryData();
      },
      error: () => {
        const list = this.inventories().map(i => {
          if (i.id === inv.id) {
            return { ...i, lowStockThreshold: threshold };
          }
          return i;
        });
        this.inventories.set(list);
        this.isLoading.set(false);
        alert('Cập nhật ngưỡng an toàn giả lập thành công!');
      }
    });
  }

  submitStockImport() {
    if (this.importInventoryId === 0 || this.importQuantity <= 0) return;

    this.isLoading.set(true);
    
    // We send payload to import
    this.adminService.importStock(this.importInventoryId, this.importQuantity, this.importNote).subscribe({
      next: () => {
        alert('Nhập hàng mới thành công!');
        this.clearImportForm();
        this.loadInventoryData();
      },
      error: () => {
        // Mock add import
        const list = this.inventories().map(i => {
          if (i.id === +this.importInventoryId) {
            return { ...i, quantityAvailable: i.quantityAvailable + this.importQuantity };
          }
          return i;
        });
        this.inventories.set(list);
        
        const newMov: StockMovementDTO = {
          id: Math.floor(Math.random() * 1000),
          inventoryId: this.importInventoryId,
          quantity: this.importQuantity,
          movementType: 'IN',
          note: this.importNote || 'Nhập hàng bổ sung giả lập',
          referenceId: 'PO-MOCK-NEW',
          createdAt: new Date().toISOString()
        };
        this.movements.set([newMov, ...this.movements()]);
        
        this.clearImportForm();
        this.isLoading.set(false);
        alert('Nhập hàng mới giả lập thành công!');
      }
    });
  }

  private clearImportForm() {
    this.importInventoryId = 0;
    this.importQuantity = 10;
    this.importNote = '';
  }

  getMovementTypeText(type: string): string {
    const map: Record<string, string> = {
      IN: 'Nhập hàng',
      OUT: 'Giao đơn hàng',
      RESERVE: 'Giữ hàng checkout',
      RELEASE: 'Hủy đơn hoàn trả'
    };
    return map[type] || type;
  }
}
