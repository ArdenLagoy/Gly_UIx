import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'new-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="new-upload" class="view" aria-labelledby="new-upload-title" aria-describedby="new-upload-tooltip" title="Uploads and processes all supported files found in the specified folder.">
      <div class="flex items-center justify-between mb-4">
        <h1 id="new-upload-title" class="text-2xl font-bold">New Upload</h1>
      </div>
      <span id="new-upload-tooltip" class="sr-only">Uploads and processes all supported files found in the specified folder.</span>

      <!-- Drop zone (styled to match site theme) -->
      <div
        id="new-upload-dropzone"
        role="region"
        aria-label="Drop files or folders here"
        class="rounded-2xl bg-white border border-slate-200 p-6 text-center mb-4 cursor-pointer hover:bg-slate-50"
        (dragover)="$event.preventDefault(); onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <div class="flex flex-col items-center gap-2">
          <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v8m0 0l3-3m-3 3l-3-3M4 20h16"></path></svg>
          <p class="text-lg font-medium text-slate-700">Drop files / folders here</p>
          <p class="text-sm text-slate-500">or <label for="fileInput" class="underline cursor-pointer">browse</label> to select files</p>
          <input id="fileInput" type="file" class="hidden" (change)="onFileInputChange($event)" multiple webkitdirectory directory />
        </div>
      </div>

      <!-- Label field -->
      <div class="mb-4">
        <div class="flex items-center gap-2 mb-1">
          <label for="upload-label" class="text-sm font-medium text-slate-700">Upload Folder</label>
          <!-- info icon (accessible) -->
          <button type="button" class="text-slate-400 hover:text-slate-600 p-1 rounded" aria-describedby="new-upload-tooltip" title="Uploads and processes all supported files found in the specified folder.">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </button>
        </div>
        <input id="upload-label" class="w-full border rounded-xl px-3 py-2 bg-white border-slate-200" [(ngModel)]="label" placeholder="Enter a label for this upload" />
      </div>

      <!-- Selected files list -->
      <div *ngIf="files.length > 0" class="mb-4">
        <h2 class="text-sm font-medium mb-2">Files to upload</h2>
        <ul class="list-disc pl-5 space-y-1 text-sm text-slate-700">
          <li *ngFor="let f of files; let i = index" class="flex items-center justify-between">
            <span class="truncate">{{ f.name }}</span>
            <button class="ml-4 text-sm text-red-600" (click)="removeFile(i)" aria-label="Remove {{f.name}}">Remove</button>
          </li>
        </ul>
      </div>

      <div *ngIf="files.length === 0" class="mb-4">
        <button id="upload-button" (click)="triggerFileBrowse()" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
          <!-- upload icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v12m0 0l-4-4m4 4l4-4M21 21H3"/></svg>
          Upload
        </button>
      </div>
    
      <!-- Queue Monitor (spaced below upload area) -->
      <div class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">Queue Monitor</h2>
          <div class="flex items-center gap-3">
            <button (click)="onRefreshClick()" [disabled]="refreshing" class="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed" title="Refresh" [attr.aria-label]="refreshing ? 'Refreshing' : 'Refresh'">
              <ng-container *ngIf="refreshing; else idleRefreshIcon">
                <!-- Spinner only while refreshing -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" viewBox="0 0 50 50" aria-hidden="true">
                  <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="4" stroke-opacity="0.25" fill="none"></circle>
                  <path fill="currentColor" d="M25 5a20 20 0 0 1 20 20h-5a15 15 0 0 0-15-15z">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
                  </path>
                </svg>
              </ng-container>
              <ng-template #idleRefreshIcon>
                <!-- Static refresh icon when idle (matching queue-all) -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 12a8 8 0 10-2.6 5.6"></path>
                  <path d="M20 8v4h-4"></path>
                </svg>
              </ng-template>
            </button>
            <label for="autoSwitch" class="flex items-center gap-2 cursor-pointer">
              <div class="relative">
                <input id="autoSwitch" type="checkbox" class="sr-only peer" [(ngModel)]="autoRefresh" (change)="onAutoRefreshToggle()" />
                <div class="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-indigo-600 transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
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
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto bg-white rounded-xl border border-slate-200">
          <table class="w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="text-left px-4 py-3 cursor-pointer" (click)="sortBy('filename')">Filename <span *ngIf="sortField==='filename'">{{ sortDirection==='asc' ? '▲' : '▼' }}</span></th>
                <th class="text-left px-4 py-3 cursor-pointer" (click)="sortBy('dateUploaded')">Date Uploaded <span *ngIf="sortField==='dateUploaded'">{{ sortDirection==='asc' ? '▲' : '▼' }}</span></th>
                <th class="text-left px-4 py-3 cursor-pointer" (click)="sortBy('status')">Status <span *ngIf="sortField==='status'">{{ sortDirection==='asc' ? '▲' : '▼' }}</span></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let it of paginatedItems">
                <td class="px-4 py-3">
                  <button 
                    (click)="openFileDetails(it.filename)" 
                    class="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer font-medium">
                    {{ it.filename }}
                  </button>
                </td>
                <td class="px-4 py-3">{{ it.dateUploaded | date:'short' }}</td>
                <td class="px-4 py-3">
                  <span [ngClass]="statusBadgeClass(it.status)" class="px-2 py-1 rounded-full text-xs font-medium">{{ it.status }}</span>
                </td>
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
export class NewUploadComponent implements OnInit, OnDestroy {
  files: File[] = [];
  label = '';
  // Queue monitor state
  items: { filename: string; dateUploaded: Date; status: string }[] = [];
  filteredItems: { filename: string; dateUploaded: Date; status: string }[] = [];
  paginatedItems: { filename: string; dateUploaded: Date; status: string }[] = [];
  searchTerm = '';
  statusFilter = '';
  dateFrom: string | null = null;
  dateTo: string | null = null;
  cardFilter: string | null = null;
  counts = { success: 0, failed: 0, queued: 0, inProgress: 0 };
  autoRefresh = false;
  refreshIntervalMs = 10000; // 10 seconds (can be 10000-15000 as requested)
  private _intervalId: any = null;
  // sorting & pagination
  sortField: 'filename' | 'dateUploaded' | 'status' = 'dateUploaded';
  sortDirection: 'asc' | 'desc' = 'desc';
  // pagination
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  pagesArray: number[] = [];
  dateRange: 'all' | 'last1' | 'last30' | 'last60' | 'custom' = 'all';
  // Refresh button state
  refreshing = false;
  private _refreshTimer: any = null;
  private _refreshMinDurationMs = 600; // keep spinner visible briefly for UX

  onDragOver(event: DragEvent) {
    event.preventDefault();
    const el = event.currentTarget as HTMLElement;
    if (el) el.classList.add('border-slate-500', 'bg-slate-50');
  }

  onDragLeave(event: DragEvent) {
    const el = event.currentTarget as HTMLElement;
    if (el) el.classList.remove('border-slate-500', 'bg-slate-50');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const el = event.currentTarget as HTMLElement;
    if (el) el.classList.remove('border-slate-500', 'bg-slate-50');

    const dt = event.dataTransfer;
    if (!dt) return;

    const items = dt.files;
    this.addFiles(items);
  }

  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files) return;
    this.addFiles(input.files);
    // reset input so the same file can be selected again if needed
    input.value = '';
  }

  addFiles(fileList: FileList) {
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList.item(i);
      if (f) this.files.push(f);
    }
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
  }

  ngOnInit(): void {
    this.generateSampleData();
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.clearAutoRefresh();
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  // Sample data generator (replace with API call)
  generateSampleData() {
    const statuses = ['Success', 'Failed', 'Queued', 'In Progress'];
    const now = new Date();
    this.items = [];
    for (let i = 1; i <= 20; i++) {
      const status = statuses[i % statuses.length];
      const date = new Date(now.getTime() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000 - i * 3600 * 1000);
      this.items.push({ filename: `document_${i}.pdf`, dateUploaded: date, status });
    }
  }

  manualRefresh() {
    // In a real app, call the API here. We'll regenerate sample data to simulate refresh.
    this.generateSampleData();
    this.applyFilters();
  }

  onRefreshClick() {
    if (this.refreshing) return;
    this.refreshing = true;
    const start = Date.now();

    // Run the refresh logic
    this.manualRefresh();

    // Ensure spinner shows at least the minimum duration
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, this._refreshMinDurationMs - elapsed);
    this._refreshTimer = setTimeout(() => {
      this.refreshing = false;
    }, remaining);
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

  triggerFileBrowse() {
    const inp = document.getElementById('fileInput') as HTMLInputElement | null;
    if (inp) inp.click();
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
        // include whole day for to
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (it.dateUploaded > end) return false;
      }
      return true;
    });

    // counts reflect the current filtered set (per requirement)
    this.counts = {
      success: this.filteredItems.filter(i => i.status === 'Success').length,
      failed: this.filteredItems.filter(i => i.status === 'Failed').length,
      queued: this.filteredItems.filter(i => i.status === 'Queued').length,
      inProgress: this.filteredItems.filter(i => i.status === 'In Progress').length,
    };

    // apply sorting
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

    // pagination
    this.currentPage = 1; // reset to first page on filter change
    this.updatePagination();
  }

  onFilterChange() {
    // apply dateRange quick selections
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
