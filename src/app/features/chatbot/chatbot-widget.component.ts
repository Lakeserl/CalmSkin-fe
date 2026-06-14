import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatbotService } from '../../core/services/chatbot.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageDTO } from '../../core/models/chatbot.model';

/**
 * Floating chat widget for the CalmSkin AI skincare advisor.
 * Pinned to bottom-right; opens to a chat panel.
 */
@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isAuthenticated()) {
      <!-- Trigger button (hidden when panel open) -->
      @if (!isOpen()) {
        <button
          type="button"
          class="fixed bottom-5 right-5 z-50 w-14 h-14 bg-brand-fuchsia hover:bg-brand-fuchsia-dark text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Mở chat tư vấn"
          (click)="open()"
        >
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      }

      <!-- Chat panel -->
      @if (isOpen()) {
        <div class="fixed bottom-5 right-5 z-50 w-[360px] max-w-[calc(100vw-1rem)] h-[520px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl border border-brand-fuchsia-light/30 flex flex-col overflow-hidden animate-fade-in">
          <header class="bg-gradient-to-r from-brand-fuchsia to-brand-fuchsia-dark px-4 py-3 text-white flex items-center justify-between">
            <div>
              <p class="text-sm font-bold">Tư vấn viên CalmSkin</p>
              <p class="text-[10px] opacity-80">Đang trực tuyến</p>
            </div>
            <div class="flex items-center space-x-1">
              <button class="p-1.5 hover:bg-white/20 rounded-full" title="Cuộc trò chuyện mới" (click)="newConversation()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              </button>
              <button class="p-1.5 hover:bg-white/20 rounded-full" title="Đóng" (click)="close()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </header>

          <div #scrollContainer class="flex-1 overflow-y-auto p-3 space-y-3 bg-stone-50">
            @if (messages().length === 0) {
              <div class="text-center text-brand-muted text-xs py-8 space-y-2">
                <p>👋 Xin chào! Tôi có thể giúp bạn:</p>
                <ul class="space-y-1.5">
                  @for (q of starterQuestions; track q) {
                    <li>
                      <button
                        class="text-xs text-brand-fuchsia hover:underline"
                        (click)="sendQuick(q)"
                      >• {{ q }}</button>
                    </li>
                  }
                </ul>
              </div>
            }
            @for (m of messages(); track $index) {
              <div class="flex" [class.justify-end]="m.role === 'user'">
                <div
                  class="max-w-[80%] px-3 py-2 rounded-2xl text-xs whitespace-pre-line"
                  [class.bg-brand-fuchsia]="m.role === 'user'"
                  [class.text-white]="m.role === 'user'"
                  [class.bg-white]="m.role !== 'user'"
                  [class.border]="m.role !== 'user'"
                  [class.text-brand-charcoal]="m.role !== 'user'"
                >
                  {{ m.content }}
                </div>
              </div>
            }
            @if (suggestions().length > 0 && !isLoading()) {
              <div class="flex flex-wrap gap-1.5 pt-1">
                @for (s of suggestions(); track s) {
                  <button
                    class="text-[10px] px-2 py-1 bg-brand-rosewater hover:bg-brand-fuchsia hover:text-white rounded-full transition-colors"
                    (click)="sendQuick(s)"
                  >{{ s }}</button>
                }
              </div>
            }
            @if (isLoading()) {
              <div class="flex">
                <div class="bg-white border px-3 py-2 rounded-2xl text-xs text-brand-muted">Đang trả lời...</div>
              </div>
            }
            @if (errorMessage()) {
              <div class="bg-rose-50 border border-rose-200 text-rose-600 text-[11px] rounded-lg p-2">
                {{ errorMessage() }}
              </div>
            }
          </div>

          <form class="border-t bg-white p-2 flex items-center space-x-2" (ngSubmit)="send()">
            <input
              type="text"
              [(ngModel)]="draft"
              name="draft"
              placeholder="Hỏi về sản phẩm, liệu trình..."
              autocomplete="off"
              class="flex-1 px-3 py-2 text-xs border rounded-full focus:outline-none focus:ring-1 focus:ring-brand-fuchsia"
              [disabled]="isLoading()"
            />
            <button
              type="submit"
              class="p-2 bg-brand-fuchsia hover:bg-brand-fuchsia-dark text-white rounded-full disabled:opacity-50"
              [disabled]="isLoading() || !draft.trim()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      }
    }
  `,
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  private readonly chatbotService = inject(ChatbotService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isOpen = signal(false);
  readonly messages = signal<MessageDTO[]>([]);
  readonly suggestions = signal<string[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  private conversationId: number | null = null;
  private shouldScroll = false;

  draft = '';

  readonly starterQuestions = [
    'Da dầu mụn nên dùng routine nào?',
    'Niacinamide có dùng chung Vitamin C được không?',
    'Tôi cần tẩy tế bào chết bao lâu một lần?',
  ];

  open(): void {
    this.isOpen.set(true);
    this.errorMessage.set('');
  }

  close(): void {
    this.isOpen.set(false);
  }

  newConversation(): void {
    this.conversationId = null;
    this.messages.set([]);
    this.suggestions.set([]);
    this.errorMessage.set('');
  }

  sendQuick(text: string): void {
    this.draft = text;
    this.send();
  }

  send(): void {
    const text = this.draft.trim();
    if (!text || this.isLoading()) return;

    // Optimistic append the user message
    const userMsg: MessageDTO = {
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    this.messages.update((m) => [...m, userMsg]);
    this.draft = '';
    this.suggestions.set([]);
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.shouldScroll = true;

    this.chatbotService
      .send({ conversationId: this.conversationId ?? undefined, message: text })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          const data = res.data;
          if (!data) return;
          this.conversationId = data.conversationId;
          this.messages.update((m) => [
            ...m,
            {
              role: 'assistant',
              content: data.response,
              createdAt: new Date().toISOString(),
            },
          ]);
          this.suggestions.set(data.suggestedActions ?? []);
          this.shouldScroll = true;
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.message || 'Không kết nối được trợ lý.');
        },
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }
}
