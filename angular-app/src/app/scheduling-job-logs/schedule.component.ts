import { Component, ViewChild, TemplateRef } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'schedule-view',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
  MatDialogModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatRadioModule, MatCheckboxModule, MatSnackBarModule
  ],
  template: `
    <section>
      <!-- Controls row (match Jobs tab spacing/alignment) -->
      <div class="flex flex-col md:flex-row md:items-center gap-3 mb-3">
        <div class="flex items-center gap-2 ml-auto">
          <button class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600 transition-colors whitespace-nowrap shrink-0" (click)="openAddDialog()">
            <svg class="h-5 w-5 align-middle text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            <span>Add New Schedule</span>
          </button>
          <button class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 disabled:cursor-not-allowed" (click)="sendNow()" [disabled]="isSendingNow">
            <ng-container *ngIf="!isSendingNow; else sendingTpl">
              <svg class="h-5 w-5 align-middle text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M22 2L11 13"></path>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
              </svg>
              <span>Send Now</span>
            </ng-container>
            <ng-template #sendingTpl>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 50 50" aria-hidden="true">
                <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="4" stroke-opacity="0.25" fill="none"></circle>
                <path fill="currentColor" d="M25 5a20 20 0 0 1 20 20h-5a15 15 0 0 0-15-15z">
                  <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
                </path>
              </svg>
              Sending...
            </ng-template>
          </button>
        </div>
      </div>

      <!-- SECTION: Schedules Table -->
      <div class="mb-10">
        <h2 class="text-lg font-bold mb-2">Schedules</h2>
        <div class="overflow-x-auto bg-white rounded-xl border border-slate-200">
          <table class="w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="text-left px-4 py-3 font-bold text-slate-700">Name</th>
                <th class="text-left px-4 py-3 font-bold text-slate-700">Frequency</th>
                <th class="text-left px-4 py-3 font-bold text-slate-700">Next Run</th>
                <th class="text-left px-4 py-3 font-bold text-slate-700">More Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of schedules" class="hover:bg-slate-50">
                <td class="px-4 py-3">{{s.name}}</td>
                <td class="px-4 py-3">{{getFrequencySummary(s)}}</td>
                <td class="px-4 py-3">{{getNextRunText(s)}}</td>
                <td class="px-4 py-3">
                  <button mat-icon-button [matMenuTriggerFor]="rowMenu" aria-label="Schedule actions">
                    <svg class="align-middle h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                      <circle cx="12" cy="5" r="2"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                      <circle cx="12" cy="19" r="2"></circle>
                    </svg>
                  </button>
                  <mat-menu #rowMenu="matMenu" xPosition="before">
                    <button mat-menu-item (click)="openEditDialog(s)"><mat-icon>edit</mat-icon> Edit</button>
                    <button mat-menu-item (click)="toggleEnabled(s)"><mat-icon>{{s.enabled ? 'block' : 'check_circle'}}</mat-icon> {{s.enabled ? 'Disable' : 'Enable'}}</button>
                    <button mat-menu-item (click)="removeSchedule(s)"><mat-icon>delete</mat-icon> Remove</button>
                  </mat-menu>
                </td>
              </tr>
              <tr *ngIf="schedules.length===0">
                <td colspan="4" class="px-4 py-6 text-center text-slate-500">No schedules found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>

        <!-- Export menu for historical outputs (single shared menu; trigger sets selectedHistoricalOutput) -->
        <mat-menu #exportMenu="matMenu" panelClass="export-menu-panel">
          <button mat-menu-item (click)="exportHistoricalFile(selectedHistoricalOutput, 'csv')">Export as CSV</button>
          <button mat-menu-item (click)="exportHistoricalFile(selectedHistoricalOutput, 'json')">Export as JSON</button>
          <button mat-menu-item (click)="exportHistoricalFile(selectedHistoricalOutput, 'excel')">Export as Excel</button>
        </mat-menu>

      <!-- SECTION: Historical Outputs Table (with filter row as part of table) -->
      <div class="mb-10">
        <h2 class="text-lg font-bold mb-2">Historical Outputs</h2>
        <div class="overflow-x-auto bg-white rounded-xl border border-slate-200">
          <table class="w-full text-sm">
            <thead class="bg-slate-50">
              <!-- Filter row as part of thead -->
              <tr>
                <th colspan="4" class="p-0">
                  <div class="flex flex-col md:flex-row md:items-end md:gap-4 gap-3 p-3">
                    <div class="flex-1">
                      <input type="text" placeholder="Search by Output Filename" [(ngModel)]="historicalSearchTerm" (input)="onHistoricalFilterChange()" (keydown)="$event.stopPropagation()" (keypress)="$event.stopPropagation()" autocomplete="off" class="w-full px-3 py-2 border rounded-xl border-slate-200" />
                    </div>
                    <div class="flex gap-2 items-end">
                      <select [(ngModel)]="historicalDateRange" (change)="onHistoricalDateRangeChange()" class="px-3 py-2 border rounded-xl border-slate-200">
                        <option value="all">All</option>
                        <option value="last1">Last 1 day</option>
                        <option value="last30">Last 30 days</option>
                        <option value="last60">Last 60 days</option>
                        <option value="custom">Custom range</option>
                      </select>
                      <div *ngIf="historicalDateRange === 'custom'" class="flex gap-2">
                        <input type="date" [(ngModel)]="historicalCustomStartDate" (change)="onHistoricalFilterChange()" class="px-3 py-2 border rounded-xl border-slate-200" />
                        <input type="date" [(ngModel)]="historicalCustomEndDate" (change)="onHistoricalFilterChange()" class="px-3 py-2 border rounded-xl border-slate-200" />
                      </div>
                    </div>
                  </div>
                </th>
              </tr>
              <tr>
                <th class="text-left px-4 py-3 font-bold text-black">Output Filename</th>
                <th class="text-left px-4 py-3 font-bold text-black">Date</th>
                <th class="text-left px-4 py-3 font-bold text-black">Time</th>
                <th class="text-left px-4 py-3 font-bold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let output of filteredHistoricalOutputs" class="hover:bg-slate-50">
                <td class="px-4 py-3">{{output.filename}}</td>
                <td class="px-4 py-3">{{output.date | date:'MM/dd/yyyy'}}</td>
                <td class="px-4 py-3">{{output.date | date:'hh:mm:ss a'}}</td>
                <td class="px-4 py-3">
                  <button mat-button class="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1" (click)="selectedHistoricalOutput = output" [matMenuTriggerFor]="exportMenu" aria-label="Export output">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" focusable="false"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v12m0 0l-4-4m4 4l4-4M21 21H3"/></svg>
                    <span class="text-slate-700">Export</span>
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredHistoricalOutputs.length === 0">
                <td colspan="4" class="px-4 py-6 text-center text-slate-500">No historical outputs found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Dialog -->
      <ng-template #dialog let-data let-dialogRef="dialogRef">
        <div class="w-full max-w-md p-6">
          <h3 class="text-xl font-bold mb-4">{{data.editing ? 'Edit Schedule' : 'Add New Schedule'}}</h3>
          <form (ngSubmit)="saveDialog(data, dialogRef)">
            <mat-form-field class="w-full mb-3">
              <mat-label>Schedule Name</mat-label>
              <input matInput [(ngModel)]="data.name" name="name" required />
            </mat-form-field>
            <mat-form-field class="w-full mb-3">
              <mat-label>Timezone</mat-label>
              <mat-select [(ngModel)]="data.timezone" name="timezone" required>
                <mat-option *ngFor="let tz of timezones" [value]="tz">{{tz}}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-radio-group [(ngModel)]="data.frequencyType" name="frequencyType" class="mb-3 flex flex-col gap-2">
              <mat-radio-button value="hourly">Hourly</mat-radio-button>
              <mat-radio-button value="daily">Daily</mat-radio-button>
              <mat-radio-button value="weekly">Weekly</mat-radio-button>
              <mat-radio-button value="monthly">Monthly</mat-radio-button>
              <mat-radio-button value="advanced">Advanced (Cron Expression)</mat-radio-button>
            </mat-radio-group>

            <!-- Dynamic fields per frequency type -->
            <div *ngIf="data.frequencyType==='hourly'">
              <mat-form-field class="w-full mb-3">
                <mat-label>Minute</mat-label>
                <input matInput type="number" min="0" max="59" [(ngModel)]="data.minute" name="minute" required />
              </mat-form-field>
            </div>
            <div *ngIf="data.frequencyType==='daily'">
              <mat-form-field class="w-full mb-3">
                <mat-label>Hour</mat-label>
                <input matInput type="number" min="0" max="23" [(ngModel)]="data.hour" name="hour" required />
              </mat-form-field>
              <mat-form-field class="w-full mb-3">
                <mat-label>Minute</mat-label>
                <input matInput type="number" min="0" max="59" [(ngModel)]="data.minute" name="minute" required />
              </mat-form-field>
            </div>
            <div *ngIf="data.frequencyType==='weekly'">
              <div class="mb-3">
                <label class="block mb-1">Days of week</label>
                <mat-checkbox *ngFor="let d of daysOfWeek" [(ngModel)]="data.daysOfWeek[d]" name="dow_{{d}}">{{d}}</mat-checkbox>
              </div>
              <mat-form-field class="w-full mb-3">
                <mat-label>Hour</mat-label>
                <input matInput type="number" min="0" max="23" [(ngModel)]="data.hour" name="hour" required />
              </mat-form-field>
              <mat-form-field class="w-full mb-3">
                <mat-label>Minute</mat-label>
                <input matInput type="number" min="0" max="59" [(ngModel)]="data.minute" name="minute" required />
              </mat-form-field>
            </div>
            <div *ngIf="data.frequencyType==='monthly'">
              <mat-form-field class="w-full mb-3">
                <mat-label>Every X months</mat-label>
                <input matInput type="number" min="1" max="12" [(ngModel)]="data.monthInterval" name="monthInterval" required />
              </mat-form-field>
              <div class="mb-3">
                <label class="block mb-1">Days of month</label>
                <mat-checkbox *ngFor="let d of daysOfMonth" [(ngModel)]="data.daysOfMonth[d]" name="dom_{{d}}">{{d}}</mat-checkbox>
              </div>
              <mat-form-field class="w-full mb-3">
                <mat-label>Hour</mat-label>
                <input matInput type="number" min="0" max="23" [(ngModel)]="data.hour" name="hour" required />
              </mat-form-field>
              <mat-form-field class="w-full mb-3">
                <mat-label>Minute</mat-label>
                <input matInput type="number" min="0" max="59" [(ngModel)]="data.minute" name="minute" required />
              </mat-form-field>
            </div>
            <div *ngIf="data.frequencyType==='advanced'">
              <mat-form-field class="w-full mb-3">
                <mat-label>Cron Expression</mat-label>
                <input matInput [(ngModel)]="data.cron" name="cron" required />
              </mat-form-field>
            </div>

            <div class="flex gap-3 justify-end mt-6">
              <button mat-stroked-button type="button" (click)="dialogRef.close()">Cancel</button>
              <button mat-raised-button color="primary" type="submit">{{data.editing ? 'Update' : 'Add'}}</button>
            </div>
          </form>
        </div>
      </ng-template>
    </section>
  `
})
export class ScheduleComponent {
  schedules: any[] = [];
  selectedSchedule: any = null;
  selectedHistoricalOutput: any = null;
  @ViewChild('dialog', { static: true }) dialogTemplate!: TemplateRef<any>;
  timezones = ['UTC','America/New_York','Europe/London','Asia/Tokyo'];
  daysOfWeek = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  daysOfMonth = Array.from({length:31},(_,i)=>i+1);
  isSendingNow = false;

  // Historical outputs state
  historicalSearchTerm = '';
  historicalDateRange = 'all';
  historicalCustomStartDate: Date | null = null;
  historicalCustomEndDate: Date | null = null;
  historicalOutputs: any[] = []; // This should be populated with actual historical output data
  filteredHistoricalOutputs: any[] = [];

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() {
    // seed with a sample schedule for demo purposes
    this.schedules.push({ id: Date.now(), name: 'Sample Daily', timezone: 'UTC', frequencyType: 'daily', hour: 8, minute: 0, enabled: true });

    // seed historical outputs for demo purposes
    const now = new Date();
    this.historicalOutputs = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 10 + i, 0);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const yyyy = d.getFullYear();
      const HH = String(d.getHours()).padStart(2, '0');
      const MM = String(d.getMinutes()).padStart(2, '0');
      this.historicalOutputs.push({
        filename: `Output_Report_${mm}_${dd}_${yyyy}_${HH}_${MM}`,
        date: d
      });
    }
    this.filteredHistoricalOutputs = this.historicalOutputs;
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(this.dialogTemplate, {
      data: {
        name: '', timezone: 'UTC', frequencyType: 'daily', hour: 8, minute: 0,
        daysOfWeek: {}, daysOfMonth: {}, monthInterval: 1, cron: '', enabled: true, editing: false
      },
      width: '400px', autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && !result.editing) {
        result.id = Date.now();
        result.enabled = true;
        // normalize boolean maps
        result.daysOfWeek = result.daysOfWeek || {};
        result.daysOfMonth = result.daysOfMonth || {};
        this.schedules.push(result);
      }
    });
  }

  openEditDialog(s: any) {
    const dialogRef = this.dialog.open(this.dialogTemplate, {
      data: { ...JSON.parse(JSON.stringify(s)), editing: true }, width: '400px', autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.editing) {
        // apply edited fields back to the original schedule
        Object.assign(s, result);
      }
    });
  }

  saveDialog(data: any, dialogRef: any) {
    // Ensure numeric values
    if (data.hour != null) data.hour = Number(data.hour);
    if (data.minute != null) data.minute = Number(data.minute);
    if (data.monthInterval != null) data.monthInterval = Number(data.monthInterval) || 1;
    dialogRef.close(data);
  }

  toggleEnabled(s: any) {
    s.enabled = !s.enabled;
  }

  removeSchedule(s: any) {
    if (confirm('Remove this schedule?')) {
      this.schedules = this.schedules.filter(x => x !== s);
    }
  }

  getFrequencySummary(s: any): string {
    if (s.frequencyType==='hourly') return `Every hour at minute ${s.minute}`;
    if (s.frequencyType==='daily') return `Every day at ${this.pad(s.hour)}:${this.pad(s.minute)}`;
    if (s.frequencyType==='weekly') {
      const days = this.daysOfWeek.filter(d=>s.daysOfWeek && s.daysOfWeek[d]).join(', ');
      return `Weekly on ${days || '(no days selected)'} at ${this.pad(s.hour)}:${this.pad(s.minute)}`;
    }
    if (s.frequencyType==='monthly') {
      const days = this.daysOfMonth.filter(d=>s.daysOfMonth && s.daysOfMonth[d]).join(', ');
      return `Every ${s.monthInterval || 1} month(s) on days ${days || '(no days selected)'} at ${this.pad(s.hour)}:${this.pad(s.minute)}`;
    }
    if (s.frequencyType==='advanced') return `Cron: ${s.cron}`;
    return '';
  }
  getNextRunText(s: any): string {
    if (!s.enabled) return 'Disabled';
    const next = this.computeNextRun(s);
    if (!next) return '';
    const now = new Date();
    const diffMs = next.getTime() - now.getTime();
    if (diffMs < 60000) return 'in a few seconds';
    if (diffMs < 3600000) return `in ${Math.round(diffMs/60000)} min`;
    if (diffMs < 86400000) return `in ${Math.round(diffMs/3600000)} hours`;
    return `in ${Math.round(diffMs/86400000)} days`;
  }

  computeNextRun(s: any): Date | null {
    const now = new Date();
    if (!s || !s.frequencyType) return null;
    if (s.frequencyType === 'hourly') {
      const next = new Date(now.getTime());
      next.setMinutes(Number(s.minute) || 0, 0, 0);
      if (next <= now) next.setHours(next.getHours() + 1);
      return next;
    }
    if (s.frequencyType === 'daily') {
      const next = new Date(now.getTime());
      next.setHours(Number(s.hour) || 0, Number(s.minute) || 0, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      return next;
    }
    if (s.frequencyType === 'weekly') {
      // daysOfWeek stored by label (Mon..Sun). Map to JS day index (0=Sun..6=Sat)
      const checkedIndices: number[] = [];
      for (let i = 0; i < this.daysOfWeek.length; i++) {
        const label = this.daysOfWeek[i];
        if (s.daysOfWeek && s.daysOfWeek[label]) {
          const jsDay = (i === 6) ? 0 : i + 1; // Mon->1 ... Sun->0
          checkedIndices.push(jsDay);
        }
      }
      if (checkedIndices.length === 0) return null;
      const hour = Number(s.hour) || 0;
      const minute = Number(s.minute) || 0;
      const today = now.getDay();
      let best: Date | null = null;
      for (const d of checkedIndices) {
        let diff = (d - today + 7) % 7;
        const candidate = new Date(now.getTime());
        candidate.setDate(now.getDate() + diff);
        candidate.setHours(hour, minute, 0, 0);
        if (candidate <= now) {
          candidate.setDate(candidate.getDate() + 7);
        }
        if (!best || candidate < best) best = candidate;
      }
      return best;
    }
    if (s.frequencyType === 'monthly') {
      const hour = Number(s.hour) || 0;
      const minute = Number(s.minute) || 0;
      const interval = Math.max(1, Number(s.monthInterval) || 1);
      const checkedDays = (s.daysOfMonth) ? Object.keys(s.daysOfMonth).map(k => Number(k)).filter(n => !!s.daysOfMonth[n]).sort((a,b)=>a-b) : [];
      if (checkedDays.length === 0) return null;
      // Try months forward up to 24 months
      for (let mOff = 0; mOff < 24; mOff++) {
        const monthCandidate = new Date(now.getFullYear(), now.getMonth() + mOff, 1);
        if ((mOff % interval) !== 0) continue;
        for (const day of checkedDays) {
          const lastDay = new Date(monthCandidate.getFullYear(), monthCandidate.getMonth() + 1, 0).getDate();
          const dayVal = Math.min(day, lastDay);
          const candidate = new Date(monthCandidate.getFullYear(), monthCandidate.getMonth(), dayVal, hour, minute, 0, 0);
          if (candidate > now) return candidate;
        }
      }
      return null;
    }
    if (s.frequencyType === 'advanced') {
      // Use a global cronParser if the app provides one (e.g. via a script tag).
      // Do NOT use require() here — it's a Node-only API and breaks the browser build.
      try {
        const cronParser = (window as any).cronParser || null;
        if (cronParser && typeof cronParser.parseExpression === 'function') {
          const interval = cronParser.parseExpression(s.cron || '* * * * *', { currentDate: now });
          const next = interval.next().toDate();
          return next;
        }
      } catch (e) {
        // ignore and fallback
      }
      // Fallback when no parser is available
      return new Date(now.getTime() + 3600 * 1000);
    }
    return null;
  }

  pad(n: any) { return n.toString().padStart(2,'0'); }

  sendNow() {
    if (this.isSendingNow) return;
    this.isSendingNow = true;
    // Simulate send action with a short delay
    setTimeout(() => {
      this.isSendingNow = false;
      try {
        this.snackBar.open('✅ Output Report Sent', undefined, { duration: 2500 });
      } catch {
        // Fallback
        alert('Output Report Sent');
      }
    }, 1000);
  }

  onHistoricalFilterChange() {
    // Reapply date range filter on search term change
    this.applyHistoricalDateFilter();
  }

  onHistoricalDateRangeChange() {
    if (this.historicalDateRange === 'custom') {
      // Reset custom dates if switching away from custom range
      this.historicalCustomStartDate = null;
      this.historicalCustomEndDate = null;
    }
    this.applyHistoricalDateFilter();
  }

  applyHistoricalDateFilter() {
    let filtered = this.historicalOutputs;
    if (this.historicalDateRange !== 'all') {
      const now = new Date();
      let startDate = null;
      let endDate = null;
      if (this.historicalDateRange === 'last1') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      } else if (this.historicalDateRange === 'last30') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      } else if (this.historicalDateRange === 'last60') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);
      } else if (this.historicalDateRange === 'custom' && this.historicalCustomStartDate && this.historicalCustomEndDate) {
        startDate = new Date(this.historicalCustomStartDate);
        endDate = new Date(this.historicalCustomEndDate);
        endDate.setDate(endDate.getDate() + 1); // Include end date
      }
      if (startDate) {
        filtered = filtered.filter(output => new Date(output.date) >= startDate);
      }
      if (endDate) {
        filtered = filtered.filter(output => new Date(output.date) < endDate);
      }
    }
    // Apply search term filter
    if (this.historicalSearchTerm) {
      filtered = filtered.filter(output => output.filename.toLowerCase().includes(this.historicalSearchTerm.toLowerCase()));
    }
    this.filteredHistoricalOutputs = filtered;
  }

  exportHistoricalFile(output: any, type: string = 'csv') {
    if (!output) return;
    const dt = new Date(output.date);
    function escapeCsv(val: string) {
      if (val == null) return '';
      const s = String(val);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }

    if (type === 'json') {
      const content = JSON.stringify(output, null, 2);
      const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${output.filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      return;
    }

    // CSV / Excel output: build CSV row
    const headers = ['Filename', 'Date', 'Time'];
    const dateStr = dt.toISOString();
    const timeStr = dt.toTimeString().split(' ')[0];
    const row = [output.filename, dateStr, timeStr];
    const csv = [headers.join(','), row.map(escapeCsv).join(',')].join('\r\n');

    let mime = 'text/csv;charset=utf-8;';
    let ext = 'csv';
    if (type === 'excel') {
      mime = 'application/vnd.ms-excel';
      ext = 'xls';
    }

    const blob = new Blob([csv], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${output.filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
}
