import { MatSnackBar } from '@angular/material/snack-bar';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleComponent } from './schedule.component';
import { OutputComponent } from './output.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'scheduling-job-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleComponent, OutputComponent, MatMenuModule, MatButtonModule, MatIconModule],
  template: `
    <section id="scheduling-job-logs" class="view" aria-labelledby="sched-title">
      <div class="flex items-center justify-between mb-4">
        <h1 id="sched-title" class="text-2xl font-bold">Output Settings</h1>
      </div>

      <!-- Sub-tabs -->
      <div class="mb-4">
        <nav class="flex items-center gap-2 overflow-x-auto">
          <button (click)="activateTab('schedule')" [class.font-semibold]="activeTab==='schedule'" [class.border-b-2]="activeTab==='schedule'" class="px-3 py-2 rounded-t-md text-slate-700 hover:bg-slate-50">Schedule</button>
          <button (click)="activateTab('output')" [class.font-semibold]="activeTab==='output'" [class.border-b-2]="activeTab==='output'" class="px-3 py-2 rounded-t-md text-slate-700 hover:bg-slate-50">Output</button>

          <!-- responsive collapse to select on very small screens -->
          <div class="ml-auto md:hidden">
            <select [(ngModel)]="activeTab" class="px-2 py-1 border rounded">
              <option value="schedule">Schedule</option>
              <option value="output">Output</option>
            </select>
          </div>
        </nav>
        <!-- Informational spiel below the tab bar (only on Schedule tab) -->
        <div *ngIf="activeTab==='schedule'" class="pb-4 mt-2" style="font-size:14px; color:#6B7280; text-align:left;">
          Schedule when to send the Extracted output reports. The system automatically delivers processed results at your selected time or trigger the sending on your own.
        </div>
      </div>

      <!-- Jobs Tab -->
      <div *ngIf="activeTab==='jobs'">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div class="flex items-center gap-2">
            <input type="text" placeholder="Search jobs" [(ngModel)]="search" (input)="applyFilters()" class="px-3 py-2 border rounded" />
            <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="px-3 py-2 border rounded">
              <option value="">All statuses</option>
              <option value="Queued">Queued</option>
              <option value="Running">Running</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-sm text-slate-600">Page size</label>
            <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="px-2 py-1 border rounded">
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="20">20</option>
            </select>
            <button (click)="openRunJobDialog()" class="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">Run Job</button>
          </div>
        </div>

        <div class="overflow-x-auto bg-white rounded-xl border border-slate-200">
          <table class="w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="text-left px-4 py-3 cursor-pointer" (click)="sortBy('name')">Job Name <span *ngIf="sortField==='name'">{{ sortDirection==='asc' ? '▲' : '▼' }}</span></th>
                <th class="text-left px-4 py-3 cursor-pointer" (click)="sortBy('start')">Start Date & Time <span *ngIf="sortField==='start'">{{ sortDirection==='asc' ? '▲' : '▼' }}</span></th>
                <th class="text-left px-4 py-3 cursor-pointer" (click)="sortBy('end')">End Date & Time <span *ngIf="sortField==='end'">{{ sortDirection==='asc' ? '▲' : '▼' }}</span></th>
                <th class="text-left px-4 py-3">Status</th>
                <th class="text-left px-4 py-3">Export Logs</th>
                <th class="text-left px-4 py-3">Export Output Report</th>
                <th class="text-left px-4 py-3">Export Job Reports</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let j of paginatedJobs">
                <td class="px-4 py-3">{{ j.name }}</td>
                <td class="px-4 py-3">{{ j.start | date:'short' }}</td>
                <td class="px-4 py-3">{{ j.end ? (j.end | date:'short') : '-' }}</td>
                <td class="px-4 py-3">
                  <span [ngClass]="statusBadgeClass(j.status)" class="px-2 py-1 rounded-full text-xs font-medium">{{ j.status }}</span>
                </td>
                <td class="px-4 py-3">
                  <button (click)="exportLogs(j)" [disabled]="!j.logs || j.logs.length===0" class="px-2 py-1 border rounded bg-white hover:bg-slate-50">
                    CSV
                  </button>
                </td>
                <td class="px-4 py-3">
                  <div>
                    <button mat-button [matMenuTriggerFor]="menu" [disabled]="!j.results || j.results.length===0" title="Download detailed extracted field values." aria-label="Export Output Report">
                      Export Output Report ▾
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="exportReport(j,'csv')" [disabled]="!j.results || j.results.length===0">CSV</button>
                      <button mat-menu-item (click)="exportReport(j,'excel')" [disabled]="!j.results || j.results.length===0">Excel</button>
                      <button mat-menu-item (click)="exportReport(j,'json')" [disabled]="!j.results || j.results.length===0">JSON</button>
                      <button mat-menu-item (click)="exportReport(j,'xaml')" [disabled]="!j.results || j.results.length===0">XAML</button>
                    </mat-menu>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <button (click)="exportJobSummary(j)" class="inline-flex items-center gap-2 px-2 py-1 border rounded bg-white hover:bg-slate-50" title="Download job summary with success and failure stats." aria-label="Export Job Reports">
                    <!-- bar chart icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" d="M4 4v16h16"/>
                      <rect x="7" y="11" width="2.5" height="6" fill="currentColor"/>
                      <rect x="11" y="8" width="2.5" height="9" fill="currentColor"/>
                      <rect x="15" y="5" width="2.5" height="12" fill="currentColor"/>
                    </svg>
                    Summary
                  </button>
                </td>
              </tr>
              <tr *ngIf="paginatedJobs.length===0"><td colspan="7" class="px-4 py-6 text-center text-slate-500">No jobs found.</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-3">
          <div class="text-sm text-slate-600">Showing {{ getJobRangeStart() }} - {{ getJobRangeEnd() }} of {{ filteredJobs.length }}</div>
          <div class="flex items-center gap-2">
            <button (click)="prevJobPage()" [disabled]="jobPage===1" class="px-2 py-1 border rounded">Prev</button>
            <button *ngFor="let p of jobPagesArray" (click)="goToJobPage(p)" [class.font-bold]="p===jobPage" class="px-2 py-1 border rounded">{{ p }}</button>
            <button (click)="nextJobPage()" [disabled]="jobPage===jobTotalPages" class="px-2 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>

      <!-- Schedule Tab -->
      <div *ngIf="activeTab==='schedule'">
        <schedule-view></schedule-view>
      </div>

      <!-- Output Tab -->
      <div *ngIf="activeTab==='output'">
        <output-view></output-view>
      </div>

      <!-- Simple toast / spinner area -->
      <div *ngIf="toastMessage" class="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded shadow">{{ toastMessage }}</div>
      <div *ngIf="busy" class="fixed bottom-4 left-4 bg-white border rounded px-3 py-2 shadow inline-flex items-center gap-2">
        <svg class="w-4 h-4 animate-spin text-slate-600" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="3" stroke="currentColor" fill="none" opacity="0.25"/></svg>
        <span class="text-sm text-slate-700">{{ busyMessage }}</span>
      </div>

      <!-- Run Job Confirmation Modal -->
      <div *ngIf="showRunConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" (click)="!runProcessing && cancelRunJob()"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-5">
          <h3 class="text-lg font-semibold mb-2">Run Job</h3>
          <p class="text-slate-600 mb-4">Are you sure you want to start a new job?</p>
          <div class="flex items-center justify-end gap-2">
            <button class="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50" (click)="cancelRunJob()" [disabled]="runProcessing">Cancel</button>
            <button class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed" (click)="confirmRunJob()" [disabled]="runProcessing">
              <ng-container *ngIf="!runProcessing; else runSpinner">Start Job</ng-container>
              <ng-template #runSpinner>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 50 50" aria-hidden="true">
                  <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="4" stroke-opacity="0.25" fill="none"></circle>
                  <path fill="currentColor" d="M25 5a20 20 0 0 1 20 20h-5a15 15 0 0 0-15-15z">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
                  </path>
                </svg>
                Starting...
              </ng-template>
            </button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class SchedulingJobLogsComponent {
  // Tabs
  activeTab: 'jobs' | 'schedule' | 'output' = 'schedule';

  // Jobs table state
  jobs: any[] = [];
  filteredJobs: any[] = [];
  paginatedJobs: any[] = [];
  search = '';
  statusFilter = '';
  sortField: 'name' | 'start' | 'end' = 'start';
  sortDirection: 'asc' | 'desc' = 'desc';
  pageSize = 10;
  jobPage = 1;
  jobTotalPages = 1;
  jobPagesArray: number[] = [];

  // Export menu control
  exportMenuFor: number | null = null;

  // Toast / busy state
  toastMessage = '';
  busy = false;
  busyMessage = '';

  // Run Job modal state
  showRunConfirm = false;
  runProcessing = false;

  // Inject MatSnackBar optionally (use type any so build won't fail if package not installed yet)
  constructor(private snackBar: MatSnackBar) {
    this.generateSampleJobs();
    this.applyFilters();
  }

  // With Material menus we don't need a manual document click handler to close menus.

  activateTab(t: 'jobs' | 'schedule' | 'output') {
    if (t === 'jobs') {
      // Prevent access to Jobs tab
      this.showToast('Jobs tab is disabled');
      this.activeTab = 'schedule';
      return;
    }
    this.activeTab = t;
  }

  generateSampleJobs() {
    const now = new Date();
    const statuses = ['Queued','Running','Success','Failed'];
    for (let i=1;i<=23;i++) {
      const start = new Date(now.getTime() - i*3600*1000);
      const end = Math.random() > 0.3 ? new Date(start.getTime() + Math.floor(Math.random()*120)*60000) : null;
      const status = statuses[i % statuses.length];
      const logs = Array.from({length: Math.floor(Math.random()*10)}, (_,k)=>`Log line ${k+1} for job ${i}`);
      const results = Math.random() > 0.2 ? [{id:1, value:'result'}] : [];
      this.jobs.push({ id: i, name: `Job ${i}`, start, end, status, logs, results });
    }
  }

  applyFilters() {
    const term = this.search?.toLowerCase().trim();
    this.filteredJobs = this.jobs.filter(j => {
      if (this.statusFilter && j.status !== this.statusFilter) return false;
      if (term && !j.name.toLowerCase().includes(term)) return false;
      return true;
    });

    this.filteredJobs.sort((a,b) => {
      let av: any = a[this.mapSortField(this.sortField)];
      let bv: any = b[this.mapSortField(this.sortField)];
      if (av == null) av = '';
      if (bv == null) bv = '';
      if (av < bv) return this.sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.jobPage = 1;
    this.updateJobPagination();
  }

  mapSortField(f: 'name'|'start'|'end') {
    return f === 'name' ? 'name' : (f === 'start' ? 'start' : 'end');
  }

  sortBy(f: 'name' | 'start' | 'end') {
    if (this.sortField === f) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortField = f; this.sortDirection = 'asc'; }
    this.applyFilters();
  }

  updateJobPagination() {
    this.jobTotalPages = Math.max(1, Math.ceil(this.filteredJobs.length / this.pageSize));
    this.jobPagesArray = Array.from({length: this.jobTotalPages}, (_,i)=>i+1);
    this.goToJobPage(Math.min(this.jobPage, this.jobTotalPages));
  }

  goToJobPage(p: number) {
    this.jobPage = Math.max(1, Math.min(p, this.jobTotalPages));
    const start = (this.jobPage-1)*this.pageSize;
    const end = start + this.pageSize;
    this.paginatedJobs = this.filteredJobs.slice(start,end);
  }

  prevJobPage() { if (this.jobPage>1) this.goToJobPage(this.jobPage-1); }
  nextJobPage() { if (this.jobPage < this.jobTotalPages) this.goToJobPage(this.jobPage+1); }
  onPageSizeChange() { this.updateJobPagination(); }

  getJobRangeStart() { return this.filteredJobs.length ? (this.jobPage-1)*this.pageSize + 1 : 0; }
  getJobRangeEnd() { return Math.min(this.jobPage*this.pageSize, this.filteredJobs.length); }

  statusBadgeClass(status: string) {
    switch (status) {
      case 'Queued': return 'bg-slate-100 text-slate-700';
      case 'Running': return 'bg-blue-100 text-blue-700';
      case 'Success': return 'bg-emerald-100 text-emerald-700';
      case 'Failed': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  // Export logs (per job) as CSV
  exportLogs(job: any) {
    if (!job.logs || job.logs.length===0) return;
    this.busy = true; this.busyMessage = 'Exporting logs...';
    setTimeout(() => {
      const csv = job.logs.map((l:string,i:number)=>`"${l.replace(/"/g,'""')}"`).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `job-${job.id}-logs-${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      this.busy = false; this.busyMessage = '';
      this.showToast('Logs exported successfully');
    }, 600);
  }

  toggleExportMenu(job: any) {
    // kept for compatibility if a non-Material menu is used elsewhere
    this.exportMenuFor = this.exportMenuFor === job.id ? null : job.id;
  }

  // Export report in several formats (client-side stubs)
  exportReport(job: any, fmt: 'csv'|'excel'|'json'|'xaml') {
    if (!job.results || job.results.length===0) return;
    this.exportMenuFor = null;
    this.busy = true; this.busyMessage = 'Exporting report...';
    setTimeout(() => {
      if (fmt === 'json') {
        const blob = new Blob([JSON.stringify(job.results, null, 2)], { type: 'application/json' });
        this.triggerDownload(blob, `job-${job.id}-report-${this.tsStamp()}.json`);
      } else if (fmt === 'csv') {
        // Simple CSV: flatten result keys
        const keys = Object.keys(job.results[0] || {});
        const lines = [keys.join(',')].concat(job.results.map((r:any)=>keys.map(k=>`"${String(r[k]||'').replace(/"/g,'""')}"`).join(',')));
        const blob = new Blob([lines.join('\r\n')], { type: 'text/csv' });
        this.triggerDownload(blob, `job-${job.id}-report-${this.tsStamp()}.csv`);
      } else if (fmt === 'excel') {
        // For simplicity create a CSV but with .xlsx extension — note: real Excel/XLSX requires a library
        const keys = Object.keys(job.results[0] || {});
        const lines = [keys.join(',')].concat(job.results.map((r:any)=>keys.map(k=>`"${String(r[k]||'').replace(/"/g,'""')}"`).join(',')));
        const blob = new Blob([lines.join('\r\n')], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        this.triggerDownload(blob, `job-${job.id}-report-${this.tsStamp()}.xlsx`);
      } else if (fmt === 'xaml') {
        const xml = `<Results>${job.results.map((r:any)=>`<Item>${Object.keys(r).map(k=>`<${k}>${String(r[k]||'')}</${k}>`).join('')}</Item>`).join('')}</Results>`;
        const blob = new Blob([xml], { type: 'application/xml' });
        this.triggerDownload(blob, `job-${job.id}-report-${this.tsStamp()}.xaml`);
      }
      this.busy = false; this.busyMessage = '';
      // use MatSnackBar if available
      try { (this as any).snackBar?.open('Report exported successfully', undefined, { duration: 2500 }); } catch (e) { this.showToast('Report exported successfully'); }
    }, 900);
  }

  triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  tsStamp() { return new Date().toISOString().replace(/[:.]/g,'-'); }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(()=> this.toastMessage = '', 2500);
  }

  // Export Job Summary: basic CSV with success/failed and basic details for this job
  exportJobSummary(job: any) {
    // Example summary: since we don't have per-transaction data in this stub,
    // we’ll include the job metadata and a simple success/failed indicator.
    // In a real app, replace with actual aggregated counts from the backend.
    const summary = {
      jobId: job.id,
      jobName: job.name,
      started: job.start ? new Date(job.start).toISOString() : '',
      ended: job.end ? new Date(job.end).toISOString() : '',
      status: job.status,
      successCount: job.status === 'Success' ? 1 : 0,
      failedCount: job.status === 'Failed' ? 1 : 0
    };
    const headers = ['Job ID','Job Name','Started','Ended','Status','Success Count','Failed Count'];
    const row = [
      summary.jobId,
      this.csvEscape(String(summary.jobName || '')),
      summary.started,
      summary.ended,
      summary.status,
      summary.successCount,
      summary.failedCount
    ];
    const csv = [headers.join(','), row.join(',')].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, `job-${job.id}-summary-${this.tsStamp()}.csv`);
    try { (this as any).snackBar?.open('Job summary exported', undefined, { duration: 2000 }); } catch { this.showToast('Job summary exported'); }
  }

  private csvEscape(val: string) {
    if (/[",\n]/.test(val)) return '"' + val.replace(/"/g, '""') + '"';
    return val;
  }

  // Run Job flows
  openRunJobDialog() {
    this.showRunConfirm = true;
    this.runProcessing = false;
  }

  cancelRunJob() {
    if (this.runProcessing) return;
    this.showRunConfirm = false;
  }

  confirmRunJob() {
    if (this.runProcessing) return;
    this.runProcessing = true;
    // Simulate a short processing delay then add a new job
    setTimeout(() => {
      this.addJobRow();
      this.runProcessing = false;
      this.showRunConfirm = false;
      // Notify success
      try { (this as any).snackBar?.open('Job started successfully', undefined, { duration: 2500 }); } catch (e) { this.showToast('Job started successfully'); }
    }, 900);
  }

  addJobRow() {
    const now = new Date();
    const nextId = this.jobs.length ? Math.max(...this.jobs.map(j => Number(j.id) || 0)) + 1 : 1;
    const newJob = { id: nextId, name: `Job ${nextId}`, start: now, end: null, status: 'Running', logs: [], results: [] };
    this.jobs.unshift(newJob); // add to top
    this.applyFilters();
  }
}
