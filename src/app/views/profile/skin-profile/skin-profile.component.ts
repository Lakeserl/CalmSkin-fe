import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { LanguageService } from '../../../core/services/language.service';
import { SkinProfileDTO, SkinType } from '../../../core/models/user.model';

interface ConcernOption { key: string; viLabel: string; enLabel: string; }

@Component({
  selector: 'app-skin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <div class="flex justify-between items-center border-b pb-4 mb-8">
        <h1 class="text-3xl font-serif text-brand-charcoal">
          {{ lang.currentLang() === 'vi' ? 'Hồ sơ làn da' : 'Skin Profile' }}
        </h1>
        <a routerLink="/profile" class="text-xs text-brand-fuchsia hover:underline font-bold">
          ← {{ lang.currentLang() === 'vi' ? 'Về Tài khoản' : 'Back to Profile' }}
        </a>
      </div>

      <p class="text-xs text-brand-muted mb-8">
        {{ lang.currentLang() === 'vi'
          ? 'Giúp CalmSKIN gợi ý sản phẩm phù hợp với làn da bạn. Hồ sơ này tự động cập nhật khi bạn dùng Face Scan AI.'
          : 'Helps CalmSKIN recommend products tailored to your skin. This profile auto-updates when you use the AI Face Scan.' }}
      </p>

      @if (isLoading()) {
        <div class="text-center py-20 text-brand-muted text-sm">
          {{ lang.currentLang() === 'vi' ? 'Đang tải...' : 'Loading...' }}
        </div>
      } @else {
        <form (ngSubmit)="save()" class="space-y-6 bg-white border border-brand-fuchsia-light/20 rounded-skincare p-6 shadow-sm">

          <!-- Skin type -->
          <fieldset class="space-y-2">
            <legend class="text-[11px] uppercase tracking-wider text-brand-charcoal font-bold">
              {{ lang.currentLang() === 'vi' ? 'Loại da' : 'Skin type' }}
            </legend>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              @for (t of skinTypes; track t) {
                <label class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition"
                       [class.border-brand-fuchsia]="skinType() === t"
                       [class.bg-brand-rosewater]="skinType() === t"
                       [class.border-stone-200]="skinType() !== t">
                  <input type="radio" name="st" [value]="t" [ngModel]="skinType()" (ngModelChange)="skinType.set($event)" class="text-brand-fuchsia" />
                  <span class="font-semibold">{{ labelForType(t) }}</span>
                </label>
              }
            </div>
          </fieldset>

          <!-- Concerns -->
          <fieldset class="space-y-2">
            <legend class="text-[11px] uppercase tracking-wider text-brand-charcoal font-bold">
              {{ lang.currentLang() === 'vi' ? 'Vấn đề da quan tâm' : 'Skin concerns' }}
            </legend>
            <div class="flex flex-wrap gap-2 text-xs">
              @for (c of concernOptions; track c.key) {
                <button type="button" (click)="toggleConcern(c.key)"
                        class="px-3 py-1.5 rounded-full border font-semibold transition"
                        [class.border-brand-fuchsia]="concerns().includes(c.key)"
                        [class.bg-brand-fuchsia]="concerns().includes(c.key)"
                        [class.text-white]="concerns().includes(c.key)"
                        [class.border-stone-200]="!concerns().includes(c.key)">
                  {{ lang.currentLang() === 'vi' ? c.viLabel : c.enLabel }}
                </button>
              }
            </div>
          </fieldset>

          <!-- Allergies (free text, comma-separated) -->
          <div class="space-y-1">
            <label class="text-[11px] uppercase tracking-wider text-brand-charcoal font-bold">
              {{ lang.currentLang() === 'vi' ? 'Dị ứng / tránh thành phần (phân tách bằng dấu phẩy)' : 'Allergies / ingredients to avoid (comma-separated)' }}
            </label>
            <input type="text" [ngModel]="allergiesText()" (ngModelChange)="allergiesText.set($event)" name="al"
                   class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light bg-stone-50/30 text-xs font-medium"
                   placeholder="fragrance, paraben, alcohol" />
          </div>

          <!-- Note -->
          <div class="space-y-1">
            <label class="text-[11px] uppercase tracking-wider text-brand-charcoal font-bold">
              {{ lang.currentLang() === 'vi' ? 'Ghi chú thêm' : 'Notes' }}
            </label>
            <textarea [ngModel]="note()" (ngModelChange)="note.set($event)" name="nt" rows="3"
                      class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light bg-stone-50/30 text-xs font-medium"></textarea>
          </div>

          <button type="submit" [disabled]="isSaving()"
                  class="px-8 py-3 btn-fuchsia-glow rounded-full text-[11px] font-bold disabled:opacity-50">
            {{ isSaving()
              ? (lang.currentLang() === 'vi' ? 'Đang lưu...' : 'Saving...')
              : (existing()
                  ? (lang.currentLang() === 'vi' ? 'Cập nhật hồ sơ' : 'Update profile')
                  : (lang.currentLang() === 'vi' ? 'Tạo hồ sơ' : 'Create profile')) }}
          </button>
        </form>
      }
    </div>
  `
})
export class SkinProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  readonly lang = inject(LanguageService);

  readonly skinTypes: SkinType[] = ['NORMAL', 'DRY', 'OILY', 'COMBINATION', 'SENSITIVE', 'ACNE_PRONE'];
  readonly concernOptions: ConcernOption[] = [
    { key: 'ACNE',       viLabel: 'Mụn',             enLabel: 'Acne' },
    { key: 'DARK_SPOTS', viLabel: 'Thâm nám',        enLabel: 'Dark spots' },
    { key: 'WRINKLES',   viLabel: 'Nếp nhăn',        enLabel: 'Wrinkles' },
    { key: 'DULLNESS',   viLabel: 'Da xỉn màu',      enLabel: 'Dullness' },
    { key: 'REDNESS',    viLabel: 'Da đỏ / kích ứng', enLabel: 'Redness' },
    { key: 'PORES',      viLabel: 'Lỗ chân lông to', enLabel: 'Enlarged pores' },
    { key: 'OILINESS',   viLabel: 'Da dầu',          enLabel: 'Oiliness' },
    { key: 'DEHYDRATION',viLabel: 'Da mất nước',     enLabel: 'Dehydration' },
  ];

  readonly skinType = signal<SkinType>('NORMAL');
  readonly concerns = signal<string[]>([]);
  readonly allergiesText = signal('');
  readonly note = signal('');
  readonly existing = signal<SkinProfileDTO | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.userService.getSkinProfile().subscribe({
      next: res => {
        if (res.success && res.data) {
          this.existing.set(res.data);
          this.skinType.set(res.data.skinType);
          this.concerns.set(res.data.skinConcerns ?? []);
          this.allergiesText.set((res.data.allergies ?? []).join(', '));
          this.note.set(res.data.note ?? '');
        }
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }   // 404 first-time is expected
    });
  }

  labelForType(t: SkinType): string {
    const map: Record<SkinType, { vi: string; en: string }> = {
      NORMAL:      { vi: 'Da thường',  en: 'Normal' },
      DRY:         { vi: 'Da khô',     en: 'Dry' },
      OILY:        { vi: 'Da dầu',     en: 'Oily' },
      COMBINATION: { vi: 'Da hỗn hợp', en: 'Combination' },
      SENSITIVE:   { vi: 'Da nhạy cảm', en: 'Sensitive' },
      ACNE_PRONE:  { vi: 'Da dễ mụn',  en: 'Acne-prone' },
    };
    const e = map[t];
    return this.lang.currentLang() === 'vi' ? e.vi : e.en;
  }

  toggleConcern(key: string): void {
    this.concerns.update(list => list.includes(key) ? list.filter(k => k !== key) : [...list, key]);
  }

  save(): void {
    this.isSaving.set(true);
    const allergies = this.allergiesText().split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      skinType: this.skinType(),
      skinConcerns: this.concerns(),
      allergies,
      note: this.note() || undefined,
    };
    const call$ = this.existing()
      ? this.userService.updateSkinProfile(payload)
      : this.userService.createSkinProfile(payload);
    call$.subscribe({
      next: res => {
        if (res.data) this.existing.set(res.data);
        this.isSaving.set(false);
        alert(this.lang.currentLang() === 'vi' ? 'Đã lưu hồ sơ da' : 'Skin profile saved');
      },
      error: () => {
        this.isSaving.set(false);
        alert(this.lang.currentLang() === 'vi' ? 'Lưu thất bại' : 'Save failed');
      }
    });
  }
}
