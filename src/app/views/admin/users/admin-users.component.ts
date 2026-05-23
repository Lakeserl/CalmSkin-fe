import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AdminUserDTO, AuditLogDTO, AdminUserStats } from '../../../core/models/user.model';
import { SpringPage } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in text-slate-100">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 class="text-3xl font-serif font-bold text-white">User Management</h1>
          <p class="text-xs text-slate-400 mt-1">
            Ban, role-assign and audit accounts across the CalmSKIN platform.
          </p>
        </div>
        <button (click)="downloadCsv()" [disabled]="isExporting()"
                class="px-4 py-2 border border-slate-800 bg-slate-900 text-xs rounded-full hover:bg-slate-800 font-bold text-white disabled:opacity-50">
          {{ isExporting() ? 'Exporting…' : 'Export CSV' }}
        </button>
      </div>

      <!-- Stats summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        @for (kv of statEntries(); track kv.key) {
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p class="text-[10px] uppercase text-slate-400 tracking-wider">{{ kv.key }}</p>
            <p class="text-2xl font-extrabold font-mono mt-1">{{ kv.value }}</p>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        <!-- USER LIST (2/3) -->
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
          @if (isLoading()) {
            <div class="p-20 text-center text-slate-400">Loading users…</div>
          } @else if (users().length === 0) {
            <div class="p-20 text-center text-slate-400">No users found.</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-850 font-bold bg-slate-950 text-slate-400">
                    <th class="p-4">User</th>
                    <th class="p-4">Email</th>
                    <th class="p-4 text-center">Role</th>
                    <th class="p-4 text-center">Status</th>
                    <th class="p-4 text-center">Joined</th>
                    <th class="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of users(); track u.id) {
                    <tr class="border-b border-slate-850 hover:bg-slate-850/40 transition-colors"
                        [class.bg-rose-900/15]="u.status === 'BANNED'">
                      <td class="p-4 font-semibold text-slate-100">
                        <button (click)="selectUser(u)" class="hover:text-brand-fuchsia-light text-left">
                          {{ u.fullName }}
                        </button>
                        <p class="text-[10px] text-slate-500 font-mono mt-0.5">{{ u.id.substring(0, 8) }}…</p>
                      </td>
                      <td class="p-4 text-slate-300">{{ u.email }}</td>
                      <td class="p-4 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase"
                              [class.bg-fuchsia-900]="u.role === 'ADMIN'"
                              [class.text-fuchsia-200]="u.role === 'ADMIN'"
                              [class.bg-slate-800]="u.role !== 'ADMIN'"
                              [class.text-slate-300]="u.role !== 'ADMIN'">
                          {{ u.role }}
                        </span>
                      </td>
                      <td class="p-4 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase"
                              [class.bg-emerald-900]="u.status === 'ACTIVE'"
                              [class.text-emerald-300]="u.status === 'ACTIVE'"
                              [class.bg-red-900]="u.status === 'BANNED'"
                              [class.text-red-300]="u.status === 'BANNED'"
                              [class.bg-slate-800]="u.status === 'INACTIVE'"
                              [class.text-slate-300]="u.status === 'INACTIVE'">
                          {{ u.status }}
                        </span>
                      </td>
                      <td class="p-4 text-center text-slate-400 font-mono">
                        {{ u.createdAt | date:'dd/MM/yyyy' }}
                      </td>
                      <td class="p-4 text-center space-x-1 whitespace-nowrap">
                        @if (u.status === 'BANNED') {
                          <button (click)="unban(u)" class="text-emerald-400 hover:underline text-[10px] font-bold">Unban</button>
                        } @else {
                          <button (click)="ban(u)" class="text-red-400 hover:underline text-[10px] font-bold">Ban</button>
                        }
                        <button (click)="toggleRole(u)" class="text-fuchsia-300 hover:underline text-[10px] font-bold">
                          {{ u.role === 'ADMIN' ? 'Demote' : 'Promote' }}
                        </button>
                        <button (click)="resetPassword(u)" class="text-cyan-300 hover:underline text-[10px] font-bold">Reset PW</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- pagination -->
            <div class="flex items-center justify-between px-4 py-3 border-t border-slate-850 text-[11px]">
              <span class="text-slate-400">
                Page {{ page() + 1 }} / {{ totalPages() || 1 }} · {{ totalElements() }} users
              </span>
              <div class="space-x-2">
                <button (click)="prev()" [disabled]="page() === 0"
                        class="px-3 py-1 bg-slate-800 rounded disabled:opacity-30 font-bold">Prev</button>
                <button (click)="next()" [disabled]="page() + 1 >= totalPages()"
                        class="px-3 py-1 bg-slate-800 rounded disabled:opacity-30 font-bold">Next</button>
              </div>
            </div>
          }
        </div>

        <!-- DETAIL / AUDIT LOG (1/3) -->
        <aside class="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs space-y-4">
          @if (selectedUser()) {
            <div>
              <p class="text-[10px] uppercase text-slate-400 tracking-wider">Audit Log</p>
              <p class="text-sm font-bold text-white mt-1">{{ selectedUser()!.fullName }}</p>
              <p class="text-[10px] text-slate-500 font-mono">{{ selectedUser()!.email }}</p>
            </div>
            @if (isLoadingLogs()) {
              <div class="text-slate-400 py-6 text-center">Loading audit logs…</div>
            } @else if (auditLogs().length === 0) {
              <div class="text-slate-500 py-6 text-center italic">No audit entries yet.</div>
            } @else {
              <ul class="space-y-2 max-h-[440px] overflow-y-auto">
                @for (log of auditLogs(); track log.id) {
                  <li class="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div class="flex items-center justify-between gap-2">
                      <strong class="text-fuchsia-300 text-[10px] uppercase tracking-wider">{{ log.action }}</strong>
                      <span class="text-[10px] text-slate-500 font-mono">{{ log.createdAt | date:'dd/MM HH:mm' }}</span>
                    </div>
                    @if (log.description) {
                      <p class="text-slate-300 mt-1 leading-relaxed">{{ log.description }}</p>
                    }
                    @if (log.ipAddress) {
                      <p class="text-[10px] text-slate-500 mt-1 font-mono">{{ log.ipAddress }}</p>
                    }
                  </li>
                }
              </ul>
            }
          } @else {
            <p class="text-slate-500 italic text-center py-8">Select a user to view audit logs.</p>
          }
        </aside>

      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly users = signal<AdminUserDTO[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly isLoading = signal(true);

  readonly stats = signal<AdminUserStats>({});
  readonly statEntries = computed(() =>
    Object.entries(this.stats())
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([key, value]) => ({ key, value: value as number }))
  );

  readonly selectedUser = signal<AdminUserDTO | null>(null);
  readonly auditLogs = signal<AuditLogDTO[]>([]);
  readonly isLoadingLogs = signal(false);

  readonly isExporting = signal(false);

  ngOnInit(): void {
    this.loadStats();
    this.loadPage();
  }

  loadStats(): void {
    this.adminService.getUserStatsSummary().subscribe({
      next: res => this.stats.set(res.data ?? {}),
      error: () => {}
    });
  }

  loadPage(): void {
    this.isLoading.set(true);
    this.adminService.listUsers(this.page(), this.size()).subscribe({
      next: res => {
        const p = res.data as SpringPage<AdminUserDTO> | undefined;
        this.users.set(p?.content ?? []);
        this.totalElements.set(p?.totalElements ?? 0);
        this.totalPages.set(p?.totalPages ?? 0);
        this.isLoading.set(false);
      },
      error: () => { this.users.set([]); this.isLoading.set(false); }
    });
  }

  prev(): void { if (this.page() > 0) { this.page.update(n => n - 1); this.loadPage(); } }
  next(): void { if (this.page() + 1 < this.totalPages()) { this.page.update(n => n + 1); this.loadPage(); } }

  selectUser(u: AdminUserDTO): void {
    this.selectedUser.set(u);
    this.isLoadingLogs.set(true);
    this.adminService.getUserAuditLogs(u.id, 0, 50).subscribe({
      next: res => {
        const p = res.data as SpringPage<AuditLogDTO> | undefined;
        this.auditLogs.set(p?.content ?? []);
        this.isLoadingLogs.set(false);
      },
      error: () => { this.auditLogs.set([]); this.isLoadingLogs.set(false); }
    });
  }

  ban(u: AdminUserDTO): void {
    if (!confirm(`Ban user ${u.email}?`)) return;
    this.adminService.banUser(u.id).subscribe({
      next: () => { this.patchLocal(u.id, { status: 'BANNED' }); this.loadStats(); },
      error: () => alert('Ban failed')
    });
  }

  unban(u: AdminUserDTO): void {
    this.adminService.unbanUser(u.id).subscribe({
      next: () => { this.patchLocal(u.id, { status: 'ACTIVE' }); this.loadStats(); },
      error: () => alert('Unban failed')
    });
  }

  toggleRole(u: AdminUserDTO): void {
    const next: 'USER' | 'ADMIN' = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change role of ${u.email} to ${next}?`)) return;
    this.adminService.updateUserRole(u.id, next).subscribe({
      next: () => { this.patchLocal(u.id, { role: next }); this.loadStats(); },
      error: () => alert('Role update failed')
    });
  }

  resetPassword(u: AdminUserDTO): void {
    if (!confirm(`Send password-reset email to ${u.email}?`)) return;
    this.adminService.forceResetPassword(u.id).subscribe({
      next: () => alert('Password reset email queued.'),
      error: () => alert('Reset failed')
    });
  }

  downloadCsv(): void {
    this.isExporting.set(true);
    this.adminService.exportUsersCsv().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calmskin-users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: () => { this.isExporting.set(false); alert('CSV export failed'); }
    });
  }

  private patchLocal(id: string, patch: Partial<AdminUserDTO>): void {
    this.users.update(list => list.map(u => u.id === id ? { ...u, ...patch } : u));
    if (this.selectedUser()?.id === id) {
      this.selectedUser.update(u => u ? { ...u, ...patch } : u);
    }
  }
}
