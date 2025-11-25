import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'summary-page',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  template: `
    <section id="summary" class="view" aria-labelledby="summary-title">
      <div class="flex items-center justify-between mb-4">
        <h1 id="summary-title" class="text-2xl font-bold">Summary</h1>
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

      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div class="rounded-2xl bg-white p-4 text-center">
          <div class="text-sm text-slate-500">Docs Processed</div>
          <div class="text-2xl font-semibold">{{ kpi.docsProcessed | number }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4 text-center">
          <div class="text-sm text-slate-500">Accuracy</div>
          <div class="text-2xl font-semibold">{{ (kpi.accuracy*100) | number:'1.1-1' }}%</div>
        </div>
        <div class="rounded-2xl bg-white p-4 text-center">
          <div class="text-sm text-slate-500">Failures</div>
          <div class="text-2xl font-semibold text-rose-600">{{ kpi.failures }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4 text-center">
          <div class="text-sm text-slate-500">Fail Rate</div>
          <div class="text-2xl font-semibold text-rose-600">{{ (kpi.failRate*100) | number:'1.1-1' }}%</div>
        </div>
        <div class="rounded-2xl bg-white p-4 text-center">
          <div class="text-sm text-slate-500">Avg Handle Time</div>
          <div class="text-2xl font-semibold">{{ kpi.avgHandleTime | number:'1.0-0' }}s</div>
        </div>
        <div class="rounded-2xl bg-white p-4 text-center">
          <div class="text-sm text-slate-500">SLA Breach</div>
          <div class="text-2xl font-semibold text-amber-600">{{ kpi.slaBreach }}</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="rounded-2xl bg-white p-4">
          <h3 class="font-semibold mb-2">Throughput</h3>
          <div class="h-48 border rounded-md p-3">
            <canvas baseChart
              [data]="throughputData"
              [options]="throughputOptions"
              [type]="'line'"
              style="width:100%;height:100%;display:block;"
            ></canvas>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <h3 class="font-semibold mb-2">Document Type Mix</h3>
          <div class="h-48 border rounded-md p-3 flex items-center justify-center">
            <canvas baseChart
              [data]="typeMixData"
              [options]="typeMixOptions"
              [type]="'pie'"
              style="width:220px;height:220px;display:block;"
            ></canvas>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <h3 class="font-semibold mb-2">Project Accuracy</h3>
          <div class="h-48 border rounded-md p-3">
            <canvas baseChart
              [data]="projectAccuracyData"
              [options]="projectAccuracyOptions"
              [type]="'bar'"
              style="width:100%;height:100%;display:block;"
            ></canvas>
          </div>
        </div>
      </div>

      <!-- Avg Handle Time with unit dropdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div class="rounded-2xl bg-white p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold">Average Handle Time</h3>
          </div>
          <div class="h-56 border rounded-md p-3">
            <canvas baseChart
              [data]="ahtData"
              [options]="ahtOptions"
              [type]="'line'"
              style="width:100%;height:100%;display:block;"
            ></canvas>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <h3 class="font-semibold mb-2">Top Projects</h3>
          <div class="overflow-auto">
            <ul class="space-y-2">
              <li *ngFor="let p of topProjects" class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div class="font-medium">{{ p.name }}</div>
                  <div class="text-xs text-slate-500">{{ p.id }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm">{{ p.docs | number }}</div>
                  <div class="text-xs text-slate-500">docs processed</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </section>
  `
})
export class SummaryComponent {
  // demo KPI numbers
  kpi = {
    docsProcessed: 45230,
    accuracy: 0.945,
    failures: 312,
    failRate: 312 / 45230,
    avgHandleTime: 42, // seconds
    slaBreach: 8
  };

  ahtUnit: 's' | 'm' | 'h' = 's';

  // date range filter for the summary page
  dateRange: 'all' | '1d' | '30d' | '60d' | 'custom' = 'all';

  // demo timeseries for throughput / aht
  throughput = [1800, 2100, 1950, 2300, 2450, 1300, 980];
  throughputLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  ahtSeries = [40, 42, 41, 39, 45, 50, 44];

  // demo type mix
  typeMix = [54, 18, 14, 8, 6];
  typeLabels = ['Invoices', 'POs', 'Receipts', 'Waybills', 'Others'];

  // demo project accuracy
  projectAccuracy = [96.4, 94.1, 91.2, 95.3, 92.7];
  projectLabels = ['Invoice DU', 'PO Extractor', 'Receipt Classifier', 'Waybill Parser', 'BOL Validator'];

  // top projects (sorted by docs)
  topProjects = [
    { id: 'PX-001', name: 'Invoice DU', docs: 12840 },
    { id: 'PX-002', name: 'PO Extractor', docs: 8340 },
    { id: 'PX-004', name: 'Waybill Parser', docs: 6880 },
    { id: 'PX-005', name: 'BOL Validator', docs: 3020 },
    { id: 'PX-003', name: 'Receipt Classifier', docs: 2451 }
  ];

  // Chart getters
  public get throughputData(): ChartConfiguration<'line'>['data'] {
    return { labels: this.throughputLabels, datasets: [{ label: 'Docs', data: this.throughput, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)', tension: 0.3 }] };
  }

  public throughputOptions: ChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  public get typeMixData(): ChartConfiguration<'pie'>['data'] {
    return { labels: this.typeLabels, datasets: [{ data: this.typeMix, backgroundColor: ['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'] }] };
  }

  public typeMixOptions: ChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } };

  public get projectAccuracyData(): ChartConfiguration<'bar'>['data'] {
    return { labels: this.projectLabels, datasets: [{ label: 'Accuracy %', data: this.projectAccuracy, backgroundColor: '#10b981' }] };
  }

  public projectAccuracyOptions: ChartOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } };

  public get ahtData(): ChartConfiguration<'line'>['data'] {
    const factor = this.ahtUnit === 's' ? 1 : this.ahtUnit === 'm' ? 1/60 : 1/3600;
    const data = this.ahtSeries.map(v => +(v * factor).toFixed(2));
    return { labels: this.throughputLabels, datasets: [{ label: 'Avg Handle Time', data, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.12)', tension: 0.3 }] };
  }

  public ahtOptions: ChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
}
