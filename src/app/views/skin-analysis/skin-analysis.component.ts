import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkinAnalysisService } from '../../core/services/skin-analysis.service';
import {
  AnalysisStatus,
  SkinAnalysisResultDTO,
} from '../../core/models/skin-analysis.model';

@Component({
  selector: 'app-skin-analysis',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <header class="border-b pb-5">
        <h1 class="text-3xl font-serif text-brand-charcoal">Phân tích da bằng AI</h1>
        <p class="text-xs text-brand-muted mt-1">
          Tải lên ảnh khuôn mặt — Gemini AI sẽ phát hiện loại da, vấn đề da, và gợi ý liệu trình + sản phẩm phù hợp.
        </p>
      </header>

      <!-- Step 1: Upload form -->
      @if (!sessionId() && !result()) {
        <section class="bg-white border rounded-skincare p-6 space-y-5">
          <div>
            <label class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Ảnh khuôn mặt</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="block w-full mt-2 text-xs text-brand-muted file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-fuchsia file:text-white hover:file:bg-brand-fuchsia-dark"
              (change)="onFile($event)"
            />
            <p class="text-[10px] text-brand-muted mt-1">JPEG, PNG hoặc WEBP — tối đa 10MB.</p>
            @if (previewUrl()) {
              <img [src]="previewUrl()!" class="mt-3 rounded-xl border max-h-64 object-cover" />
            }
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Tuổi (tuỳ chọn)</label>
              <input type="number" min="10" max="100" [(ngModel)]="age" class="block w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-fuchsia" />
            </div>
            <div>
              <label class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Loại da bạn tự nhận (tuỳ chọn)</label>
              <select [(ngModel)]="selfSkinType" class="block w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:outline-none">
                <option value="">--</option>
                <option value="OILY">Da dầu</option>
                <option value="DRY">Da khô</option>
                <option value="COMBINATION">Da hỗn hợp</option>
                <option value="SENSITIVE">Da nhạy cảm</option>
                <option value="NORMAL">Da thường</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Vấn đề da bạn quan tâm (cách nhau bằng dấu phẩy)</label>
            <input type="text" [(ngModel)]="selfConcerns" placeholder="ACNE, DARK_SPOTS, AGING" class="block w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:outline-none" />
          </div>

          <div>
            <label class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Dị ứng (tuỳ chọn)</label>
            <input type="text" [(ngModel)]="allergies" placeholder="VD: hương liệu, paraben..." class="block w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:outline-none" />
          </div>

          <label class="flex items-start space-x-2 text-xs text-brand-charcoal">
            <input type="checkbox" [(ngModel)]="consentGiven" class="mt-0.5 accent-brand-fuchsia" />
            <span>
              Tôi đồng ý cho CalmSkin chuyển ảnh khuôn mặt (dữ liệu sinh trắc học) đến Google Gemini API
              và lưu trữ trên Cloudinary theo Nghị định 13/2023/NĐ-CP. Tôi có thể xoá kết quả bất cứ lúc nào.
            </span>
          </label>

          @if (errorMessage()) {
            <p class="text-xs text-rose-500">{{ errorMessage() }}</p>
          }

          <button
            type="button"
            class="w-full sm:w-auto px-6 py-3 bg-brand-fuchsia text-white text-xs font-bold rounded-full hover:bg-brand-fuchsia-dark disabled:opacity-50"
            [disabled]="!file() || !consentGiven || submitting()"
            (click)="submit()"
          >
            {{ submitting() ? 'Đang tải...' : 'Bắt đầu phân tích' }}
          </button>
        </section>
      }

      <!-- Step 2: Polling -->
      @if (sessionId() && !result()?.completedAt && !isFailed()) {
        <section class="bg-white border rounded-skincare p-10 text-center space-y-3">
          <div class="inline-block w-12 h-12 rounded-full border-4 border-brand-fuchsia-light border-t-brand-fuchsia animate-spin"></div>
          <p class="text-sm text-brand-charcoal font-semibold">
            AI đang phân tích ảnh của bạn...
          </p>
          <p class="text-[11px] text-brand-muted">
            Thường mất 10-30 giây. {{ pollAttempts() }} lần kiểm tra.
          </p>
        </section>
      }

      <!-- Step 3: Result -->
      @if (result(); as r) {
        @if (r.status === 'COMPLETED') {
          <section class="space-y-6 animate-fade-in">
            <div class="bg-emerald-50 border border-emerald-200 rounded-skincare p-5">
              <p class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Loại da phát hiện</p>
              <p class="text-xl font-bold text-brand-charcoal mt-1">{{ r.detectedSkinType || 'Chưa xác định' }}</p>
              @if (r.detectedConcerns?.length) {
                <div class="mt-3 flex flex-wrap gap-1.5">
                  @for (c of r.detectedConcerns!; track c) {
                    <span class="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full font-semibold">{{ c }}</span>
                  }
                </div>
              }
              @if (r.skinConditionReport) {
                <p class="text-xs text-brand-charcoal mt-3 whitespace-pre-line">{{ r.skinConditionReport }}</p>
              }
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @if (r.morningRoutine?.steps?.length) {
                <div class="bg-amber-50/60 border border-amber-200 rounded-skincare p-5">
                  <p class="text-sm font-serif text-brand-charcoal flex items-center space-x-2">
                    <span>🌅</span><span>Routine buổi sáng</span>
                  </p>
                  <ol class="mt-3 space-y-2 text-xs list-decimal list-inside text-brand-charcoal">
                    @for (s of r.morningRoutine!.steps; track $index) {
                      <li>{{ s }}</li>
                    }
                  </ol>
                </div>
              }
              @if (r.eveningRoutine?.steps?.length) {
                <div class="bg-indigo-50/50 border border-indigo-200 rounded-skincare p-5">
                  <p class="text-sm font-serif text-brand-charcoal flex items-center space-x-2">
                    <span>🌙</span><span>Routine buổi tối</span>
                  </p>
                  <ol class="mt-3 space-y-2 text-xs list-decimal list-inside text-brand-charcoal">
                    @for (s of r.eveningRoutine!.steps; track $index) {
                      <li>{{ s }}</li>
                    }
                  </ol>
                </div>
              }
            </div>

            @if (r.recommendedProducts?.length) {
              <div>
                <h2 class="text-lg font-serif text-brand-charcoal border-b pb-2 mb-4">Sản phẩm được đề xuất</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  @for (p of r.recommendedProducts!; track p.productId) {
                    <a
                      [routerLink]="['/products']"
                      [queryParams]="{ id: p.productId }"
                      class="bg-white rounded-skincare border hover:shadow-md hover:border-brand-fuchsia/40 transition-all p-3 block"
                    >
                      <img [src]="p.imageUrl || 'assets/placeholder.jpg'" class="w-full aspect-square object-cover rounded-lg mb-2" />
                      @if (p.category) {
                        <p class="text-[9px] text-brand-muted uppercase tracking-wider">{{ p.category }}</p>
                      }
                      <p class="text-xs font-semibold text-brand-charcoal line-clamp-2">{{ p.name }}</p>
                      <p class="text-xs font-bold text-brand-fuchsia-dark mt-1">{{ p.price | currency: 'VND' : 'symbol' : '1.0-0' }}</p>
                    </a>
                  }
                </div>
              </div>
            }

            <div class="text-center">
              <button class="px-5 py-2 text-xs border rounded-full hover:bg-stone-50" (click)="reset()">
                Phân tích ảnh khác
              </button>
            </div>
          </section>
        }

        @if (r.status === 'FAILED') {
          <section class="bg-rose-50 border border-rose-200 rounded-skincare p-6 text-center space-y-3">
            <p class="text-sm font-bold text-rose-700">Phân tích thất bại</p>
            <p class="text-xs text-rose-600">{{ r.failureReason || 'Không thể xử lý ảnh. Vui lòng thử ảnh khác.' }}</p>
            <button class="px-5 py-2 text-xs bg-brand-fuchsia text-white rounded-full" (click)="reset()">Thử lại</button>
          </section>
        }
      }
    </div>
  `,
})
export class SkinAnalysisComponent implements OnDestroy {
  private readonly skinAnalysisService = inject(SkinAnalysisService);
  private readonly destroyRef = inject(DestroyRef);

  readonly file = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly sessionId = signal<string | null>(null);
  readonly result = signal<SkinAnalysisResultDTO | null>(null);
  readonly errorMessage = signal('');
  readonly pollAttempts = signal(0);

  age?: number;
  selfSkinType = '';
  selfConcerns = '';
  allergies = '';
  consentGiven = false;

  private pollTimer?: ReturnType<typeof setTimeout>;
  private readonly maxAttempts = 60; // ~60×3s = 3min cap

  isFailed(): boolean {
    return this.result()?.status === 'FAILED';
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      this.errorMessage.set('Ảnh vượt quá 10MB.');
      return;
    }
    this.errorMessage.set('');
    this.file.set(f);
    this.previewUrl.set(URL.createObjectURL(f));
  }

  submit(): void {
    const f = this.file();
    if (!f || !this.consentGiven) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    this.skinAnalysisService
      .startAnalysis({
        image: f,
        age: this.age,
        selfSkinType: this.selfSkinType || undefined,
        selfConcerns: this.selfConcerns || undefined,
        allergies: this.allergies || undefined,
        consentGiven: true,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          const id = res.data?.sessionId;
          if (!id) {
            this.errorMessage.set('Máy chủ không trả về sessionId.');
            return;
          }
          this.sessionId.set(id);
          this.startPolling(id);
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err?.message || 'Không thể bắt đầu phân tích.');
        },
      });
  }

  private startPolling(id: string): void {
    this.pollAttempts.set(0);
    const poll = (): void => {
      this.pollAttempts.update((n) => n + 1);
      if (this.pollAttempts() > this.maxAttempts) {
        this.errorMessage.set('Phân tích quá thời gian — vui lòng thử lại.');
        return;
      }
      this.skinAnalysisService
        .getResult(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            const data = res.data;
            if (!data) return;
            this.result.set(data);
            if (this.isTerminal(data.status)) return;
            this.pollTimer = setTimeout(poll, 3000);
          },
          error: () => {
            this.pollTimer = setTimeout(poll, 3000);
          },
        });
    };
    poll();
  }

  private isTerminal(s: AnalysisStatus): boolean {
    return s === 'COMPLETED' || s === 'FAILED';
  }

  reset(): void {
    if (this.pollTimer) clearTimeout(this.pollTimer);
    this.sessionId.set(null);
    this.result.set(null);
    this.file.set(null);
    this.previewUrl.set(null);
    this.pollAttempts.set(0);
    this.errorMessage.set('');
    this.consentGiven = false;
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearTimeout(this.pollTimer);
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
  }
}
