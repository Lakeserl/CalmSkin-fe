import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OrderService, VietnamRegion } from '../../core/services/order.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { UserDTO, AddressDTO, LoyaltyTransactionDTO } from '../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <h1 class="text-3xl font-serif text-brand-charcoal mb-8 border-b pb-4">{{ 'profile.title' | translate }}</h1>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- Column 1: Small sidebar profile summary -->
        <div class="space-y-6">
          <div class="glass-card p-6 rounded-skincare text-center space-y-4">
            
            <!-- Avatar Box -->
            <div class="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-brand-fuchsia bg-brand-rosewater group shadow-md">
              <img 
                [src]="profile()?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'" 
                class="w-full h-full object-cover" 
              />
              <button (click)="uploadAvatar()" class="absolute inset-0 bg-black/40 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                {{ 'profile.changeAvatar' | translate }}
              </button>
            </div>

            <div>
              <h2 class="font-serif font-bold text-brand-charcoal text-base">{{ profile()?.fullName }}</h2>
              <span class="inline-block bg-brand-fuchsia text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-1 shadow-sm">
                {{ 'profile.tier' | translate }} {{ profile()?.membershipClass || 'SILVER' }}
              </span>
            </div>

            <!-- Loyalty Quick card -->
            <div class="border-t pt-4 text-xs space-y-2">
              <div class="flex justify-between text-brand-muted font-semibold">
                <span>{{ 'profile.points' | translate }}</span>
                <strong class="text-brand-fuchsia-dark text-sm">{{ profile()?.points || 0 }} xu</strong>
              </div>
              <div class="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-brand-fuchsia h-full transition-all duration-500" [ngStyle]="{ 'width': getTierProgress() }"></div>
              </div>
              <p class="text-[9px] text-brand-muted text-left">
                💡 {{ 'profile.nextTierTip' | translate: { points: getNextTierDiff() } }}
              </p>
            </div>

            <!-- Menu links -->
            <div class="border-t pt-4 text-left text-xs font-semibold space-y-2">
              <button (click)="activeTab.set('profile')" [class.text-brand-fuchsia]="activeTab() === 'profile'" class="w-full text-left py-1 hover:text-brand-fuchsia focus:outline-none">
                {{ 'profile.tabInfo' | translate }}
              </button>
              <button (click)="activeTab.set('loyalty')" [class.text-brand-fuchsia]="activeTab() === 'loyalty'" class="w-full text-left py-1 hover:text-brand-fuchsia focus:outline-none">
                {{ 'profile.tabLoyalty' | translate }}
              </button>
              <button (click)="activeTab.set('address')" [class.text-brand-fuchsia]="activeTab() === 'address'" class="w-full text-left py-1 hover:text-brand-fuchsia focus:outline-none">
                {{ 'profile.tabAddress' | translate }}
              </button>
              <button (click)="logout()" class="w-full text-left py-1 text-red-500 hover:underline border-t mt-2 pt-2 focus:outline-none">
                {{ 'nav.logout' | translate }}
              </button>
            </div>

          </div>
        </div>

        <!-- Column 2,3,4: Main Active Tab content -->
        <div class="lg:col-span-3 space-y-6">
          
          <!-- Tab 1: Profile Editing -->
          @if (activeTab() === 'profile') {
            <div class="bg-white p-6 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-6 animate-fade-in">
              <h3 class="text-lg font-serif font-bold text-brand-charcoal border-b pb-2">
                {{ 'profile.infoHeading' | translate }}
              </h3>
              
              <form (ngSubmit)="onUpdateProfile()" class="space-y-4 text-xs font-semibold">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ 'profile.fullName' | translate }}</label>
                    <input type="text" [(ngModel)]="fullName" name="fullName" required class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light bg-stone-50/30 font-medium" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ 'profile.phone' | translate }}</label>
                    <input type="tel" [(ngModel)]="phoneNumber" name="phoneNumber" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light bg-stone-50/30 font-medium" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ 'profile.gender' | translate }}</label>
                    <select [(ngModel)]="gender" name="gender" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light bg-white font-medium">
                      <option value="FEMALE">{{ 'profile.genderFemale' | translate }}</option>
                      <option value="MALE">{{ 'profile.genderMale' | translate }}</option>
                      <option value="OTHER">{{ 'profile.genderOther' | translate }}</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ 'profile.dob' | translate }}</label>
                    <input type="date" [(ngModel)]="dateOfBirth" name="dob" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light bg-stone-50/30 font-medium" />
                  </div>
                </div>

                <div class="pt-2">
                  <button type="submit" [disabled]="isSubmitting()" class="px-8 py-3.5 btn-fuchsia-glow rounded-full text-[11px] font-bold">
                    {{ isSubmitting() ? ('profile.saving' | translate) : ('profile.saveBtn' | translate) }}
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Tab 2: Loyalty Transactions -->
          @if (activeTab() === 'loyalty') {
            <div class="bg-white p-6 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-6 animate-fade-in text-xs">
              <h3 class="text-lg font-serif font-bold text-brand-charcoal border-b pb-2">
                {{ 'profile.loyaltyHeading' | translate }}
              </h3>
              
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b text-brand-charcoal font-bold bg-stone-50">
                      <th class="p-3">{{ 'profile.loyaltyDate' | translate }}</th>
                      <th class="p-3">{{ 'profile.loyaltyType' | translate }}</th>
                      <th class="p-3">{{ 'profile.loyaltyAmount' | translate }}</th>
                      <th class="p-3">{{ 'profile.loyaltyDesc' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (tx of loyaltyHistory(); track tx.id) {
                      <tr class="border-b hover:bg-stone-50/40 transition-colors">
                        <td class="p-3 text-brand-muted font-mono">{{ tx.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td class="p-3">
                          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider"
                            [class.bg-emerald-100]="tx.transactionType === 'EARN'"
                            [class.text-emerald-700]="tx.transactionType === 'EARN'"
                            [class.bg-red-100]="tx.transactionType === 'SPEND'"
                            [class.text-red-700]="tx.transactionType === 'SPEND'"
                          >
                            {{ tx.transactionType === 'EARN' ? ('profile.loyaltyEarn' | translate) : ('profile.loyaltySpend' | translate) }}
                          </span>
                        </td>
                        <td class="p-3 font-extrabold font-mono text-sm"
                          [class.text-emerald-600]="tx.transactionType === 'EARN'"
                          [class.text-red-600]="tx.transactionType === 'SPEND'"
                        >
                          {{ tx.transactionType === 'EARN' ? '+' : '-' }}{{ tx.points }}
                        </td>
                        <td class="p-3 text-brand-charcoal font-normal">{{ tx.description }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Tab 3: Address Book -->
          @if (activeTab() === 'address') {
            <div class="bg-white p-6 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-6 animate-fade-in text-xs">
              <div class="flex justify-between items-center border-b pb-2">
                <h3 class="text-lg font-serif font-bold text-brand-charcoal">
                  {{ 'profile.addrHeading' | translate }}
                </h3>
                <button 
                  (click)="showAddAddress.set(!showAddAddress())"
                  class="px-4 py-2 border border-brand-fuchsia text-brand-fuchsia hover:bg-brand-rosewater rounded-full font-bold text-[10px] transition-all focus:outline-none"
                >
                  {{ showAddAddress() ? ('profile.addrClose' | translate) : ('profile.addrAddNew' | translate) }}
                </button>
              </div>

              <!-- Add New Address Form -->
              @if (showAddAddress()) {
                <form (ngSubmit)="onAddAddress()" class="p-4 border border-brand-fuchsia-light/20 rounded-xl bg-stone-50/50 space-y-4 font-semibold">
                  <h4 class="text-brand-fuchsia font-bold">
                    {{ lang.currentLang() === 'vi' ? 'Thêm địa chỉ nhận hàng mới' : 'Add a new shipping address' }}
                  </h4>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ 'profile.addrReceiverName' | translate }}</label>
                      <input type="text" [(ngModel)]="newAddressName" name="addrName" required class="w-full px-3 py-2 rounded-lg border text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-brand-fuchsia" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ 'profile.addrPhone' | translate }}</label>
                      <input type="tel" [(ngModel)]="newAddressPhone" name="addrPhone" required class="w-full px-3 py-2 rounded-lg border text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-brand-fuchsia" />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <!-- Province -->
                    <div class="space-y-1">
                      <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ 'profile.addrProvince' | translate }}</label>
                      <select [(ngModel)]="selectedProvince" (change)="onProvinceChange()" name="addrProv" class="w-full px-3 py-2 rounded-lg border text-xs bg-white font-medium focus:outline-none">
                        <option value="">{{ lang.currentLang() === 'vi' ? 'Chọn Tỉnh/Thành' : 'Select Province' }}</option>
                        @for (p of provinces; track p.name) {
                          <option [value]="p.name">{{ p.name }}</option>
                        }
                      </select>
                    </div>

                    <!-- District -->
                    <div class="space-y-1">
                      <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ 'profile.addrDistrict' | translate }}</label>
                      <select [(ngModel)]="selectedDistrict" (change)="onDistrictChange()" [disabled]="!selectedProvince" name="addrDist" class="w-full px-3 py-2 rounded-lg border text-xs bg-white font-medium focus:outline-none">
                        <option value="">{{ lang.currentLang() === 'vi' ? 'Chọn Quận/Huyện' : 'Select District' }}</option>
                        @for (d of filteredDistricts; track d.name) {
                          <option [value]="d.name">{{ d.name }}</option>
                        }
                      </select>
                    </div>

                    <!-- Ward -->
                    <div class="space-y-1">
                      <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ 'profile.addrWard' | translate }}</label>
                      <select [(ngModel)]="selectedWard" [disabled]="!selectedDistrict" name="addrWard" class="w-full px-3 py-2 rounded-lg border text-xs bg-white font-medium focus:outline-none">
                        <option value="">{{ lang.currentLang() === 'vi' ? 'Chọn Phường/Xã' : 'Select Ward' }}</option>
                        @for (w of filteredWards; track w) {
                          <option [value]="w">{{ w }}</option>
                        }
                      </select>
                    </div>
                  </div>

                  <div class="space-y-1">
                    <label class="text-[10px] text-brand-charcoal uppercase tracking-wider">{{ 'profile.addrStreet' | translate }}</label>
                    <input type="text" [(ngModel)]="newStreet" name="addrStreet" required class="w-full px-3 py-2 rounded-lg border text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-brand-fuchsia" />
                  </div>

                  <div class="flex items-center space-x-2">
                    <input type="checkbox" [(ngModel)]="newIsDefault" name="addrDef" id="addrDef" class="text-brand-fuchsia focus:ring-brand-fuchsia" />
                    <label for="addrDef" class="text-[10px] text-brand-muted cursor-pointer font-bold">{{ 'profile.addrDefault' | translate }}</label>
                  </div>

                  <button type="submit" class="px-6 py-2.5 bg-brand-fuchsia text-white rounded-lg font-bold text-[10px] hover:bg-brand-fuchsia-dark transition-all">
                    {{ 'profile.addrSave' | translate }}
                  </button>
                </form>
              }

              <!-- Address List -->
              <div class="space-y-4">
                @for (addr of addresses(); track addr.id) {
                  <div class="p-4 border rounded-xl flex items-start justify-between space-x-4 hover:border-brand-fuchsia/40 transition-colors">
                    <div class="space-y-1.5">
                      <div class="flex items-center space-x-2">
                        <strong class="text-brand-charcoal">{{ addr.recipientName }}</strong>
                        <span class="text-brand-muted">| {{ addr.recipientPhone }}</span>
                        @if (addr.isDefault) {
                          <span class="bg-brand-fuchsia/10 text-brand-fuchsia-dark text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                            {{ 'profile.addrIsDefault' | translate }}
                          </span>
                        }
                      </div>
                      <p class="text-brand-muted leading-relaxed font-medium">
                        {{ addr.streetAddress }}, {{ addr.ward }}, {{ addr.district }}, {{ addr.province }}
                      </p>
                    </div>

                    <button 
                      (click)="deleteAddress(addr.id)"
                      class="text-red-500 hover:underline font-bold text-[10px] shrink-0 focus:outline-none"
                    >
                      {{ 'profile.addrDelete' | translate }}
                    </button>
                  </div>
                }
              </div>

            </div>
          }

        </div>

      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  readonly lang = inject(LanguageService);

  readonly profile = signal<UserDTO | null>(null);
  readonly addresses = signal<AddressDTO[]>([]);
  readonly loyaltyHistory = signal<LoyaltyTransactionDTO[]>([]);
  
  readonly activeTab = signal<'profile' | 'loyalty' | 'address'>('profile');
  readonly isSubmitting = signal(false);
  readonly showAddAddress = signal(false);

  fullName = '';
  phoneNumber = '';
  gender = 'FEMALE';
  dateOfBirth = '';

  newAddressName = '';
  newAddressPhone = '';
  newStreet = '';
  newIsDefault = false;
  selectedProvince = '';
  selectedDistrict = '';
  selectedWard = '';

  provinces: VietnamRegion[] = [];
  filteredDistricts: { name: string; wards: string[] }[] = [];
  filteredWards: string[] = [];

  private readonly mockAddresses: AddressDTO[] = [
    {
      id: 991,
      recipientName: 'Khánh Linh',
      recipientPhone: '0987654321',
      province: 'Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Bến Nghé',
      streetAddress: '15 Lê Lợi',
      isDefault: true
    }
  ];

  private readonly mockLoyaltyTx: LoyaltyTransactionDTO[] = [
    { id: 701, points: 100, transactionType: 'EARN', description: 'Điểm thưởng đăng ký thành viên mới CalmSKIN', createdAt: new Date().toISOString() }
  ];

  ngOnInit(): void {
    this.provinces = this.orderService.getVietnamRegions();
    this.loadUserData();
  }

  loadUserData() {
    this.profile.set(this.authService.currentUser());
    if (this.profile()) {
      const u = this.profile()!;
      this.fullName = u.fullName;
      this.phoneNumber = u.phoneNumber || '';
      this.gender = u.gender || 'FEMALE';
      this.dateOfBirth = u.dateOfBirth || '';
    }

    this.authService.getUserAddresses().subscribe(res => {
      if (res.success && res.data && res.data.length > 0) {
        this.addresses.set(res.data);
      } else {
        this.addresses.set(this.mockAddresses);
      }
    });

    this.authService.getLoyaltyHistory().subscribe(res => {
      if (res.success && res.data) {
        this.loyaltyHistory.set(res.data);
      } else {
        this.loyaltyHistory.set(this.mockLoyaltyTx);
      }
    });
  }

  getTierProgress(): string {
    const points = this.profile()?.points || 0;
    if (points >= 1000) return '100%';
    const pct = (points / 1000) * 100;
    return `${pct}%`;
  }

  getNextTierDiff(): number {
    const points = this.profile()?.points || 0;
    if (points >= 1000) return 0;
    return 1000 - points;
  }

  onProvinceChange() {
    const prov = this.provinces.find(p => p.name === this.selectedProvince);
    this.filteredDistricts = prov ? prov.districts : [];
    this.selectedDistrict = '';
    this.filteredWards = [];
    this.selectedWard = '';
  }

  onDistrictChange() {
    const dist = this.filteredDistricts.find(d => d.name === this.selectedDistrict);
    this.filteredWards = dist ? dist.wards : [];
    this.selectedWard = '';
  }

  onUpdateProfile() {
    if (!this.fullName) return;
    this.isSubmitting.set(true);

    const payload = {
      fullName: this.fullName,
      phoneNumber: this.phoneNumber,
      gender: this.gender,
      dateOfBirth: this.dateOfBirth
    };

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        alert(this.lang.currentLang() === 'vi' 
          ? 'Cập nhật thông tin cá nhân thành công!' 
          : 'Personal profile updated successfully!'
        );
        this.loadUserData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err.message || 'Cập nhật thất bại.');
      }
    });
  }

  onAddAddress() {
    if (!this.newAddressName || !this.newAddressPhone || !this.selectedProvince || !this.selectedDistrict || !this.selectedWard || !this.newStreet) {
      alert(this.lang.currentLang() === 'vi'
        ? 'Vui lòng hoàn thành form địa chỉ nhận hàng!'
        : 'Please fill in all shipping address fields!'
      );
      return;
    }

    const payload = {
      recipientName: this.newAddressName,
      recipientPhone: this.newAddressPhone,
      province: this.selectedProvince,
      district: this.selectedDistrict,
      ward: this.selectedWard,
      streetAddress: this.newStreet,
      isDefault: this.newIsDefault
    };

    this.authService.addAddress(payload).subscribe({
      next: () => {
        alert(this.lang.currentLang() === 'vi' ? 'Thêm địa chỉ mới thành công.' : 'Added new address successfully.');
        this.showAddAddress.set(false);
        this.clearAddressForm();
        this.loadUserData();
      },
      error: () => {
        const id = Math.floor(Math.random() * 1000);
        const mappedAddr: AddressDTO = {
          id,
          recipientName: payload.recipientName,
          recipientPhone: payload.recipientPhone,
          province: payload.province,
          district: payload.district,
          ward: payload.ward,
          streetAddress: payload.streetAddress,
          isDefault: payload.isDefault
        };
        this.addresses.set([...this.addresses(), mappedAddr]);
        this.showAddAddress.set(false);
        this.clearAddressForm();
        alert(this.lang.currentLang() === 'vi' 
          ? 'Địa chỉ mới đã được ghi nhận giả lập!' 
          : 'New address recorded mockingly!'
        );
      }
    });
  }

  private clearAddressForm() {
    this.newAddressName = '';
    this.newAddressPhone = '';
    this.newStreet = '';
    this.selectedProvince = '';
    this.selectedDistrict = '';
    this.selectedWard = '';
    this.newIsDefault = false;
  }

  deleteAddress(addressId: number) {
    if (!confirm(this.lang.currentLang() === 'vi' 
      ? 'Bạn có chắc chắn muốn xóa địa chỉ nhận hàng này?' 
      : 'Are you sure you want to delete this shipping address?'
    )) return;

    this.authService.deleteAddress(addressId).subscribe({
      next: () => {
        alert(this.lang.currentLang() === 'vi' ? 'Xóa địa chỉ thành công.' : 'Deleted address successfully.');
        this.loadUserData();
      },
      error: () => {
        this.addresses.set(this.addresses().filter(a => a.id !== addressId));
        alert(this.lang.currentLang() === 'vi' ? 'Đã xóa địa chỉ thành công!' : 'Deleted address successfully!');
      }
    });
  }

  uploadAvatar() {
    const url = prompt(this.lang.currentLang() === 'vi' 
      ? 'Nhập đường dẫn URL ảnh đại diện mới của bạn:' 
      : 'Enter your new avatar image URL:'
    );
    if (!url) return;

    this.authService.updateAvatar(url).subscribe({
      next: () => {
        alert(this.lang.currentLang() === 'vi' ? 'Thay đổi ảnh đại diện thành công!' : 'Avatar changed successfully!');
        this.loadUserData();
      },
      error: () => {
        alert(this.lang.currentLang() === 'vi' ? 'Đổi ảnh đại diện giả lập thành công.' : 'Changed avatar mockingly.');
        if (this.profile()) {
          this.profile()!.avatarUrl = url;
        }
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
