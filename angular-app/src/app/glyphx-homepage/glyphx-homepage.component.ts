import { Component, AfterViewInit, AfterViewChecked, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassificationOverviewComponent } from '../classification-overview/classification-overview.component';
import { NewUploadComponent } from '../new-upload/new-upload.component';
import { ExtractionOverviewComponent } from '../extraction-overview/extraction-overview.component';
import { QueueAllComponent } from '../queue-all/queue-all.component';
import { SchedulingJobLogsComponent } from '../scheduling-job-logs/scheduling-job-logs.component';
import { OutputSettingsFormatsComponent } from '../output-settings-formats/output-settings-formats.component';
import { OutputSettingsConnectorsComponent } from '../output-settings-connectors/output-settings-connectors.component';
import { ReportingAnalysisComponent } from '../reporting-analysis/reporting-analysis.component';
import { SummaryComponent } from '../summary/summary.component';
import { ErrorAnalysisComponent } from '../error-analysis/error-analysis.component';
import { OutputReportComponent } from '../output-report/output-report.component';
import { TicketsNewComponent } from '../tickets-new/tickets-new.component';
import { ApiDocumentationComponent } from '../api-documentation/api-documentation.component';
import { FileDetailsComponent } from '../file-details/file-details.component';
import { Chart, registerables, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'glyphx-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, ClassificationOverviewComponent, NewUploadComponent, ExtractionOverviewComponent, QueueAllComponent, SchedulingJobLogsComponent, OutputSettingsFormatsComponent, OutputSettingsConnectorsComponent, ReportingAnalysisComponent, SummaryComponent, ErrorAnalysisComponent, OutputReportComponent, TicketsNewComponent, ApiDocumentationComponent, FileDetailsComponent, BaseChartDirective],
  template: `
  <!-- Top navigation bar -->
  <header class="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
  <div class="w-full px-0 h-16 flex items-center justify-between">
      <!-- Left: sidebar toggle + Glyphx logo -->
      <div class="flex items-center gap-3">
        <button (click)="toggleSidebar()" class="p-2 rounded-md hover:bg-slate-100" aria-label="Toggle sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <!-- Inline Glyphx logo -->
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" class="text-indigo-600">
            <rect width="24" height="24" rx="6" fill="#4F46E5"></rect>
            <path d="M7 12h10M12 7v10" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-lg font-semibold" [class.sr-only]="sidebarCollapsed">Glyphx</span>
        </div>
      </div>

      <!-- Right: controls -->
      <div class="flex items-center gap-4">
        <!-- Role dropdown -->
        <div class="relative">
          <label for="roleSelect" class="sr-only">Role</label>
          <select id="roleSelect" (change)="onRoleChange($event)" class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50">
            <option *ngFor="let r of roles" [value]="r.id" [selected]="r.id===selectedRole">{{ r.label }}</option>
          </select>
        </div>
        <!-- Project combo box (typeable) -->
        <div class="relative" #projectRoot>
          <label for="projectCombo" class="sr-only">Project</label>
          <input id="projectCombo" list="projectOptions" class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50" placeholder="Select or type project" [(ngModel)]="selectedProject" (input)="onProjectInput($event)" />
          <datalist id="projectOptions">
            <option *ngFor="let p of projects" [value]="p.label"></option>
          </datalist>
        </div>

        <!-- Notifications -->
        <div class="relative" #notifRoot>
          <button #notifBtn (click)="toggleNotifications($event)" class="relative p-2 rounded hover:bg-slate-50 text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            <span *ngIf="unreadCount>0" class="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 text-xs text-white bg-rose-600 rounded-full">{{ unreadCount }}</span>
          </button>
          <div #notifMenu *ngIf="notificationsOpen" class="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg">
            <div class="px-4 py-2 border-b text-sm font-medium">Notifications</div>
            <div class="max-h-64 overflow-auto">
              <div *ngIf="notifications.length===0" class="p-4 text-sm text-slate-500">No new notifications.</div>
              <div *ngFor="let n of notifications; let i = index" class="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3" (click)="openNotification(i)">
                <div class="w-8">
                  <span class="inline-block w-2 h-2 rounded-full" [ngClass]="{'bg-emerald-500': n.type==='success','bg-rose-500': n.type==='error','bg-slate-400': n.type==='info'}"></span>
                </div>
                <div class="flex-1">
                  <div class="text-sm text-slate-700">{{ n.text }}</div>
                  <div class="text-xs text-slate-400">{{ n.timeAgo }}</div>
                </div>
              </div>
            </div>
            <div class="px-3 py-2 border-t text-right"><button class="text-sm text-indigo-600" (click)="viewAllNotifications()">View All</button></div>
          </div>
        </div>

        <!-- Logout -->
        <div>
          <button (click)="logout()" class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block mr-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <div class="w-full px-0 pt-20 py-8 flex gap-6">
    <!-- Sidebar -->
  <aside [class.w-16]="sidebarCollapsed" [class.w-64]="!sidebarCollapsed" class="shrink-0 hidden md:block transition-width duration-200" (click)="onSidebarContainerClick($event)">
      <nav [class.sticky]="true" [class.top-20]="true" class="space-y-3">
        <!-- Home -->
        <div class="space-y-2">
          <a href="#" data-target="user" aria-label="Home" class="nav-view relative group flex items-center gap-2 text-slate-700 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/></svg>
            <span *ngIf="!sidebarCollapsed">Home</span>
            <div *ngIf="sidebarCollapsed" role="tooltip" class="hidden md:block pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-700/95 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg ring-1 ring-black/5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-150 ease-out">Home</div>
          </a>
        </div>

        <!-- Upload -->
        <div class="space-y-2">
          <button class="collapse-toggle relative group w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="Upload">
            <span class="flex items-center gap-2 text-slate-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h10a4 4 0 100-8h-.26A8 8 0 104 15h.5"/></svg>
              <span *ngIf="!sidebarCollapsed">Upload</span>
            </span>
            <svg class="chev w-4 h-4 text-slate-500 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/></svg>
            <div *ngIf="sidebarCollapsed" role="tooltip" class="hidden md:block pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-700/95 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg ring-1 ring-black/5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-150 ease-out">Upload</div>
          </button>
          <div class="submenu ml-6 space-y-3 hidden">
            <a href="#" data-target="new-upload" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/></svg>
              New Upload
            </a>
          </div>
        </div>

        <!-- Human Validation (Classification + Extraction) -->
        <div class="space-y-2">
          <button class="collapse-toggle relative group w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="Human Validation">
            <span class="flex items-center gap-2 text-slate-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
              <span *ngIf="!sidebarCollapsed">Human Validation</span>
            </span>
            <svg class="chev w-4 h-4 text-slate-500 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/></svg>
            <div *ngIf="sidebarCollapsed" role="tooltip" class="hidden md:block pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-700/95 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg ring-1 ring-black/5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-150 ease-out">Human Validation</div>
          </button>
          <div class="submenu ml-6 space-y-3 hidden">
            <a href="#" data-target="classification-overview" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6M9 16h6M8 6h8"/></svg>
              <span class="flex-1">Classification</span>
              <span *ngIf="classificationCount > 0" class="ml-auto px-1.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">{{ classificationCount }}</span>
            </a>
            <a href="#" data-target="extraction-overview" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6M9 16h6M8 6h8"/></svg>
              <span class="flex-1">Extraction</span>
              <span *ngIf="extractionCount > 0" class="ml-auto px-1.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">{{ extractionCount }}</span>
            </a>
          </div>
        </div>

        <!-- Queue -->
        <div class="space-y-2">
          <button class="collapse-toggle relative group w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="Queue">
            <span class="flex items-center gap-2 text-slate-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v8m-4-4h8"/></svg>
              <span *ngIf="!sidebarCollapsed">Queue</span>
            </span>
            <svg class="chev w-4 h-4 text-slate-500 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/></svg>
            <div *ngIf="sidebarCollapsed" role="tooltip" class="hidden md:block pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-700/95 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg ring-1 ring-black/5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-150 ease-out">Queue</div>
          </button>
          <div class="submenu ml-6 space-y-3 hidden">
            <a href="#" data-target="queue-all" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h10M4 18h8"/></svg>All Items</a>
          </div>
        </div>

        <!-- Orchestration -->
        <div class="space-y-2">
          <button class="collapse-toggle relative group w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="Orchestration">
            <span class="flex items-center gap-2 text-slate-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/></svg>
              <span *ngIf="!sidebarCollapsed">Output Settings</span>
            </span>
            <svg class="chev w-4 h-4 text-slate-500 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/></svg>
            <div *ngIf="sidebarCollapsed" role="tooltip" class="hidden md:block pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-700/95 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg ring-1 ring-black/5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-150 ease-out">Output Settings</div>
          </button>
          <div class="submenu ml-6 space-y-3 hidden">
            <a href="#" data-target="scheduling-job-logs" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6l3 3"/></svg>Schedule and Output</a>
          </div>
        </div>

        <!-- Output Settings (hidden by default) -->
        <div class="space-y-2" *ngIf="showOutputSettingsMenu">
          <button class="collapse-toggle relative group w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="Output Settings">
            <span class="flex items-center gap-2 text-slate-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4h16v8H4zM4 16h16"/></svg>
              <span *ngIf="!sidebarCollapsed">Output Settings</span>
            </span>
            <svg class="chev w-4 h-4 text-slate-500 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/></svg>
            <div *ngIf="sidebarCollapsed" role="tooltip" class="hidden md:block pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-700/95 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg ring-1 ring-black/5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-150 ease-out">Output Settings</div>
          </button>
          <div class="submenu ml-6 space-y-3 hidden">
            <a href="#" data-target="output-settings-formats" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M5 16h10"/></svg>Formats</a>
            <a href="#" data-target="output-settings-connectors" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7h18M3 12h18M3 17h18"/></svg>Connectors</a>
          </div>
        </div>

        <!-- Reporting & Analysis -->
        <div class="space-y-2">
          <button class="collapse-toggle relative group w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="Reporting & Analysis">
            <span class="flex items-center gap-2 text-slate-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 19h16M7 10v6m5-8v8m5-4v4"/></svg>
              <span *ngIf="!sidebarCollapsed">Reporting & Analysis</span>
            </span>
            <svg class="chev w-4 h-4 text-slate-500 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/></svg>
            <div *ngIf="sidebarCollapsed" role="tooltip" class="hidden md:block pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-700/95 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg ring-1 ring-black/5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-150 ease-out">Reporting & Analysis</div>
          </button>
          <div class="submenu ml-6 space-y-3">
            <a href="#" data-target="summary" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6M9 16h6M8 6h8"/></svg>Summary</a>
            <a href="#" data-target="error-analysis" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636a9 9 0 11-12.728 0"/></svg>Error Analysis</a>
            <a href="#" data-target="output-report" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h10"/></svg>Output Report</a>
          </div>
        </div>

        <!-- Projects -->
        <div class="space-y-2">
          <button class="collapse-toggle relative group w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="Projects">
            <span class="flex items-center gap-2 text-slate-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
              <span *ngIf="!sidebarCollapsed">Projects</span>
            </span>
            <svg class="chev w-4 h-4 text-slate-500 transition-transform rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/></svg>
            <div *ngIf="sidebarCollapsed" role="tooltip" class="hidden md:block pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-700/95 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg ring-1 ring-black/5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-150 ease-out">Projects</div>
          </button>
          <div class="submenu ml-6 space-y-3">
            <a href="#" class="flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6M8 6h5l3 3v9a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg>AP Invoices</a>
            <a href="#" class="flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6M8 6h5l3 3v9a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg>Claims Intake</a>
            <a href="#" class="flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6M8 6h5l3 3v9a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg>Vendor Statements</a>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-200"></div>

        <!-- API -->
        <div class="space-y-2">
          <button class="collapse-toggle relative group w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="API">
            <span class="flex items-center gap-2 text-slate-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              <span *ngIf="!sidebarCollapsed">API</span>
            </span>
            <svg class="chev w-4 h-4 text-slate-500 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/></svg>
            <div *ngIf="sidebarCollapsed" role="tooltip" class="hidden md:block pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-700/95 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg ring-1 ring-black/5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-150 ease-out">API</div>
          </button>
          <div class="submenu ml-6 space-y-3 hidden">
            <a href="#" data-target="api-documentation" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100">Documentation</a>
          </div>
        </div>

        <!-- Tickets -->
        <div class="space-y-2">
          <button class="collapse-toggle relative group w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="Tickets">
            <span class="flex items-center gap-2 text-slate-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h8M6 11h12M6 15h12M8 19h8"/></svg>
              <span *ngIf="!sidebarCollapsed">Tickets</span>
            </span>
            <svg class="chev w-4 h-4 text-slate-500 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/></svg>
            <div *ngIf="sidebarCollapsed" role="tooltip" class="hidden md:block pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-700/95 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg ring-1 ring-black/5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-150 ease-out">Tickets</div>
          </button>
          <div class="submenu ml-6 space-y-3 hidden">
            <a href="#" data-target="tickets-new" class="nav-view flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/></svg>New Ticket</a>
          </div>
        </div>

  <!-- Logout removed from sidebar (kept in topbar) -->
      </nav>
    </aside>

    <!-- Main content -->
    <main id="content" class="flex-1 space-y-10">
      <!-- Place the main portions from the original HTML here. For brevity in the component file, the bulk of the page markup is included below exactly as a template. -->
      <!-- Extraction Overview, User, Developer, Admin, Classification sections are included here -->

      <!-- For brevity this template reproduces the UI. In a real integration we'd break it into subcomponents. -->

      <!-- role selector moved to topbar -->

      <section id="user" class="view active" aria-labelledby="user-title">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 id="user-title" class="text-2xl font-bold">Welcome, User</h1>
            <p class="text-sm text-slate-500">Monitor health & performance across all DU projects</p>
          </div>
          <div class="flex items-center gap-2">
          
            <button class="inline-flex items-center gap-2 border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-indigo-50">Advanced</button>
            <button id="openQuickUpload" class="ml-3 inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-700">
              <!-- Upload icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0l-3.5 3.5M12 4l3.5 3.5" />
              </svg>
              <span>Quick Upload</span>
            </button>
          </div>
        </div>

        <!-- Explore More -->
        <div class="mt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div class="p-4 rounded-2xl border bg-gradient-to-br from-blue-50 to-white">
              <h3 class="font-semibold">Pricing & Plans</h3>
              <p class="text-sm text-slate-500 mt-1">Compare tiers, usage limits, and overage rules for Glyphx.</p>
              <div class="mt-3 flex gap-2">
                <button class="px-2 py-1 rounded inline-flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600">View Pricing</button>
                <button class="px-2 py-1 rounded border border-indigo-200 text-indigo-600">Calculator</button>
              </div>
            </div>
            <div class="p-4 rounded-2xl border bg-gradient-to-br from-emerald-50 to-white">
              <h3 class="font-semibold">Learning Docs</h3>
              <p class="text-sm text-slate-500 mt-1">Quickstarts, SDK references, and DU best practices.</p>
              <div class="mt-3 flex gap-2">
                <button class="px-2 py-1 rounded inline-flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600">Docs</button>
                <button class="px-2 py-1 rounded border border-indigo-200 text-indigo-600">Quickstart</button>
              </div>
            </div>
            <div class="p-4 rounded-2xl border bg-gradient-to-br from-violet-50 to-white">
              <h3 class="font-semibold">Community Forum</h3>
              <p class="text-sm text-slate-500 mt-1">Ask questions, share templates, and get tips from others.</p>
              <div class="mt-3 flex gap-2">
                <button class="px-2 py-1 rounded inline-flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600">Open Forum</button>
                <button class="px-2 py-1 rounded border border-indigo-200 text-indigo-600">Post</button>
              </div>
            </div>
            <div class="p-4 rounded-2xl border bg-gradient-to-br from-amber-50 to-white">
              <h3 class="font-semibold">Release Notes</h3>
              <p class="text-sm text-slate-500 mt-1">What’s new: features, models, and performance updates.</p>
              <div class="mt-3 flex gap-2">
                <button class="px-2 py-1 rounded inline-flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600">Changelog</button>
                <button class="px-2 py-1 rounded border border-indigo-200 text-indigo-600">Roadmap</button>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <p class="text-sm text-slate-500">Documents Processed</p>
            <p class="mt-2 text-2xl font-semibold">{{ kpi.totalDocs | number }}</p>
          </div>
          <div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <p class="text-sm text-slate-500">Avg. Accuracy</p>
            <p class="mt-2 text-2xl font-semibold">{{ (kpi.avgAcc*100) | number:'1.2-2' }}%</p>
          </div>
          <div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <p class="text-sm text-slate-500">SLA Compliance</p>
            <p class="mt-2 text-2xl font-semibold">{{ (kpi.avgSla*100) | number:'1.2-2' }}%</p>
          </div>
          <div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <p class="text-sm text-slate-500">Open Exceptions</p>
            <p class="mt-2 text-2xl font-semibold">{{ kpi.totalExc | number }}</p>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
          <!-- Daily Throughput (Line) -->
          <div class="rounded-2xl bg-white p-4 col-span-1 xl:col-span-2">
            <h3 class="font-semibold mb-2">Daily Throughput</h3>
            <div class="h-[280px] border rounded-md p-3">
              <canvas baseChart
                [data]="lineChartData"
                [options]="lineChartOptions"
                type="line"
                style="width:100%;height:100%;display:block;"
              ></canvas>
            </div>
          </div>
          <!-- Document Type Mix (Pie) -->
          <div class="rounded-2xl bg-white p-4">
            <h3 class="font-semibold mb-2">Document Type Mix</h3>
            <div class="h-[280px] border rounded-md p-3 flex items-center justify-center">
              <canvas baseChart
                [data]="pieChartData"
                [options]="pieChartOptions"
                [type]="pieChartType"
                style="width:100%;height:100%;display:block;"
              ></canvas>
            </div>
          </div>
        </div>

        <!-- Queue Analytics Row -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
          <div class="rounded-2xl bg-white p-4">
            <h3 class="font-semibold">Queue — Current Distribution</h3>
            <div class="h-[280px] border rounded-md p-3">
              <canvas baseChart
                [data]="queuePieData"
                [options]="queuePieOptions"
                [type]="'pie'"
                style="width:100%;height:100%;display:block;"
              ></canvas>
            </div>
          </div>
          <div class="rounded-2xl bg-white p-4 xl:col-span-2">
            <h3 class="font-semibold">Queue — 7‑Day Trend</h3>
            <div class="h-[280px] border rounded-md p-3">
              <canvas baseChart
                [data]="queueBarData"
                [options]="queueBarOptions"
                type="bar"
                style="width:100%;height:100%;display:block;"
              ></canvas>
            </div>
          </div>
        </div>

        <!-- Projects Table -->
        <div class="mt-4 rounded-2xl bg-white p-4">
          <h3 class="font-semibold mb-2">Projects</h3>
          <div class="overflow-auto">
            <table class="w-full text-sm border-collapse">
              <thead class="text-left text-slate-500 bg-slate-50 border-b">
                <tr>
                  <th class="py-3 px-3 text-xs font-medium uppercase tracking-wider">Project</th>
                  <th class="py-3 px-3 text-xs font-medium uppercase tracking-wider">Owner</th>
                  <th class="py-3 px-3 text-xs font-medium uppercase tracking-wider">Status</th>
                  <th class="py-3 px-3 text-xs font-medium uppercase tracking-wider">Docs</th>
                  <th class="py-3 px-3 text-xs font-medium uppercase tracking-wider">Accuracy</th>
                  <th class="py-3 px-3 text-xs font-medium uppercase tracking-wider">SLA</th>
                  <th class="py-3 px-3 text-xs font-medium uppercase tracking-wider">Exceptions</th>
                  <th class="py-3 px-3 text-xs font-medium uppercase tracking-wider">Health</th>
                  <th class="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of filtered; let i = index" class="odd:bg-white even:bg-slate-50 hover:bg-slate-100">
                  <td class="py-3 px-3 align-top">
                    <div class="font-medium text-slate-800">{{ p.name }}</div>
                    <div class="text-xs text-slate-500">{{ p.id }}</div>
                  </td>
                  <td class="py-3 px-3 align-top">{{ p.owner }}</td>
                  <td class="py-3 px-3 align-top"><span class="px-2 py-1 rounded-full" [ngClass]="{'bg-emerald-100 text-emerald-700': p.status==='Active','bg-amber-100 text-amber-700': p.status==='Paused','bg-rose-100 text-rose-700': p.status==='Error','bg-slate-100 text-slate-700': p.status==='Idle'}">{{ p.status }}</span></td>
                  <td class="py-3 px-3 align-top">{{ p.docs | number }}</td>
                  <td class="py-3 px-3 align-top">{{ (p.accuracy*100) | number:'1.1-1' }}%</td>
                  <td class="py-3 px-3 align-top">{{ (p.sla*100) | number:'1.1-1' }}%</td>
                  <td class="py-3 px-3 align-top">{{ p.exceptions }}</td>
                  <td class="py-3 px-3 align-top">
                    <div class="flex items-center gap-2">
                      <span class="inline-block w-2.5 h-2.5 rounded-full" [ngClass]="{'bg-emerald-500': (p.health||1) >= 0.9, 'bg-amber-400': (p.health||1) >= 0.7 && (p.health||1) < 0.9, 'bg-rose-500': (p.health||1) < 0.7}"></span>
                      <span class="text-xs text-slate-600">{{ ((p.health||1)*100) | number:'1.0-0' }}%</span>
                    </div>
                  </td>
                  <td class="py-3 px-3 align-top text-right">
                    <button class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600">
                      <!-- Open icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                      <span>Open</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- In-page Human Validation panel removed: use sidebar navigation links instead -->

      <classification-overview #classificationComponent></classification-overview>
      <extraction-overview #extractionComponent></extraction-overview>

      <new-upload></new-upload>
      <queue-all></queue-all>
      <scheduling-job-logs></scheduling-job-logs>
      <output-settings-formats></output-settings-formats>
  <output-settings-connectors></output-settings-connectors>
      <reporting-analysis></reporting-analysis>
      <summary-page></summary-page>
      <error-analysis></error-analysis>
      <api-documentation></api-documentation>
      <output-report></output-report>
      <tickets-new></tickets-new>
      
      <!-- File Details Component -->
      <app-file-details id="file-details" class="view"></app-file-details>      <!-- Developer & Admin placeholders -->
      <section id="developer" class="view" aria-labelledby="dev-title"><h1>Developer</h1></section>
      <section id="admin" class="view" aria-labelledby="admin-title"><h1>Admin</h1></section>

      <!-- Quick Upload Modal (kept in template so DOM elements exist) -->
      <div id="quickUploadModal" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-slate-900/50" id="quickUploadBackdrop"></div>
        <div class="relative mx-auto mt-24 w-full max-w-xl">
          <div class="rounded-2xl bg-white shadow-xl border border-slate-200">
            <div class="flex items-center justify-between px-6 py-4 border-b">
              <h3 class="text-lg font-semibold">Quick Upload</h3>
              <button id="closeQuickUpload" class="p-2 rounded-lg hover:bg-slate-100" aria-label="Close">✕</button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div class="space-y-1">
                <label for="quickProject" class="text-sm text-slate-600">Project</label>
                <select id="quickProject" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm">
                  <option selected>Automatic Classification</option>
                  <option>AP Invoices</option>
                </select>
              </div>
              <div id="quickDropZone" class="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50">
                <div class="flex flex-col items-center gap-2">
                  <p class="font-medium">Drop documents here</p>
                  <button id="quickBrowseBtn" class="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-sm hover:bg-slate-100">Click to Browse</button>
                </div>
                <input id="quickFileInput" type="file" class="hidden" multiple />
              </div>
              <div id="quickFileList" class="text-sm text-slate-700"></div>
            </div>
            <div class="px-6 py-4 border-t flex items-center justify-end gap-2">
              <button id="quickCancel" class="px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white hover:bg-slate-50">Cancel</button>
              <button id="quickUploadAction" class="px-3 py-2 rounded-xl text-sm bg-indigo-600 text-white disabled:opacity-50" disabled>Upload</button>
            </div>
          </div>
        </div>
      </div>
  </main>
  </div>
  `
})
export class GlyphxHomepageComponent implements AfterViewInit, AfterViewChecked {
  // Feature flags
  showOutputSettingsMenu = false; // hide Output Settings group in sidebar
  // Project dropdown
  projects = [
    { id: 'invoice', label: 'Invoice – Finance Team' },
    { id: 'credit', label: 'Credit Notes – Sales Team' }
  ];
  selectedProject: string | null = null;
  projectDropdownOpen = false;

  // Notifications
  notifications: { type: 'success' | 'error' | 'info'; text: string; timeAgo: string; read?: boolean }[] = [
    { type: 'success', text: 'New document processed successfully', timeAgo: '2m ago', read: false },
    { type: 'error', text: '1 file failed to process', timeAgo: '10m ago', read: false }
  ];
  notificationsOpen = false;
  get unreadCount() { return this.notifications.filter(n => !n.read).length; }

  // Roles
  roles = [
    { id: 'user', label: 'User' },
    { id: 'developer', label: 'Developer' },
    { id: 'admin', label: 'Admin' }
  ];
  selectedRole: string = 'user';

  get classificationCount(): number {
    if (!this.classificationComponent) return 0;
    return this.classificationComponent.documents.filter(doc => doc.validationStatus === 'Needs Validation').length;
  }

  get extractionCount(): number {
    if (!this.extractionComponent) return 0;
    return this.extractionComponent.documents.filter(doc => doc.validationStatus === 'Needs Validation').length;
  }

  constructor() { }

  // Analytics demo state
  q = '';

  demoProjects = [
    { id: 'PX-001', name: 'Invoice DU', owner: 'Jerome', status: 'Active', docs: 12840, accuracy: 0.964, sla: 0.98, exceptions: 42 },
    { id: 'PX-002', name: 'PO Extractor', owner: 'Ana', status: 'Active', docs: 8340, accuracy: 0.941, sla: 0.92, exceptions: 61 },
    { id: 'PX-003', name: 'Receipt Classifier', owner: 'Bea', status: 'Paused', docs: 2451, accuracy: 0.912, sla: 0.88, exceptions: 24 },
    { id: 'PX-004', name: 'Waybill Parser', owner: 'Lee', status: 'Active', docs: 6880, accuracy: 0.953, sla: 0.96, exceptions: 19 },
    { id: 'PX-005', name: 'BOL Validator', owner: 'Mark', status: 'Active', docs: 3020, accuracy: 0.927, sla: 0.91, exceptions: 33 },
  ];

  processedByDay = [
    { day: 'Mon', docs: 1800, exceptions: 12 },
    { day: 'Tue', docs: 2100, exceptions: 15 },
    { day: 'Wed', docs: 1950, exceptions: 10 },
    { day: 'Thu', docs: 2300, exceptions: 17 },
    { day: 'Fri', docs: 2450, exceptions: 9 },
    { day: 'Sat', docs: 1300, exceptions: 6 },
    { day: 'Sun', docs: 980, exceptions: 4 },
  ];

  typeMix = [
    { type: 'Invoices', value: 54 },
    { type: 'POs', value: 18 },
    { type: 'Receipts', value: 14 },
    { type: 'Waybills', value: 8 },
    { type: 'Others', value: 6 },
  ];

  COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];

  queueSummary = { failed: 37, queued: 120, inProgress: 18, success: 845 };
  queueByDay = [
    { day: 'Mon', failed: 5, queued: 20, inProgress: 3, success: 120 },
    { day: 'Tue', failed: 6, queued: 18, inProgress: 2, success: 132 },
    { day: 'Wed', failed: 4, queued: 19, inProgress: 4, success: 127 },
    { day: 'Thu', failed: 8, queued: 21, inProgress: 5, success: 140 },
    { day: 'Fri', failed: 9, queued: 22, inProgress: 2, success: 150 },
    { day: 'Sat', failed: 3, queued: 12, inProgress: 1, success: 95 },
    { day: 'Sun', failed: 2, queued: 8, inProgress: 1, success: 81 },
  ];

  STATUS_COLORS: Record<string, string> = { failed: '#ef4444', queued: '#3b82f6', inProgress: '#f59e0b', success: '#22c55e' };

  get filtered() {
    const q = this.q.trim().toLowerCase();
    if (!q) return this.demoProjects;
    return this.demoProjects.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }

  get kpi() {
    const filtered = this.filtered;
    const totalDocs = filtered.reduce((s, p) => s + p.docs, 0);
    const avgAcc = filtered.length ? filtered.reduce((s, p) => s + p.accuracy, 0) / filtered.length : 0;
    const avgSla = filtered.length ? filtered.reduce((s, p) => s + p.sla, 0) / filtered.length : 0;
    const totalExc = filtered.reduce((s, p) => s + p.exceptions, 0);
    return { totalDocs, avgAcc, avgSla, totalExc };
  }

  // Chart.js / ng2-charts properties (interactive + tooltips)
  public get lineChartData(): ChartConfiguration<'line'>['data'] {
    return {
      labels: this.processedByDay.map(d => d.day),
      datasets: [
        {
          label: 'Documents',
          data: this.processedByDay.map(d => d.docs),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.18)',
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Exceptions',
          data: this.processedByDay.map(d => d.exceptions),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.14)',
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'exceptionsAxis'
        }
      ]
    };
  }

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (ctx) => {
            const v = ctx.dataset.data?.[ctx.dataIndex] ?? '';
            return `${ctx.dataset.label}: ${v}`;
          }
        }
      },
      legend: { position: 'top' }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Documents' }
      },
      exceptionsAxis: {
        position: 'right' as const,
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Exceptions' }
      }
    }
  };

  public get pieChartType(): ChartType { return 'pie'; }
  public get pieChartData(): ChartConfiguration<'pie'>['data'] {
    return {
      labels: this.typeMix.map(t => t.type),
      datasets: [{
        data: this.typeMix.map(t => t.value),
        backgroundColor: this.COLORS,
        hoverOffset: 8
      }]
    };
  }
  public pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      tooltip: {
        enabled: false,
        external: (context: any) => {
          // Custom HTML tooltip
          const tooltipModel = context.tooltip;
          let tooltipEl = document.getElementById('chartjs-tooltip');
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.background = 'rgba(0,0,0,0.75)';
            tooltipEl.style.color = 'white';
            tooltipEl.style.padding = '6px 8px';
            tooltipEl.style.borderRadius = '6px';
            tooltipEl.style.fontSize = '12px';
            document.body.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            tooltipEl.style.pointerEvents = 'none';
            return;
          }

          if (tooltipModel.body) {
            const titleLines = tooltipModel.title || [];
            const bodyLines = tooltipModel.body.map((b: any) => b.lines);
            let innerHtml = '';
            titleLines.forEach((t: string) => {
              innerHtml += `<div style="font-weight:600;margin-bottom:4px">${t}</div>`;
            });
            bodyLines.forEach((b: any) => {
              innerHtml += `<div>${b}</div>`;
            });
            tooltipEl.innerHTML = innerHtml;
          }

          const canvasRect = context.chart.canvas.getBoundingClientRect();
          const top = canvasRect.top + window.scrollY + (tooltipModel.caretY || 0) - 40;
          const left = canvasRect.left + window.scrollX + (tooltipModel.caretX || 0) + 10;
          tooltipEl.style.opacity = '1';
          tooltipEl.style.transform = `translate(${left}px, ${top}px)`;
        }
      },
      legend: { position: 'bottom' }
    }
  };

  // queue pie data (uses queueSummary)
  public get queuePieData(): ChartConfiguration<'pie'>['data'] {
    return {
      labels: ['Failed', 'Queued', 'In Progress', 'Success'],
      datasets: [{
        data: [this.queueSummary.failed, this.queueSummary.queued, this.queueSummary.inProgress, this.queueSummary.success],
        backgroundColor: [this.STATUS_COLORS.failed, this.STATUS_COLORS.queued, this.STATUS_COLORS.inProgress, this.STATUS_COLORS.success],
        hoverOffset: 8
      }]
    };
  }

  public queuePieOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      tooltip: {
        enabled: false,
        external: (context: any) => {
          // reuse same custom tooltip logic as pieChartOptions
          const tooltipModel = context.tooltip;
          let tooltipEl = document.getElementById('chartjs-tooltip');
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.background = 'rgba(0,0,0,0.75)';
            tooltipEl.style.color = 'white';
            tooltipEl.style.padding = '6px 8px';
            tooltipEl.style.borderRadius = '6px';
            tooltipEl.style.fontSize = '12px';
            document.body.appendChild(tooltipEl);
          }
          if (tooltipModel.opacity === 0) { tooltipEl.style.opacity = '0'; tooltipEl.style.pointerEvents = 'none'; return; }
          if (tooltipModel.body) {
            const titleLines = tooltipModel.title || [];
            const bodyLines = tooltipModel.body.map((b: any) => b.lines);
            let innerHtml = '';
            titleLines.forEach((t: string) => { innerHtml += `<div style="font-weight:600;margin-bottom:4px">${t}</div>`; });
            bodyLines.forEach((b: any) => { innerHtml += `<div>${b}</div>`; });
            tooltipEl.innerHTML = innerHtml;
          }
          const canvasRect = context.chart.canvas.getBoundingClientRect();
          const top = canvasRect.top + window.scrollY + (tooltipModel.caretY || 0) - 40;
          const left = canvasRect.left + window.scrollX + (tooltipModel.caretX || 0) + 10;
          tooltipEl.style.opacity = '1';
          tooltipEl.style.transform = `translate(${left}px, ${top}px)`;
        }
      },
      legend: { position: 'bottom' }
    }
  };

  public get queueBarData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.queueByDay.map(d => d.day),
      datasets: [
        { label: 'Failed', data: this.queueByDay.map(d => d.failed), backgroundColor: this.STATUS_COLORS.failed },
        { label: 'Queued', data: this.queueByDay.map(d => d.queued), backgroundColor: this.STATUS_COLORS.queued },
        { label: 'In Progress', data: this.queueByDay.map(d => d.inProgress), backgroundColor: this.STATUS_COLORS.inProgress },
        { label: 'Success', data: this.queueByDay.map(d => d.success), backgroundColor: this.STATUS_COLORS.success },
      ]
    };
  }

  public queueBarOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      legend: { position: 'top' }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true }
    }
  };

  @ViewChild('projectRoot', { static: true }) projectRoot!: ElementRef<HTMLElement>;
  @ViewChild('notifRoot', { static: true }) notifRoot!: ElementRef<HTMLElement>;
  @ViewChild('classificationComponent') classificationComponent!: ClassificationOverviewComponent;
  @ViewChild('extractionComponent') extractionComponent!: ExtractionOverviewComponent;

  // Sidebar collapsed state
  sidebarCollapsed = false;

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.projectDropdownOpen && this.projectRoot && !this.projectRoot.nativeElement.contains(target)) {
      this.projectDropdownOpen = false;
    }
    if (this.notificationsOpen && this.notifRoot && !this.notifRoot.nativeElement.contains(target)) {
      this.notificationsOpen = false;
    }
  }

  toggleProjectDropdown(ev?: Event) {
    ev?.stopPropagation();
    this.projectDropdownOpen = !this.projectDropdownOpen;
  }

  selectProject(p: { id: string; label: string }) {
    this.selectedProject = p.label;
    this.projectDropdownOpen = false;
    // TODO: emit event or update services to filter other sections
  }

  onProjectInput(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const val = input.value;
    // If the typed value matches a known project label, normalize to that label
    const match = this.projects.find(p => p.label.toLowerCase() === val.trim().toLowerCase());
    if (match) {
      this.selectedProject = match.label;
    } else {
      this.selectedProject = val;
    }
  }

  toggleNotifications(ev?: Event) {
    ev?.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    // When collapsing the sidebar, make sure any open submenus are hidden
    // and chevrons are reset so the collapsed state stays tidy.
    if (this.sidebarCollapsed) {
      try {
        document.querySelectorAll('.submenu').forEach(s => s.classList.add('hidden'));
        document.querySelectorAll('.chev').forEach(c => c.classList.remove('rotate-180'));
      } catch (e) {
        // Defensive: if running in a non-browser environment, ignore DOM errors
        // (no-op)
      }
    }
  }

  // Expand sidebar when clicking the collapsed container
  onSidebarContainerClick(ev: MouseEvent) {
    if (!this.sidebarCollapsed) return;
    // Avoid toggling when clicking interactive submenu items (none are visible in collapsed state)
    this.sidebarCollapsed = false;
  }

  onRoleChange(ev: Event) {
    const select = ev.target as HTMLSelectElement;
    const roleId = select.value;
    this.selectedRole = roleId;
    // Activate the matching view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(roleId);
    if (target) target.classList.add('active');
    // Update sidebar/nav highlights to match
    document.querySelectorAll('.nav-view').forEach(n => n.classList.remove('bg-indigo-600','text-white','font-medium'));
    // Highlight the nav-view whose data-target matches the role (if present)
    const navMatch = document.querySelector(`.nav-view[data-target="${roleId}"]`) as HTMLElement | null;
    if (navMatch) {
      navMatch.classList.add('bg-indigo-600','text-white','font-medium');
    }
  }

  openNotification(i: number) {
    if (this.notifications[i]) {
      this.notifications[i].read = true;
      // TODO: navigate to detail or mark read on server
    }
  }

  viewAllNotifications() {
    // TODO: navigate to notifications page
    this.notificationsOpen = false;
  }

  logout() {
    // TODO: integrate with real auth flow; for now, redirect to a placeholder URL
    window.location.href = '/login';
  }
  ngAfterViewInit(): void {
    // Re-implement the original page's DOM-driven behavior
    // Role switcher
    (function(){
      const buttons = document.querySelectorAll('.role-btn');
      const views = document.querySelectorAll('.view');
      buttons.forEach(btn => btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-target');
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(id)?.classList.add('active');
        buttons.forEach(b => b.classList.remove('bg-indigo-600','text-white'));
        btn.classList.add('bg-indigo-600','text-white');
      }));
    })();

    // Collapsible sidebar groups
    (function(){
      document.querySelectorAll('.collapse-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const submenu = btn.nextElementSibling as HTMLElement | null;
          const chev = btn.querySelector('.chev');
          submenu?.classList.toggle('hidden');
          chev?.classList.toggle('rotate-180');
        });
      });
    })();

    // Sidebar navigation: make .nav-view links activate the matching view section
    (function(){
      document.querySelectorAll('.nav-view').forEach(nav => {
        nav.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = (nav as HTMLElement).getAttribute('data-target');
          if(!targetId) return;
          // Hide all views, show the target
          document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
          const target = document.getElementById(targetId);
          if(target) target.classList.add('active');

          // Update nav highlight styles
          document.querySelectorAll('.nav-view').forEach(n => n.classList.remove('bg-indigo-600','text-white','font-medium'));
          (nav as HTMLElement).classList.add('bg-indigo-600','text-white','font-medium');
        });
      });
    })();

    // Quick Upload modal logic
    (function(){
      const qModal = document.getElementById('quickUploadModal');
      const qOpen = document.getElementById('openQuickUpload');
      const qClose = document.getElementById('closeQuickUpload');
      const qCancel = document.getElementById('quickCancel');
      const qBackdrop = document.getElementById('quickUploadBackdrop');
      const qBrowse = document.getElementById('quickBrowseBtn');
      const qInput = document.getElementById('quickFileInput') as HTMLInputElement | null;
      const qDrop = document.getElementById('quickDropZone');
      const qList = document.getElementById('quickFileList');
      const qAction = document.getElementById('quickUploadAction') as HTMLButtonElement | null;

      function openQ(){ qModal?.classList.remove('hidden'); }
      function closeQ(){ if(!qModal) return; qModal.classList.add('hidden'); if(qInput){ qInput.value=''; } if(qList){ qList.innerHTML=''; } if(qAction){ qAction.disabled = true; } }

      qOpen?.addEventListener('click', openQ);
      qClose?.addEventListener('click', closeQ);
      qCancel?.addEventListener('click', closeQ);
      qBackdrop?.addEventListener('click', closeQ);

      qBrowse?.addEventListener('click', () => qInput?.click());
      qInput?.addEventListener('change', () => { renderFiles(qInput.files); });

      function renderFiles(fileList: FileList | null){
        if(!qList || !qAction) return;
        if(!fileList || fileList.length===0){ qList.innerHTML=''; if(qAction) qAction.disabled = true; return; }
        const items = Array.from(fileList).map(f => `\n            <li class="py-1">• ${f.name} <span class="text-slate-500">(${Math.round(f.size/1024)} KB)</span></li>`).join('');
        qList.innerHTML = `<ul class="divide-y">${items}</ul>`;
        qAction.disabled = false;
      }

      if(qDrop){
        ['dragenter','dragover'].forEach(evt => qDrop.addEventListener(evt, e=>{e.preventDefault();e.stopPropagation();qDrop.classList.add('bg-slate-50');}));
        ['dragleave','drop'].forEach(evt => qDrop.addEventListener(evt, e=>{e.preventDefault();e.stopPropagation();qDrop.classList.remove('bg-slate-50');}));
        qDrop.addEventListener('drop', e => {
          const dt = (e as DragEvent).dataTransfer;
          if(dt && dt.files && qInput){ (qInput as any).files = dt.files; renderFiles(dt.files); }
        });
      }

      qAction?.addEventListener('click', ()=>{
        closeQ();
        const qp = document.getElementById('quickProject') as HTMLSelectElement | null;
        alert('Files queued for upload to project: ' + (qp?.value || ''));
      });
    })();
  }

  ngAfterViewChecked(): void {
    // This method triggers when any data changes that might affect the document counts
    // The getter methods will automatically recalculate and update the displayed counts
  }
}
