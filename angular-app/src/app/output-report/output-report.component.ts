import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'output-report',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  template: `
    <section id="output-report" class="view" aria-labelledby="outrep-title">
      <div class="flex items-center justify-between mb-4">
        <h1 id="outrep-title" class="text-2xl font-bold">Output Report</h1>
      </div>

      <!-- Export Options -->
      <div class="mb-4 flex items-center gap-3">
        <button class="px-3 py-2 rounded bg-slate-800 text-white hover:bg-slate-700">Export CSV</button>
        <button class="px-3 py-2 rounded bg-slate-800 text-white hover:bg-slate-700">Export JSON</button>
        <button class="px-3 py-2 rounded bg-slate-800 text-white hover:bg-slate-700">Export XLSX</button>
      </div>

      <!-- Report table and confidence chart -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="lg:col-span-2 rounded-2xl bg-white p-4">
          <h3 class="font-semibold mb-2">Documents</h3>
          <div class="mb-3 flex items-center gap-3">
            <input placeholder="Search documents (id, vendor, type, project)" [(ngModel)]="searchTerm" (ngModelChange)="onFilterChange()" class="px-3 py-2 rounded border w-full" />
            <select [(ngModel)]="selectedProject" (ngModelChange)="onFilterChange()" class="px-2 py-2 rounded border">
              <option value="">All Projects</option>
              <option *ngFor="let p of uniqueProjects" [value]="p">{{ p }}</option>
            </select>
            <select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()" class="px-2 py-2 rounded border">
              <option value="">All Statuses</option>
              <option *ngFor="let s of uniqueStatuses" [value]="s">{{ s }}</option>
            </select>
          </div>
          <div class="overflow-auto">
            <table class="w-full text-sm">
              <thead class="text-left text-slate-500 bg-slate-50 border-b">
                <tr>
                  <th class="py-2 px-3">Doc ID</th>
                  <th class="py-2 px-3">Project</th>
                  <th class="py-2 px-3">Type</th>
                  <th class="py-2 px-3">Vendor</th>
                  <th class="py-2 px-3">Date</th>
                  <th class="py-2 px-3">Amount</th>
                  <th class="py-2 px-3">Currency</th>
                  <th class="py-2 px-3">Status</th>
                  <th class="py-2 px-3">Confidence</th>
                  <th class="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of pagedDocuments" class="odd:bg-white even:bg-slate-50 hover:bg-slate-100">
                  <td class="py-2 px-3">{{ d.id }}</td>
                  <td class="py-2 px-3">{{ d.project }}</td>
                  <td class="py-2 px-3">{{ d.type }}</td>
                  <td class="py-2 px-3">{{ d.vendor }}</td>
                  <td class="py-2 px-3">{{ d.date }}</td>
                  <td class="py-2 px-3">{{ d.amount | number:'1.2-2' }}</td>
                  <td class="py-2 px-3">{{ d.currency }}</td>
                  <td class="py-2 px-3">{{ d.status }}</td>
                  <td class="py-2 px-3">{{ (d.confidence*100) | number:'1.0-0' }}%</td>
                  <td class="py-2 px-3 text-right"><button class="px-2 py-1 rounded bg-slate-800 text-white">Open</button></td>
                </tr>
              </tbody>
            </table>
          </div>
            <div class="flex items-center justify-between mt-3">
            <div class="flex items-center gap-2 text-sm">
              <label>Rows per page</label>
              <select [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange($event)" class="px-2 py-1 border rounded">
                <option [value]="5">5</option>
                <option [value]="10">10</option>
                <option [value]="20">20</option>
              </select>
              <span class="text-slate-500">{{ totalItems }} items</span>
            </div>

            <div class="flex items-center gap-2">
              <button class="px-2 py-1 rounded border" (click)="prevPage()" [disabled]="currentPage === 1">Prev</button>
              <ng-container *ngFor="let p of pages">
                <button class="px-2 py-1 rounded" [ngClass]="p === currentPage ? 'bg-slate-800 text-white' : 'border'" (click)="goToPage(p)">{{ p }}</button>
              </ng-container>
              <button class="px-2 py-1 rounded border" (click)="nextPage()" [disabled]="currentPage === totalPages">Next</button>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <h3 class="font-semibold mb-2">Confidence Distribution</h3>
          <div class="h-64 border rounded-md p-3 flex items-center">
            <canvas baseChart
              [data]="confidenceData"
              [options]="confidenceOptions"
              [type]="'bar'"
              style="width:100%;height:100%;display:block;"
            ></canvas>
          </div>

          <!-- small analytics -->
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <div class="text-slate-500">Total Docs</div>
              <div class="font-medium">{{ documents.length }}</div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <div class="text-slate-500">Avg Confidence</div>
              <div class="font-medium">{{ avgConfidence | number:'1.0-0' }}%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class OutputReportComponent {
  documents = [
    { id: 'DOC-110', project: 'Invoice DU', type: 'Invoice', vendor: 'ACME Inc.', date: '2025-10-17', amount: 1240.5, currency: 'USD', status: 'Processed', confidence: 0.96 },
    { id: 'DOC-129', project: 'PO Extractor', type: 'PO', vendor: 'Supplier Co', date: '2025-10-16', amount: 420.0, currency: 'USD', status: 'Processed', confidence: 0.88 },
    { id: 'DOC-182', project: 'Receipt Classifier', type: 'Receipt', vendor: 'Cafe Ltd', date: '2025-10-15', amount: 18.75, currency: 'USD', status: 'Failed', confidence: 0.42 },
    { id: 'DOC-183', project: 'Invoice DU', type: 'Invoice', vendor: 'Widgets Ltd', date: '2025-10-14', amount: 560.0, currency: 'USD', status: 'Processed', confidence: 0.92 },
    { id: 'DOC-184', project: 'PO Extractor', type: 'PO', vendor: 'SupplyCo', date: '2025-10-13', amount: 2300.0, currency: 'USD', status: 'Processed', confidence: 0.98 },
    { id: 'DOC-185', project: 'AP Parser', type: 'Invoice', vendor: 'ACME Inc.', date: '2025-10-12', amount: 150.0, currency: 'USD', status: 'Processed', confidence: 0.85 },
    { id: 'DOC-186', project: 'Receipt Classifier', type: 'Receipt', vendor: 'Cafe Ltd', date: '2025-10-11', amount: 12.5, currency: 'USD', status: 'Processed', confidence: 0.76 },
    { id: 'DOC-187', project: 'Inbound', type: 'Invoice', vendor: 'BigCo', date: '2025-10-10', amount: 9800.0, currency: 'USD', status: 'Failed', confidence: 0.34 },
    { id: 'DOC-188', project: 'Invoice DU', type: 'Invoice', vendor: 'ACME Inc.', date: '2025-10-09', amount: 430.0, currency: 'USD', status: 'Processed', confidence: 0.91 },
    { id: 'DOC-189', project: 'AP Parser', type: 'Invoice', vendor: 'SmallCo', date: '2025-10-08', amount: 65.0, currency: 'USD', status: 'Processed', confidence: 0.79 },
    { id: 'DOC-190', project: 'PO Extractor', type: 'PO', vendor: 'SupplyCo', date: '2025-10-07', amount: 1450.0, currency: 'USD', status: 'Processed', confidence: 0.86 },
    { id: 'DOC-191', project: 'Receipt Classifier', type: 'Receipt', vendor: 'Cafe Ltd', date: '2025-10-06', amount: 9.5, currency: 'USD', status: 'Processed', confidence: 0.74 }
  ];

  // Pagination for documents table
  pageSize = 5;
  currentPage = 1;
  // Filters
  searchTerm = '';
  selectedProject = '';
  selectedStatus = '';

  get filteredDocuments() {
    const term = this.searchTerm.trim().toLowerCase();
    return this.documents.filter(d => {
      if (this.selectedProject && d.project !== this.selectedProject) return false;
      if (this.selectedStatus && d.status !== this.selectedStatus) return false;
      if (!term) return true;
      return [d.id, d.vendor, d.type, d.project].join(' ').toLowerCase().includes(term);
    });
  }

  get totalItems() { return this.filteredDocuments.length; }
  get totalPages() { return Math.max(1, Math.ceil(this.totalItems / this.pageSize)); }

  get pagedDocuments() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDocuments.slice(start, start + this.pageSize);
  }

  get pages() {
    const arr = [] as number[];
    for (let i = 1; i <= this.totalPages; i++) arr.push(i);
    return arr;
  }

  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  goToPage(n: number) { if (n >= 1 && n <= this.totalPages) this.currentPage = n; }
  onPageSizeChange(v: number) { this.pageSize = +v; this.currentPage = 1; }

  get uniqueProjects() {
    const set = new Set(this.documents.map(d => d.project));
    return Array.from(set);
  }

  get uniqueStatuses() {
    const set = new Set(this.documents.map(d => d.status));
    return Array.from(set);
  }

  onFilterChange() { this.currentPage = 1; }

  confidenceBuckets = [0.0, 0.25, 0.5, 0.75, 1.0];

  public get confidenceData(): ChartConfiguration<'bar'>['data'] {
    const counts = [0,0,0,0];
    for (const d of this.documents) {
      const idx = Math.max(0, Math.min(3, Math.floor(d.confidence*4)));
      counts[idx]++;
    }
    return { labels: ['0-25%','25-50%','50-75%','75-100%'], datasets: [{ label: 'Documents', data: counts, backgroundColor: '#3b82f6' }] };
  }

  public confidenceOptions: ChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  public get avgConfidence(): number {
    if (!this.documents.length) return 0;
    const avg = this.documents.reduce((s,d) => s + d.confidence, 0) / this.documents.length;
    return Math.round(avg * 100);
  }
}
