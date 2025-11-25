import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'queue-all',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="queue-all" class="view p-0" aria-labelledby="queue-title">
      <div class="flex items-center justify-between mb-4">
        <h1 id="queue-title" class="text-2xl font-bold">Queue - All Items</h1>
      </div>

      <div class="mt-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">Queue Monitor</h2>
          <div class="flex items-center gap-3">
            <button (click)="onRefreshClick()" [disabled]="isRefreshing" class="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed" title="Refresh" [attr.aria-label]="isRefreshing ? 'Refreshing' : 'Refresh'">
              <ng-container *ngIf="isRefreshing; else idleRefreshIcon">
                <!-- Spinner only while refreshing (matches new-upload) -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" viewBox="0 0 50 50" aria-hidden="true">
                  <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="4" stroke-opacity="0.25" fill="none"></circle>
                  <path fill="currentColor" d="M25 5a20 20 0 0 1 20 20h-5a15 15 0 0 0-15-15z">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
                  </path>
                </svg>
              </ng-container>
              <ng-template #idleRefreshIcon>
                <!-- Static refresh icon when idle (matching current design) -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 12a8 8 0 10-2.6 5.6"></path>
                  <path d="M20 8v4h-4"></path>
                </svg>
              </ng-template>
            </button>
            <label for="autoSwitchQueueAll" class="flex items-center gap-2 cursor-pointer">
              <div class="relative">
                <input id="autoSwitchQueueAll" type="checkbox" class="sr-only peer" [(ngModel)]="autoRefresh" (change)="onAutoRefreshToggle()" />
                <div class="w-11 h-6 bg-slate-200 rounded-full transition-colors peer-checked:bg-indigo-600"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span class="text-sm text-slate-700">Auto-refresh</span>
            </label>
          </div>
        </div>

        <!-- Summary cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div role="button" tabindex="0" (click)="setCardFilter('Success')" [class.border-indigo-600]="cardFilter==='Success'" class="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm cursor-pointer flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-500">Success</div>
              <div class="text-2xl font-bold text-emerald-600">{{ counts.success }}</div>
            </div>
          </div>

          <div role="button" tabindex="0" (click)="setCardFilter('Failed')" class="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm cursor-pointer flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-500">Failed</div>
              <div class="text-2xl font-bold text-rose-600">{{ counts.failed }}</div>
            </div>
          </div>

          <div role="button" tabindex="0" (click)="setCardFilter('Queued')" class="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm cursor-pointer flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-500">Queued</div>
              <div class="text-2xl font-bold text-amber-500">{{ counts.queued }}</div>
            </div>
          </div>

          <div role="button" tabindex="0" (click)="setCardFilter('In Progress')" class="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm cursor-pointer flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-500">In Progress</div>
              <div class="text-2xl font-bold text-sky-600">{{ counts.inProgress }}</div>
            </div>
          </div>
        </div>

        <!-- Filters / Search -->
        <div class="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
          <div class="flex-1 mb-2 md:mb-0">
            <input type="text" placeholder="Search by filename" [(ngModel)]="searchTerm" (input)="onFilterChange()" class="w-full px-3 py-2 border rounded-xl border-slate-200" />
          </div>
          <div class="flex gap-2 items-center">
            <select [(ngModel)]="statusFilter" (change)="onFilterChange()" class="px-3 py-2 border rounded-xl border-slate-200">
              <option value="">All statuses</option>
              <option>Success</option>
              <option>Failed</option>
              <option>Queued</option>
              <option>In Progress</option>
            </select>

            <select [(ngModel)]="dateRange" (change)="onDateRangeChange()" class="px-3 py-2 border rounded-xl border-slate-200">
              <option value="all">All</option>
              <option value="last1">Last 1 day</option>
              <option value="last30">Last 30 days</option>
              <option value="last60">Last 60 days</option>
              <option value="custom">Custom range</option>
            </select>

            <div *ngIf="dateRange === 'custom'" class="flex gap-2">
              <input type="date" [(ngModel)]="dateFrom" (change)="onFilterChange()" class="px-3 py-2 border rounded-xl border-slate-200" />
              <input type="date" [(ngModel)]="dateTo" (change)="onFilterChange()" class="px-3 py-2 border rounded-xl border-slate-200" />
            </div>
            
            <!-- Export CSV button aligned with date filters -->
            <div class="ml-2">
              <button (click)="exportCsv()" class="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50">
                <!-- simple download icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v12m0 0l-4-4m4 4l4-4M21 21H3"/></svg>
                Export
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto bg-white rounded-xl border border-slate-200">
          <table class="w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="text-left px-4 py-3 cursor-pointer" (click)="sortBy('filename')">Filename <span *ngIf="sortField==='filename'">{{ sortDirection==='asc' ? '▲' : '▼' }}</span></th>
                <th class="text-left px-4 py-3 cursor-pointer" (click)="sortBy('dateUploaded')">Date Uploaded <span *ngIf="sortField==='dateUploaded'">{{ sortDirection==='asc' ? '▲' : '▼' }}</span></th>
                <th class="text-left px-4 py-3">Uploaded by</th>
                <th class="text-left px-4 py-3">Queued time</th>
                <th class="text-left px-4 py-3">Processing start time</th>
                <th class="text-left px-4 py-3">Completed on</th>
                <th class="text-left px-4 py-3 cursor-pointer" (click)="sortBy('status')">Status <span *ngIf="sortField==='status'">{{ sortDirection==='asc' ? '▲' : '▼' }}</span></th>
                <th class="text-left px-4 py-3">Exception</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let it of paginatedItems">
                <td class="px-4 py-3">
                  <ng-container *ngIf="it.status === 'Success' || it.status === 'Failed'; else nonClickableFilename">
                    <button
                      (click)="openFileDetails(it.filename)"
                      class="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer font-medium"
                      aria-label="Open file details for {{ it.filename }}">
                      {{ it.filename }}
                    </button>
                  </ng-container>
                  <ng-template #nonClickableFilename>
                    <span class="text-slate-500">{{ it.filename }}</span>
                  </ng-template>
                </td>
                <td class="px-4 py-3">{{ it.dateUploaded | date:'short' }}</td>
                <td class="px-4 py-3">{{ it.uploadedBy }}</td>
                <td class="px-4 py-3">{{ it.queuedTime | date:'short' }}</td>
                <td class="px-4 py-3">{{ it.processingStartTime ? (it.processingStartTime | date:'short') : '-' }}</td>
                <td class="px-4 py-3">{{ it.completedOn ? (it.completedOn | date:'short') : '-' }}</td>
                <td class="px-4 py-3">
                  <span [ngClass]="statusBadgeClass(it.status)" class="px-2 py-1 rounded-full text-xs font-medium">{{ it.status }}</span>
                </td>
                <td class="px-4 py-3">{{ it.status==='Failed' ? it.exception : '' }}</td>
              </tr>
              <tr *ngIf="paginatedItems.length === 0">
                <td colspan="3" class="px-4 py-6 text-center text-slate-500">No items match the filters.</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination controls -->
        <div class="flex items-center justify-between mt-3">
          <div class="text-sm text-slate-600">Showing {{ getRangeStart() }} - {{ getRangeEnd() }} of {{ filteredItems.length }}</div>
          <div class="flex items-center gap-2">
            <label class="text-sm">Page size</label>
            <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="px-2 py-1 border rounded">
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="20">20</option>
            </select>
            <button (click)="prevPage()" [disabled]="currentPage===1" class="px-2 py-1 border rounded">Prev</button>
            <button *ngFor="let p of pagesArray" (click)="goToPage(p)" [class.font-bold]="p===currentPage" class="px-2 py-1 border rounded">{{ p }}</button>
            <button (click)="nextPage()" [disabled]="currentPage===totalPages" class="px-2 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class QueueAllComponent {
  // Queue monitor state
  // Define a reusable type for items
  
  // Note: kept inside the class to limit scope to this component file
  // but declared as a type alias variable for TypeScript inference
  // (alternatively could be top-level). Using a simple inline interface below.
  
  items: { filename: string; dateUploaded: Date; status: string; uploadedBy: string; queuedTime: Date; processingStartTime: Date | null; completedOn: Date | null; exception?: string }[] = [];
  filteredItems: { filename: string; dateUploaded: Date; status: string; uploadedBy: string; queuedTime: Date; processingStartTime: Date | null; completedOn: Date | null; exception?: string }[] = [];
  paginatedItems: { filename: string; dateUploaded: Date; status: string; uploadedBy: string; queuedTime: Date; processingStartTime: Date | null; completedOn: Date | null; exception?: string }[] = [];
  searchTerm = '';
  statusFilter = '';
  dateFrom: string | null = null;
  dateTo: string | null = null;
  cardFilter: string | null = null;
  counts = { success: 0, failed: 0, queued: 0, inProgress: 0 };
  autoRefresh = false;
  refreshIntervalMs = 10000;
  private _intervalId: any = null;
  isRefreshing = false;
  sortField: 'filename' | 'dateUploaded' | 'status' = 'dateUploaded';
  sortDirection: 'asc' | 'desc' = 'desc';
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  pagesArray: number[] = [];
  dateRange: 'all' | 'last1' | 'last30' | 'last60' | 'custom' = 'all';
  private _refreshTimer: any = null;
  private _refreshMinDurationMs = 600;

  constructor() {
    this.generateSampleData();
    this.applyFilters();
  }

  // Sample data generator (replace with API call)
  generateSampleData() {
    const statuses = ['Success', 'Failed', 'Queued', 'In Progress'];
    const now = new Date();
    this.items = [];
    const users = ['alice.s', 'bob.k', 'carol.m', 'dave.t'];
    for (let i = 1; i <= 20; i++) {
      const status = statuses[i % statuses.length];
      const date = new Date(now.getTime() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000 - i * 3600 * 1000);
      const queuedTime = new Date(date.getTime() - Math.floor(Math.random() * 60) * 60000); // queued before uploaded date
      const processingStartTime = status === 'Queued' ? null : new Date(queuedTime.getTime() + Math.floor(Math.random() * 30) * 60000);
      const completedOn = (status === 'Success' || status === 'Failed') ? new Date(processingStartTime ? processingStartTime.getTime() + Math.floor(Math.random() * 120) * 60000 : date.getTime()) : null;
      const exception = status === 'Failed' ? `BotError: simulated failure for document_${i}` : undefined;
      const uploadedBy = users[i % users.length];
      this.items.push({ filename: `document_${i}.pdf`, dateUploaded: date, status, uploadedBy, queuedTime, processingStartTime, completedOn, exception });
    }
  }

  async manualRefresh() {
    // Pure refresh: used by auto-refresh and by the click wrapper. No spinner handling here.
    await new Promise(resolve => setTimeout(resolve, 700));
    this.generateSampleData();
    this.applyFilters();
  }

  async onRefreshClick() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    const start = Date.now();
    try {
      await this.manualRefresh();
    } finally {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, this._refreshMinDurationMs - elapsed);
      if (this._refreshTimer) clearTimeout(this._refreshTimer);
      this._refreshTimer = setTimeout(() => {
        this.isRefreshing = false;
        this._refreshTimer = null;
      }, remaining);
    }
  }

  onAutoRefreshToggle() {
    if (this.autoRefresh) {
      this._intervalId = setInterval(() => this.manualRefresh(), this.refreshIntervalMs);
    } else {
      this.clearAutoRefresh();
    }
  }

  clearAutoRefresh() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  setCardFilter(status: string) {
    if (this.cardFilter === status) {
      this.cardFilter = null;
    } else {
      this.cardFilter = status;
    }
    this.applyFilters();
  }

  applyFilters() {
    const term = this.searchTerm?.toLowerCase().trim();
    const from = this.dateFrom ? new Date(this.dateFrom) : null;
    const to = this.dateTo ? new Date(this.dateTo) : null;

    this.filteredItems = this.items.filter(it => {
      if (this.cardFilter && it.status !== this.cardFilter) return false;
      if (this.statusFilter && this.statusFilter !== '' && it.status !== this.statusFilter) return false;
      if (term && !it.filename.toLowerCase().includes(term)) return false;
      if (from && it.dateUploaded < from) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (it.dateUploaded > end) return false;
      }
      return true;
    });

    this.counts = {
      success: this.filteredItems.filter(i => i.status === 'Success').length,
      failed: this.filteredItems.filter(i => i.status === 'Failed').length,
      queued: this.filteredItems.filter(i => i.status === 'Queued').length,
      inProgress: this.filteredItems.filter(i => i.status === 'In Progress').length,
    };

    this.filteredItems.sort((a, b) => {
      let av: any = a[this.sortField];
      let bv: any = b[this.sortField];
      if (this.sortField === 'dateUploaded') {
        av = a.dateUploaded.getTime();
        bv = b.dateUploaded.getTime();
      } else {
        av = (av || '').toString().toLowerCase();
        bv = (bv || '').toString().toLowerCase();
      }
      if (av < bv) return this.sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  onFilterChange() {
    if (this.dateRange !== 'custom') {
      this.applyDateRangeShortcut();
    }
    this.applyFilters();
  }

  onDateRangeChange() {
    if (this.dateRange !== 'custom') {
      this.applyDateRangeShortcut();
      this.applyFilters();
    }
  }

  applyDateRangeShortcut() {
    const now = new Date();
    switch (this.dateRange) {
      case 'last1':
        this.dateFrom = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        this.dateTo = null;
        break;
      case 'last30':
        this.dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        this.dateTo = null;
        break;
      case 'last60':
        this.dateFrom = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        this.dateTo = null;
        break;
      case 'all':
        this.dateFrom = null;
        this.dateTo = null;
        break;
    }
  }

  sortBy(field: 'filename' | 'dateUploaded' | 'status') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.goToPage(Math.min(this.currentPage, this.totalPages));
  }

  goToPage(page: number) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedItems = this.filteredItems.slice(start, end);
  }

  prevPage() {
    if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1);
  }

  onPageSizeChange() {
    this.updatePagination();
  }

  getRangeStart() {
    return this.filteredItems.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  getRangeEnd() {
    return Math.min(this.currentPage * this.pageSize, this.filteredItems.length);
  }

  statusBadgeClass(status: string) {
    switch (status) {
      case 'Success':
        return 'bg-emerald-100 text-emerald-700';
      case 'Failed':
        return 'bg-rose-100 text-rose-700';
      case 'Queued':
        return 'bg-amber-100 text-amber-700';
      case 'In Progress':
        return 'bg-sky-100 text-sky-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  // Export current paginated view to CSV (respects filters/sorting/pagination)
  exportCsv() {
    const rows = this.paginatedItems.map(it => ({
      filename: it.filename,
      dateUploaded: it.dateUploaded ? it.dateUploaded.toISOString() : '',
      uploadedBy: it.uploadedBy || '',
      queuedTime: it.queuedTime ? it.queuedTime.toISOString() : '',
      processingStartTime: it.processingStartTime ? it.processingStartTime.toISOString() : '',
      completedOn: it.completedOn ? it.completedOn.toISOString() : '',
      status: it.status,
      exception: it.status === 'Failed' && it.exception ? it.exception : ''
    }));

    const headers = ['Filename','Date Uploaded','Uploaded by','Queued time','Processing start time','Completed on','Status','Exception'];

    function escapeCsv(val: string) {
      if (val == null) return '';
      const s = String(val);
      if (/[",\n]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }

  // Simpler row generation to avoid relying on header-to-key matching issues
    const csvLines = [headers.join(',')];
    for (const r of rows) {
      const line = [
        escapeCsv(r.filename),
        escapeCsv(r.dateUploaded),
        escapeCsv(r.uploadedBy),
        escapeCsv(r.queuedTime),
        escapeCsv(r.processingStartTime),
        escapeCsv(r.completedOn),
        escapeCsv(r.status),
        escapeCsv(r.exception)
      ].join(',');
      csvLines.push(line);
    }
    const finalCsv = csvLines.join('\r\n');

    const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g,'-');
    a.download = `queue-export-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  openFileDetails(filename: string) {
    // Store the selected filename for the file details component
    localStorage.setItem('selectedFilename', filename);
    
    // Hide all views and show the file details view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const fileDetailsView = document.getElementById('file-details');
    if (fileDetailsView) {
      fileDetailsView.classList.add('active');
    }
    
    // Update sidebar navigation highlight
    document.querySelectorAll('.nav-view').forEach(n => n.classList.remove('bg-indigo-600','text-white','font-medium'));
    // Note: file-details doesn't have a nav item, so we don't highlight anything
  }
}
