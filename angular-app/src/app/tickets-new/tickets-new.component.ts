import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'tickets-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="tickets-new" class="view" aria-labelledby="ticket-title">
      <div class="flex items-center justify-between mb-4">
        <h1 id="ticket-title" class="text-2xl font-bold">Tickets</h1>
        <div class="flex items-center gap-3">
          <input placeholder="Search tickets" class="rounded-md border px-2 py-1 text-sm" [(ngModel)]="q" />
          <select [(ngModel)]="filterStatus" class="rounded-md border px-2 py-1 text-sm">
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
          <button (click)="openNew()" class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-sm">New Ticket</button>
        </div>
      </div>

      <div class="rounded-2xl bg-white p-4 border border-slate-200">
        <div *ngIf="filteredTickets.length===0" class="text-sm text-slate-500">No tickets found.</div>
        <ul *ngIf="filteredTickets.length>0" class="divide-y">
          <li *ngFor="let t of filteredTickets" class="py-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div class="md:col-span-2">
              <div class="font-medium text-slate-800">{{ t.title }}</div>
              <div class="text-xs text-slate-500">#{{ t.id }} — {{ t.project }} — {{ t.severity }}</div>
              <div class="text-sm text-slate-600 mt-1">{{ t.description }}</div>
            </div>

            <div class="text-right md:text-left md:flex md:flex-col md:items-end md:justify-between">
              <div class="text-xs text-slate-500">Submitted: <span class="text-slate-700">{{ t.dateSubmitted | date:'short' }}</span></div>
              <div class="text-xs text-slate-500">By: <span class="text-slate-700">{{ t.reporter || '-' }}</span></div>
              <div class="mt-2">
                <span [ngClass]="statusBadgeClass(t.status)" class="px-2 py-1 rounded-full text-xs font-medium inline-block">{{ t.status }}</span>
              </div>
              <div class="mt-2">
                <button (click)="editDraft(t)" *ngIf="t.status==='draft'" class="px-2 py-1 rounded bg-amber-100 text-amber-700 text-sm">Edit</button>
                <button (click)="viewTicket(t)" class="ml-2 px-2 py-1 rounded bg-slate-100 text-slate-700 text-sm">View</button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- New Ticket Modal -->
      <div *ngIf="showNew" class="fixed inset-0 z-50 flex items-start justify-center pt-24">
        <div class="absolute inset-0 bg-black/40" (click)="closeNew()"></div>
        <div class="relative bg-white w-full max-w-3xl rounded-2xl shadow-lg border border-slate-200">
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h3 class="text-lg font-semibold">New Ticket</h3>
            <button (click)="closeNew()" class="p-2 rounded hover:bg-slate-100">✕</button>
          </div>
          <form (submit)="submit($event)" class="px-6 py-4 space-y-4 max-h-[70vh] overflow-auto">
            <!-- Reporter & Context -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-slate-600">Full Name</label>
                <input type="text" [(ngModel)]="form.reporterName" name="reporterName" class="mt-1 w-full px-3 py-2 rounded-xl border" />
              </div>
              <div>
                <label class="text-sm text-slate-600">Contact Email *</label>
                <input type="email" [(ngModel)]="form.reporterEmail" name="reporterEmail" required class="mt-1 w-full px-3 py-2 rounded-xl border" />
              </div>
              <div>
                <label class="text-sm text-slate-600">Environment</label>
                <input type="text" [(ngModel)]="form.environment" name="environment" class="mt-1 w-full px-3 py-2 rounded-xl border" />
              </div>
              <div>
                <label class="text-sm text-slate-600">Page URL</label>
                <div class="flex gap-2 mt-1">
                  <input type="text" [(ngModel)]="form.pageUrl" name="pageUrl" class="flex-1 px-3 py-2 rounded-xl border" />
                  <button type="button" (click)="useCurrentUrl()" class="px-3 py-2 rounded bg-slate-100 text-sm">Use Current</button>
                </div>
              </div>
              <div>
                <label class="text-sm text-slate-600">Device / Browser</label>
                <div class="flex gap-2 mt-1">
                  <input type="text" [(ngModel)]="form.device" name="device" class="flex-1 px-3 py-2 rounded-xl border" />
                  <button type="button" (click)="detectDevice()" class="px-3 py-2 rounded bg-slate-100 text-sm">Detect</button>
                </div>
              </div>
            </div>

            <!-- Ticket Details -->
            <div>
              <label class="text-sm text-slate-600">Title *</label>
              <input type="text" [(ngModel)]="form.title" name="title" required class="mt-1 w-full px-3 py-2 rounded-xl border" />
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-sm text-slate-600">Project</label>
                <input type="text" [(ngModel)]="form.project" name="project" class="mt-1 w-full px-3 py-2 rounded-xl border" />
              </div>
              <div>
                <label class="text-sm text-slate-600">Category</label>
                <input type="text" [(ngModel)]="form.category" name="category" class="mt-1 w-full px-3 py-2 rounded-xl border" />
              </div>
              <div>
                <label class="text-sm text-slate-600">Severity</label>
                <select [(ngModel)]="form.severity" name="severity" class="mt-1 w-full px-3 py-2 rounded-xl border">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-sm text-slate-600">Description *</label>
              <textarea [(ngModel)]="form.description" name="description" required class="mt-1 w-full px-3 py-2 rounded-xl border h-28"></textarea>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-sm text-slate-600">Expected</label>
                <input type="text" [(ngModel)]="form.expected" name="expected" class="mt-1 w-full px-3 py-2 rounded-xl border" />
              </div>
              <div>
                <label class="text-sm text-slate-600">Actual</label>
                <input type="text" [(ngModel)]="form.actual" name="actual" class="mt-1 w-full px-3 py-2 rounded-xl border" />
              </div>
              <div>
                <label class="text-sm text-slate-600">Steps to Reproduce</label>
                <input type="text" [(ngModel)]="form.steps" name="steps" class="mt-1 w-full px-3 py-2 rounded-xl border" />
              </div>
            </div>

            <!-- Attachments & Tags -->
            <div>
              <label class="text-sm text-slate-600">Attachments (screenshots / files, max 6)</label>
              <input #fileInput type="file" multiple (change)="onFiles($event)" class="mt-1" />
              <div class="text-xs text-slate-500 mt-1">{{ files.length }} files selected (max 6)</div>
              <div class="flex gap-2 flex-wrap mt-2">
                <span *ngFor="let f of files; let i = index" class="px-2 py-1 rounded bg-slate-100 text-slate-700 text-sm">{{ f.name }} <button (click)="removeFile(i)" class="ml-2 text-rose-600">✕</button></span>
              </div>
            </div>

            <div>
              <label class="text-sm text-slate-600">Tags</label>
              <input type="text" [(ngModel)]="form.tags" name="tags" placeholder="comma separated" class="mt-1 w-full px-3 py-2 rounded-xl border" />
            </div>

            <!-- Options -->
            <div class="flex gap-4 items-center">
              <label class="inline-flex items-center gap-2"><input type="checkbox" [(ngModel)]="form.markUrgent" name="markUrgent"/> Mark as Urgent</label>
              <label class="inline-flex items-center gap-2"><input type="checkbox" [(ngModel)]="form.escalateOnCall" name="escalateOnCall"/> Escalate to On Call</label>
              <label class="inline-flex items-center gap-2"><input type="checkbox" [(ngModel)]="form.includeConsole" name="includeConsole"/> Include Console Logs</label>
              <label class="inline-flex items-center gap-2"><input type="checkbox" [(ngModel)]="form.notifyMe" name="notifyMe"/> Notify me on Updates</label>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button type="button" (click)="saveDraft()" class="px-3 py-2 rounded-xl bg-slate-100">Save Draft</button>
              <button type="submit" class="px-3 py-2 rounded-xl bg-indigo-600 text-white">Submit Ticket</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `
})
export class TicketsNewComponent {
  q = '';
  filterStatus = '';
  showNew = false;
  files: File[] = [];

  tickets: any[] = [
    { id: 1, title: 'Sample bug: login', project: 'AP UI', severity: 'High', description: 'Cannot login', status: 'open', dateSubmitted: new Date(), reporter: 'alice@example.com' },
    { id: 2, title: 'Draft: missing icon', project: 'Glyphx', severity: 'Low', description: 'Icon missing on header', status: 'draft', dateSubmitted: new Date(), reporter: 'bob@example.com' }
  ];

  form: any = {
    reporterName: '', reporterEmail: '', environment: '', pageUrl: '', device: '',
    title: '', project: '', category: '', severity: 'Medium', description: '', expected: '', actual: '', steps: '', tags: '',
    markUrgent: false, escalateOnCall: false, includeConsole: false, notifyMe: true
  };

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  get filteredTickets() {
    const q = this.q.trim().toLowerCase();
    return this.tickets.filter(t => {
      if (this.filterStatus && t.status !== this.filterStatus) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q) || String(t.id) === q;
    });
  }

  openNew() { this.showNew = true; }
  closeNew() { this.showNew = false; }

  useCurrentUrl() { try { this.form.pageUrl = window.location.href; } catch (e) { } }
  detectDevice() { try { this.form.device = navigator.userAgent; } catch (e) { } }

  onFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files) return;
    const incoming = Array.from(input.files);
    const combined = [...this.files, ...incoming].slice(0, 6);
    this.files = combined;
    // reset input to allow same-file re-add
    if (this.fileInput && this.fileInput.nativeElement) this.fileInput.nativeElement.value = '';
  }

  removeFile(i: number) { this.files.splice(i, 1); }

  saveDraft() {
    const id = this.tickets.length + 1;
    this.tickets.push({ id, title: this.form.title || 'Draft', project: this.form.project, severity: this.form.severity, description: this.form.description, status: 'draft', dateSubmitted: new Date(), reporter: this.form.reporterEmail || '' });
    this.closeNew();
  }

  submit(e: Event) {
    e.preventDefault();
    if (!this.form.reporterEmail || !this.form.title || !this.form.description) {
      alert('Please fill required fields (email, title, description)');
      return;
    }
  const id = this.tickets.length + 1;
  this.tickets.push({ id, title: this.form.title, project: this.form.project, severity: this.form.severity, description: this.form.description, status: 'open', dateSubmitted: new Date(), reporter: this.form.reporterEmail || '' });
    this.closeNew();
    // reset form lightly
    this.form = { reporterName: '', reporterEmail: '', environment: '', pageUrl: '', device: '', title: '', project: '', category: '', severity: 'Medium', description: '', expected: '', actual: '', steps: '', tags: '', markUrgent: false, escalateOnCall: false, includeConsole: false, notifyMe: true };
    this.files = [];
    alert('Ticket submitted (client-side only)');
  }

  editDraft(t:any) { this.form = { ...this.form, title: t.title, project: t.project, severity: t.severity, description: t.description }; this.openNew(); }
  viewTicket(t:any) { alert('Viewing ticket #' + t.id + '\n\n' + JSON.stringify(t, null, 2)); }

  statusBadgeClass(status: string) {
    switch ((status||'').toLowerCase()) {
      case 'open': return 'bg-emerald-100 text-emerald-700';
      case 'draft': return 'bg-amber-100 text-amber-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
