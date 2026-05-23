import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../service/notification.service';
import { NotificationDTO, NotificationStatsDTO, NotificationTemplateDTO } from '../model/notification.model';

type Tab = 'feed' | 'templates' | 'broadcast';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [DatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h1 class="text-xl font-bold text-white mb-6">Quản lý thông báo</h1>

      <!-- Stats Cards -->
      @if (stats()) {
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-white">{{ stats()!.sentToday }}</p>
            <p class="text-xs text-gray-400 mt-1">Đã gửi hôm nay</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-red-400">{{ stats()!.failedToday }}</p>
            <p class="text-xs text-gray-400 mt-1">Thất bại</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-blue-400">{{ stats()!.emailCount }}</p>
            <p class="text-xs text-gray-400 mt-1">Email</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-green-400">{{ stats()!.pushCount }}</p>
            <p class="text-xs text-gray-400 mt-1">Push</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-purple-400">{{ stats()!.inAppCount }}</p>
            <p class="text-xs text-gray-400 mt-1">In-App</p>
          </div>
        </div>
      }

      <!-- Tabs -->
      <div class="flex gap-1 bg-gray-800 rounded-xl p-1 w-fit mb-6">
        @for (t of tabs; track t.key) {
          <button
            (click)="activeTab.set(t.key)"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none"
            [class.bg-brand-fuchsia]="activeTab() === t.key"
            [class.text-white]="activeTab() === t.key"
            [class.text-gray-400]="activeTab() !== t.key"
            [class.hover:text-white]="activeTab() !== t.key"
          >{{ t.label }}</button>
        }
      </div>

      <!-- Feed Tab -->
      @if (activeTab() === 'feed') {
        <div class="bg-gray-800 rounded-xl overflow-hidden">
          @if (feedLoading()) {
            <div class="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
          } @else if (feed().length === 0) {
            <div class="p-8 text-center text-gray-400 text-sm">Không có thông báo nào.</div>
          } @else {
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-gray-400 border-b border-gray-700">
                  <th class="px-4 py-3 font-medium">Tiêu đề</th>
                  <th class="px-4 py-3 font-medium">Kênh</th>
                  <th class="px-4 py-3 font-medium">Ưu tiên</th>
                  <th class="px-4 py-3 font-medium">Trạng thái</th>
                  <th class="px-4 py-3 font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                @for (n of feed(); track n.id) {
                  <tr class="hover:bg-gray-700/50 transition-colors">
                    <td class="px-4 py-3 text-white">{{ n.subject }}</td>
                    <td class="px-4 py-3 text-gray-300 uppercase text-xs">{{ n.channel }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded text-xs font-medium"
                        [class.bg-red-900]="n.priority === 'HIGH'"
                        [class.text-red-300]="n.priority === 'HIGH'"
                        [class.bg-yellow-900]="n.priority === 'NORMAL'"
                        [class.text-yellow-300]="n.priority === 'NORMAL'"
                        [class.bg-gray-700]="n.priority === 'LOW'"
                        [class.text-gray-300]="n.priority === 'LOW'"
                      >{{ n.priority }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded text-xs font-medium"
                        [class.bg-green-900]="n.status === 'DELIVERED'"
                        [class.text-green-300]="n.status === 'DELIVERED'"
                        [class.bg-red-900]="n.status === 'FAILED'"
                        [class.text-red-300]="n.status === 'FAILED'"
                        [class.bg-blue-900]="n.status === 'SENT'"
                        [class.text-blue-300]="n.status === 'SENT'"
                      >{{ n.status }}</span>
                    </td>
                    <td class="px-4 py-3 text-gray-400 text-xs">{{ n.createdAt | date:'dd/MM HH:mm' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }

      <!-- Templates Tab -->
      @if (activeTab() === 'templates') {
        <div class="space-y-3">
          @if (templatesLoading()) {
            <div class="bg-gray-800 rounded-xl p-8 text-center text-gray-400 text-sm">Đang tải...</div>
          } @else {
            @for (t of templates(); track t.id) {
              <div class="bg-gray-800 rounded-xl p-4">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <code class="text-xs bg-gray-700 text-brand-fuchsia px-2 py-0.5 rounded">{{ t.code }}</code>
                      <span class="text-xs text-gray-400 uppercase">{{ t.channel }}</span>
                      <span class="text-xs text-gray-400">v{{ t.version }}</span>
                      @if (!t.active) {
                        <span class="text-xs bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded">Tắt</span>
                      }
                    </div>
                    <p class="text-sm text-white font-medium">{{ t.subject }}</p>
                    <p class="text-xs text-gray-400 mt-1 line-clamp-2">{{ t.body }}</p>
                  </div>
                  <button
                    (click)="openTemplateEdit(t)"
                    class="text-xs text-brand-fuchsia hover:underline shrink-0 focus:outline-none"
                  >Sửa</button>
                </div>
              </div>
            }
          }
        </div>
      }

      <!-- Broadcast Tab -->
      @if (activeTab() === 'broadcast') {
        <div class="bg-gray-800 rounded-xl p-6 max-w-lg">
          <h2 class="text-sm font-semibold text-white mb-4">Gửi thông báo hàng loạt</h2>
          <div class="space-y-4">
            <div>
              <label class="text-xs text-gray-400 block mb-1">Mã template *</label>
              <input
                type="text"
                [(ngModel)]="bcTemplate"
                placeholder="vd: ORDER_CONFIRMED"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-fuchsia"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">User IDs (mỗi dòng một ID) *</label>
              <textarea
                [(ngModel)]="bcUserIds"
                rows="4"
                placeholder="uuid-1&#10;uuid-2"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-fuchsia resize-none font-mono"
              ></textarea>
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">Tiêu đề (tuỳ chọn)</label>
              <input
                type="text"
                [(ngModel)]="bcTitle"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-fuchsia"
              />
            </div>
            <button
              (click)="sendBroadcast()"
              [disabled]="bcLoading()"
              class="w-full py-2.5 bg-brand-fuchsia text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 focus:outline-none transition-opacity"
            >
              @if (bcLoading()) { Đang gửi... } @else { Gửi thông báo }
            </button>
            @if (bcResult()) {
              <p class="text-xs text-green-400 text-center">{{ bcResult() }}</p>
            }
          </div>
        </div>
      }
    </div>

    <!-- Template Edit Modal -->
    @if (editingTemplate()) {
      <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" (click)="editingTemplate.set(null)">
        <div class="bg-gray-900 rounded-xl p-6 w-full max-w-lg" (click)="$event.stopPropagation()">
          <h3 class="text-sm font-semibold text-white mb-4">Chỉnh sửa template: {{ editingTemplate()!.code }}</h3>
          <div class="space-y-3">
            <div>
              <label class="text-xs text-gray-400 block mb-1">Tiêu đề</label>
              <input
                type="text"
                [(ngModel)]="editSubject"
                class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-fuchsia"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">Nội dung</label>
              <textarea
                [(ngModel)]="editBody"
                rows="5"
                class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-fuchsia resize-none"
              ></textarea>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="editActive" class="w-4 h-4 accent-brand-fuchsia" />
              <span class="text-sm text-gray-300">Kích hoạt</span>
            </label>
          </div>
          <div class="flex gap-3 mt-5">
            <button
              (click)="saveTemplate()"
              class="flex-1 py-2 bg-brand-fuchsia text-white rounded-lg text-sm font-semibold hover:opacity-90 focus:outline-none"
            >Lưu</button>
            <button
              (click)="editingTemplate.set(null)"
              class="flex-1 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 focus:outline-none"
            >Hủy</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminNotificationsComponent implements OnInit {
  readonly #svc = inject(NotificationService);

  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'feed', label: 'Luồng thông báo' },
    { key: 'templates', label: 'Templates' },
    { key: 'broadcast', label: 'Broadcast' },
  ];

  readonly activeTab = signal<Tab>('feed');
  readonly stats = signal<NotificationStatsDTO | null>(null);

  readonly feed = signal<NotificationDTO[]>([]);
  readonly feedLoading = signal(false);

  readonly templates = signal<NotificationTemplateDTO[]>([]);
  readonly templatesLoading = signal(false);

  readonly editingTemplate = signal<NotificationTemplateDTO | null>(null);
  editSubject = '';
  editBody = '';
  editActive = true;

  bcTemplate = '';
  bcUserIds = '';
  bcTitle = '';
  readonly bcLoading = signal(false);
  readonly bcResult = signal('');

  ngOnInit(): void {
    this.#svc.getAdminStats().subscribe({ next: (r) => this.stats.set(r.data) });
    this.loadFeed();
    this.loadTemplates();
  }

  private loadFeed(): void {
    this.feedLoading.set(true);
    this.#svc.getAdminNotifications().subscribe({
      next: (r) => { this.feed.set(r.data?.content ?? []); this.feedLoading.set(false); },
      error: () => this.feedLoading.set(false),
    });
  }

  private loadTemplates(): void {
    this.templatesLoading.set(true);
    this.#svc.getTemplates().subscribe({
      next: (r) => { this.templates.set(r.data?.content ?? []); this.templatesLoading.set(false); },
      error: () => this.templatesLoading.set(false),
    });
  }

  openTemplateEdit(t: NotificationTemplateDTO): void {
    this.editingTemplate.set(t);
    this.editSubject = t.subject;
    this.editBody = t.body;
    this.editActive = t.active;
  }

  saveTemplate(): void {
    const t = this.editingTemplate();
    if (!t) return;
    this.#svc.updateTemplate(t.id, { subject: this.editSubject, body: this.editBody, active: this.editActive })
      .subscribe({
        next: (r) => {
          this.templates.update((list) => list.map((x) => (x.id === t.id ? r.data : x)));
          this.editingTemplate.set(null);
        },
      });
  }

  sendBroadcast(): void {
    const userIds = this.bcUserIds.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!this.bcTemplate || userIds.length === 0) return;
    this.bcLoading.set(true);
    this.bcResult.set('');
    this.#svc.broadcast({ templateCode: this.bcTemplate, userIds, title: this.bcTitle || undefined })
      .subscribe({
        next: () => {
          this.bcLoading.set(false);
          this.bcResult.set(`✓ Đã xếp hàng gửi tới ${userIds.length} người dùng`);
          this.bcTemplate = '';
          this.bcUserIds = '';
          this.bcTitle = '';
        },
        error: () => { this.bcLoading.set(false); this.bcResult.set('Lỗi khi gửi broadcast.'); },
      });
  }
}
