import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'error-analysis',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  template: `
    <section id="error-analysis" class="view" aria-labelledby="error-title">
      <div class="flex items-center justify-between mb-4">
        <h1 id="error-title" class="text-2xl font-bold">Error Analysis</h1>
        <div class="flex items-center gap-2">
          <label class="text-sm text-slate-500 mr-2">Range</label>
          <select [(ngModel)]="dateRange" class="px-2 py-1 border rounded">
            <option value="all">All</option>
            <option value="1d">Last 1 day</option>
            <option value="30d">Last 30 days</option>
            <option value="60d">Last 60 days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div class="rounded-2xl bg-white p-4">
          <h3 class="font-semibold mb-2">Error Pareto (80/20)</h3>
          <div class="h-48 border rounded-md p-3">
            <canvas baseChart
              [data]="paretoData"
              [options]="paretoOptions"
              [type]="'bar'"
              style="width:100%;height:100%;display:block;"
            ></canvas>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <h3 class="font-semibold mb-2">Errors by Stage</h3>
          <div class="h-48 border rounded-md p-3">
            <canvas baseChart
              [data]="stageData"
              [options]="stageOptions"
              [type]="'doughnut'"
              style="width:100%;height:100%;display:block;"
            ></canvas>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <h3 class="font-semibold mb-2">Top Error Reasons</h3>
          <ul class="space-y-2">
            <li *ngFor="let r of topReasons" class="flex items-center justify-between p-2 bg-slate-50 rounded">
              <div>
                <div class="font-medium">{{ r.reason }}</div>
                <div class="text-xs text-slate-500">{{ r.count }} errors</div>
              </div>
              <div class="text-sm text-slate-600">{{ r.pct }}%</div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Recent Error Events -->
      <div class="rounded-2xl bg-white p-4">
        <h3 class="font-semibold mb-2">Recent Error Events</h3>
        <div class="overflow-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-slate-500 bg-slate-50 border-b">
              <tr>
                <th class="py-2 px-3">Time</th>
                <th class="py-2 px-3">Project</th>
                <th class="py-2 px-3">Document</th>
                <th class="py-2 px-3">Reason</th>
                <th class="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of pagedEvents" class="odd:bg-white even:bg-slate-50 hover:bg-slate-100">
                <td class="py-2 px-3">{{ e.time }}</td>
                <td class="py-2 px-3">{{ e.project }}</td>
                <td class="py-2 px-3">{{ e.document }}</td>
                <td class="py-2 px-3">{{ e.reason }}</td>
                <td class="py-2 px-3 text-right"><button class="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-white hover:bg-slate-700">Open</button></td>
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
    </section>
  `
})
export class ErrorAnalysisComponent {
  dateRange: 'all' | '1d' | '30d' | '60d' | 'custom' = 'all';
  // Pareto reasons
  reasons = ['Low OCR Quality', 'Missing Field', 'Wrong Mapping', 'Classifier Mismatch', 'Timeout'];
  counts = [220, 140, 80, 60, 30];
  cumPct = (() => {
    const total = 220+140+80+60+30;
    let acc = 0;
    return [220,140,80,60,30].map(v => Math.round(((acc += v)/total)*100));
  })();

  public get paretoData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.reasons,
      datasets: [
        { label: 'Count', data: this.counts, backgroundColor: '#ef4444' },
        { label: 'Cum %', data: this.cumPct, type: 'line' as any, borderColor: '#3b82f6', yAxisID: 'pctAxis' }
      ]
    } as any;
  }

  public paretoOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { pctAxis: { position: 'right' as const, beginAtZero: true, max: 100 } },
    plugins: { legend: { position: 'top' } }
  };

  // Errors by stage
  stageLabels = ['Ingest', 'Classify', 'Extract', 'Validate'];
  stageCounts = [120, 90, 150, 70];

  public get stageData(): ChartConfiguration<'doughnut'>['data'] {
    return { labels: this.stageLabels, datasets: [{ data: this.stageCounts, backgroundColor: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444'] }] };
  }

  public stageOptions: ChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  topReasons = [
    { reason: 'Low OCR Quality', count: 220, pct: 44 },
    { reason: 'Missing Field', count: 140, pct: 28 },
    { reason: 'Wrong Mapping', count: 80, pct: 16 }
  ];

  recentEvents = [
    { time: '2025-10-18 12:05', project: 'Invoice DU', document: 'PO110000.pdf', reason: 'Low OCR Quality' },
    { time: '2025-10-18 11:58', project: 'PO Extractor', document: 'PO1299488.pdf', reason: 'Missing Field' },
    { time: '2025-10-18 11:22', project: 'Receipt Classifier', document: 'POT182209.pdf', reason: 'Classifier Mismatch' },
    { time: '2025-10-18 10:40', project: 'Invoice DU', document: 'PO110001.pdf', reason: 'Timeout' },
    { time: '2025-10-18 09:12', project: 'AP Parser', document: 'AP2025-098.pdf', reason: 'Wrong Mapping' },
    { time: '2025-10-17 18:05', project: 'Receipt Classifier', document: 'POT182210.pdf', reason: 'Low OCR Quality' },
    { time: '2025-10-17 16:30', project: 'PO Extractor', document: 'PO1299490.pdf', reason: 'Missing Field' },
    { time: '2025-10-16 14:21', project: 'Invoice DU', document: 'PO110002.pdf', reason: 'Classifier Mismatch' },
    { time: '2025-10-15 08:03', project: 'AP Parser', document: 'AP2025-097.pdf', reason: 'Timeout' },
    { time: '2025-10-14 07:45', project: 'Inbound', document: 'DOC-555.pdf', reason: 'Wrong Mapping' },
    { time: '2025-10-13 22:10', project: 'Invoice DU', document: 'PO110003.pdf', reason: 'Low OCR Quality' },
    { time: '2025-10-12 11:02', project: 'Receipt Classifier', document: 'POT182211.pdf', reason: 'Missing Field' }
  ];

  // Pagination
  pageSize = 5;
  currentPage = 1;

  get totalItems() { return this.recentEvents.length; }
  get totalPages() { return Math.max(1, Math.ceil(this.totalItems / this.pageSize)); }

  get pagedEvents() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.recentEvents.slice(start, start + this.pageSize);
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
}
