var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
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
let ScheduleComponent = class ScheduleComponent {
    constructor(dialog) {
        this.dialog = dialog;
        this.schedules = [];
        this.displayedColumns = ['name', 'frequency', 'nextRun', 'actions'];
        this.selectedSchedule = null;
        this.timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
        this.daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        this.daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
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
                this.schedules.push(result);
            }
        });
    }
    openEditDialog(s) {
        const dialogRef = this.dialog.open(this.dialogTemplate, {
            data: { ...s, editing: true }, width: '400px', autoFocus: false
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.editing) {
                Object.assign(s, result);
            }
        });
    }
    saveDialog(data, dialogRef) {
        dialogRef.close(data);
    }
    toggleEnabled(s) {
        s.enabled = !s.enabled;
    }
    removeSchedule(s) {
        if (confirm('Remove this schedule?')) {
            this.schedules = this.schedules.filter(x => x !== s);
        }
    }
    getFrequencySummary(s) {
        if (s.frequencyType === 'hourly')
            return `Every hour at minute ${s.minute}`;
        if (s.frequencyType === 'daily')
            return `Every day at ${this.pad(s.hour)}:${this.pad(s.minute)}`;
        if (s.frequencyType === 'weekly') {
            const days = this.daysOfWeek.filter(d => s.daysOfWeek[d]).join(', ');
            return `Weekly on ${days} at ${this.pad(s.hour)}:${this.pad(s.minute)}`;
        }
        if (s.frequencyType === 'monthly') {
            const days = this.daysOfMonth.filter(d => s.daysOfMonth[d]).join(', ');
            return `Every ${s.monthInterval} month(s) on days ${days} at ${this.pad(s.hour)}:${this.pad(s.minute)}`;
        }
        if (s.frequencyType === 'advanced')
            return `Cron: ${s.cron}`;
        return '';
    }
    getNextRunText(s) {
        if (!s.enabled)
            return 'Disabled';
        // For demo, just show "in X hours" for daily/hourly, etc.
        const now = new Date();
        let next = null;
        if (s.frequencyType === 'hourly') {
            next = new Date(now.getTime());
            next.setMinutes(s.minute, 0, 0);
            if (next <= now)
                next.setHours(next.getHours() + 1);
        }
        else if (s.frequencyType === 'daily') {
            next = new Date(now.getTime());
            next.setHours(s.hour, s.minute, 0, 0);
            if (next <= now)
                next.setDate(next.getDate() + 1);
        }
        else if (s.frequencyType === 'weekly') {
            // Find next checked day
            const todayIdx = now.getDay();
            const checkedDays = this.daysOfWeek.map((d, i) => s.daysOfWeek[d] ? i + 1 : null).filter(x => x);
            let minDiff = 8, nextDay = null;
            for (const d of checkedDays) {
                let diff = (d - todayIdx + 7) % 7;
                if (diff === 0 && (now.getHours() > s.hour || (now.getHours() === s.hour && now.getMinutes() >= s.minute)))
                    diff = 7;
                if (diff < minDiff) {
                    minDiff = diff;
                    nextDay = d;
                }
            }
            next = new Date(now.getTime());
            next.setDate(now.getDate() + minDiff);
            next.setHours(s.hour, s.minute, 0, 0);
        }
        else if (s.frequencyType === 'monthly') {
            // Find next checked day
            const today = now.getDate();
            const checkedDays = this.daysOfMonth.filter(d => s.daysOfMonth[d]);
            let minDiff = 32, nextDay = null;
            for (const d of checkedDays) {
                let diff = (d - today + 31) % 31;
                if (diff === 0 && (now.getHours() > s.hour || (now.getHours() === s.hour && now.getMinutes() >= s.minute)))
                    diff = 31;
                if (diff < minDiff) {
                    minDiff = diff;
                    nextDay = d;
                }
            }
            next = new Date(now.getTime());
            next.setMonth(now.getMonth() + s.monthInterval);
            next.setDate(nextDay || 1);
            next.setHours(s.hour, s.minute, 0, 0);
        }
        else if (s.frequencyType === 'advanced') {
            // For demo, just show "in 1 hour"; real cron parsing would use a library
            next = new Date(now.getTime() + 3600 * 1000);
        }
        if (!next)
            return '';
        const diffMs = next.getTime() - now.getTime();
        if (diffMs < 60000)
            return 'in a few seconds';
        if (diffMs < 3600000)
            return `in ${Math.round(diffMs / 60000)} min`;
        if (diffMs < 86400000)
            return `in ${Math.round(diffMs / 3600000)} hours`;
        return `in ${Math.round(diffMs / 86400000)} days`;
    }
    pad(n) { return n.toString().padStart(2, '0'); }
};
ScheduleComponent = __decorate([
    Component({
        selector: 'schedule-view',
        standalone: true,
        imports: [
            CommonModule, FormsModule,
            MatTableModule, MatDialogModule, MatButtonModule, MatIconModule, MatMenuModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatRadioModule, MatCheckboxModule
        ],
        template: `
    <section class="p-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Schedules</h2>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Add New Schedule
        </button>
      </div>

      <table mat-table [dataSource]="schedules" class="mat-elevation-z1 w-full mb-6">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let s">{{s.name}}</td>
        </ng-container>
        <ng-container matColumnDef="frequency">
          <th mat-header-cell *matHeaderCellDef>Frequency</th>
          <td mat-cell *matCellDef="let s">{{getFrequencySummary(s)}}</td>
        </ng-container>
        <ng-container matColumnDef="nextRun">
          <th mat-header-cell *matHeaderCellDef>Next Run</th>
          <td mat-cell *matCellDef="let s">{{getNextRunText(s)}}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let s">
            <button mat-icon-button [matMenuTriggerFor]="menu" (click)="selectedSchedule=s">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="openEditDialog(s)"><mat-icon>edit</mat-icon> Edit</button>
              <button mat-menu-item (click)="toggleEnabled(s)"><mat-icon>{{s.enabled ? 'block' : 'check_circle'}}</mat-icon> {{s.enabled ? 'Disable' : 'Enable'}}</button>
              <button mat-menu-item (click)="removeSchedule(s)"><mat-icon>delete</mat-icon> Remove</button>
            </mat-menu>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        <tr *ngIf="schedules.length===0"><td colspan="4" class="text-center py-6 text-slate-500">No schedules found.</td></tr>
      </table>

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
    }),
    __metadata("design:paramtypes", [MatDialog])
], ScheduleComponent);
export { ScheduleComponent };
//# sourceMappingURL=schedule.component.js.map