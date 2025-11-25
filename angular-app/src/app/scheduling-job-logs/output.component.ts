import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'output-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="output-settings-formats" aria-labelledby="output-title">
      <div class="flex items-center justify-center mb-4">
        <h1 id="output-title" class="text-2xl font-bold">Output & Job Report Section</h1>
      </div>

      <!-- Two-card side-by-side layout -->
      <div class="w-full bg-gray-50 py-4">
        <div class="px-4 md:px-6 max-w-5xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
            <!-- Left Card: Output Settings -->
            <div class="rounded-2xl bg-white border border-gray-100 shadow p-5 h-full">
              <h2 class="text-lg font-semibold mb-3">Output Settings</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Output Format</label>
                  <select class="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[40px]" [(ngModel)]="format">
                    <option value="excel">Excel (XLSX)</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <button class="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed" (click)="saveSettings()" [disabled]="saving" title="Save settings">
                    <svg *ngIf="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="3" stroke="currentColor" fill="none" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none"/></svg>
                    <span>Save</span>
                  </button>
                  <button class="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors" (click)="downloadOutput()" title="Download sample">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                    <span>Download Sample</span>
                  </button>
                  <div *ngIf="saveMessage" class="text-sm text-emerald-700">{{ saveMessage }}</div>
                </div>
              </div>
            </div>

            <!-- Right Card: Job Reports -->
            <div class="rounded-2xl bg-white border border-gray-100 shadow p-5 h-full">
              <h2 class="text-lg font-semibold mb-3">Job Reports</h2>
              <div class="space-y-4">
                <div class="flex flex-wrap items-center gap-3">
                  <div class="flex items-center gap-2">
                    <button type="button" role="switch" [attr.aria-checked]="jobReportsEnabled" (click)="toggleReports()"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            [class.bg-blue-600]="jobReportsEnabled" [class.bg-gray-300]="!jobReportsEnabled" title="Enable Job Report Output">
                      <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
                            [class.translate-x-6]="jobReportsEnabled" [class.translate-x-1]="!jobReportsEnabled"></span>
                    </button>
                    <span class="text-sm select-none">Enable Job Report Output</span>
                    <span class="text-slate-500" title="When enabled, output files will be created for both Success and Error transactions.">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </span>
                  </div>
                </div>

                <div>
                  <button class="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors" (click)="downloadSample()" title="Download sample">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                    <span>Download Sample</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="toastMessage" class="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded shadow toast" role="status" aria-live="polite">{{ toastMessage }}</div>
    </section>

    <!-- Output Connectors (appended at bottom) -->
    <section id="output-settings-connectors" aria-labelledby="connectors-title" class="mt-10">
      <div class="flex items-center justify-between mb-4 px-4 md:px-6">
        <h1 id="connectors-title" class="text-2xl font-bold">Output Channels</h1>
      </div>

      <div class="px-4 md:px-6">
        <div class="rounded-2xl bg-white p-6 border border-gray-100 shadow-md">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-semibold">Configured Channels</h2>
            <button class="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors" (click)="openConnectorModal()">
              <span aria-hidden="true">＋</span>
              <span>Add Channel</span>
            </button>
          </div>
          <div class="overflow-auto">
            <table class="w-full text-sm">
              <thead class="text-left text-slate-600">
                <tr>
                  <th class="py-2">Name</th>
                  <th class="py-2">Type</th>
                  <th class="py-2">Status</th>
                  <th class="py-2">Last Run</th>
                  <th class="py-2">Success</th>
                  <th class="py-2">Fail</th>
                  <th class="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of rows" class="hover:bg-slate-50 odd:bg-white even:bg-slate-50">
                  <td class="py-3 font-medium">{{ r.name }}</td>
                  <td class="py-3 text-slate-700 flex items-center gap-2">
                    <span class="text-lg">{{ connectorIcon(r.type) }}</span>
                    <span>{{ connectorLabel(r.type) }}</span>
                  </td>
                  <td class="py-3">
                    <span [ngClass]="r.status === 'enabled' ? 'inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800' : 'inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700'">
                      {{ r.status === 'enabled' ? 'Enabled' : 'Disabled' }}
                    </span>
                  </td>
                  <td class="py-3 text-slate-600">{{ r.lastRun }}</td>
                  <td class="py-3">{{ r.successes }}</td>
                  <td class="py-3">{{ r.failures }}</td>
                  <td class="py-3 text-right">
                    <div class="flex justify-end gap-2 items-center">
                      <button [ngClass]="r.status === 'enabled' ? 'px-2 py-1 rounded bg-red-600 text-white text-sm' : 'px-2 py-1 rounded border text-sm'" (click)="toggleEnabled(r)">{{ r.status === 'enabled' ? 'Disable' : 'Enable' }}</button>
                      <button class="px-2 py-1 rounded border text-sm">Edit</button>
                      <button class="px-2 py-1 rounded bg-blue-600 text-white text-sm">Run Now</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          
        </div>
      </div>
    </section>

    <!-- Modal: Create Connector -->
    <div *ngIf="showConnectorModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/50" (click)="closeConnectorModal()" aria-hidden="true"></div>
      <div class="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-semibold">Create Connector</h3>
          <button class="p-2 rounded hover:bg-slate-100" (click)="closeConnectorModal()" aria-label="Close">✕</button>
        </div>
        <p class="text-sm text-slate-600 mb-4">Deliver parsed outputs to email, APIs, storage and more.</p>

        <div class="space-y-4 max-h-[70vh] overflow-auto pr-1">
          <div>
            <label class="text-xs font-medium">Type</label>
            <select class="mt-1 w-full px-3 py-2 rounded border" [(ngModel)]="selectedType">
              <option *ngFor="let t of connectorTypes" [value]="t.slug">{{ t.label }}</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-medium">Name</label>
            <input class="mt-1 w-full px-3 py-2 rounded border" placeholder="e.g., Finance Email" [(ngModel)]="name" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="flex items-center justify-between border rounded-xl px-3 py-2">
              <label class="font-medium">Enabled</label>
              <input type="checkbox" [(ngModel)]="enabled" />
            </div>
            <div>
              <label class="text-xs font-medium">Output Format</label>
              <select class="mt-1 w-full px-3 py-2 rounded border" [(ngModel)]="connectorFormat">
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="xml">XML</option>
              </select>
            </div>
          </div>

          <!-- Dynamic forms (per connector type) -->
          <div *ngIf="selectedType === 'email_smtp'" class="space-y-2 border rounded-2xl p-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input class="px-3 py-2 rounded border" placeholder="smtp.example.com" [(ngModel)]="smtpHost" />
              <input class="px-3 py-2 rounded border" placeholder="587" [(ngModel)]="smtpPort" />
              <input class="px-3 py-2 rounded border" placeholder="service@company.com" [(ngModel)]="smtpUser" />
              <input class="px-3 py-2 rounded border" placeholder="••••••" [(ngModel)]="smtpPass" />
            </div>
            <div class="grid grid-cols-1 gap-2">
              <input class="px-3 py-2 rounded border" placeholder="From (email)" [(ngModel)]="smtpFrom" />
              <input class="px-3 py-2 rounded border" placeholder="To (comma-separated)" [(ngModel)]="smtpTo" />
              <input class="px-3 py-2 rounded border" placeholder="Subject Template" [(ngModel)]="smtpSubjectTemplate" />
              <textarea class="px-3 py-2 rounded border" rows="4" placeholder="Body" [(ngModel)]="smtpBody"></textarea>
            </div>
          </div>

          <div *ngIf="selectedType === 'email_graph'" class="space-y-2 border rounded-2xl p-3">
            <p class="text-sm text-slate-600">Authenticate with Microsoft Graph OAuth; we store refresh tokens securely.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input class="px-3 py-2 rounded border" placeholder="Tenant ID" [(ngModel)]="emailGraphTenantId" />
              <input class="px-3 py-2 rounded border" placeholder="Client ID" [(ngModel)]="emailGraphClientId" />
            </div>
            <div class="mt-2">
              <button class="w-full px-3 py-2 rounded border" (click)="connectMicrosoftAccount()">Connect Microsoft Account</button>
            </div>
          </div>

          <div *ngIf="selectedType === 'http_post'" class="space-y-2 border rounded-2xl p-3">
            <div>
              <label class="text-xs font-medium">Endpoint URL</label>
              <input class="mt-1 w-full px-3 py-2 rounded border" placeholder="https://api.example.com/webhooks/glyphx" [(ngModel)]="apiEndpoint" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label class="text-xs font-medium">Method</label>
                <select class="mt-1 w-full px-3 py-2 rounded border" [(ngModel)]="apiMethod">
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-medium">Auth</label>
                <select class="mt-1 w-full px-3 py-2 rounded border" [(ngModel)]="apiAuth">
                  <option value="none">None</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="api_key">API Key (header)</option>
                </select>
              </div>
            </div>
            <div>
              <label class="text-xs font-medium">Headers (JSON)</label>
              <textarea class="mt-1 w-full px-3 py-2 rounded border" rows="3" [(ngModel)]="apiHeaders" placeholder='{"X-API-Key":"..."}'></textarea>
            </div>
            <div>
              <label class="text-xs font-medium">Body Template</label>
              <textarea class="mt-1 w-full px-3 py-2 rounded border" rows="4" [(ngModel)]="apiBodyTemplate" placeholder='{"docId":"{DocId}","docType":"{DocType}","payload":{Payload}}'></textarea>
            </div>
          </div>

          <div *ngIf="selectedType === 'local_fs'" class="space-y-2 border rounded-2xl p-3">
            <div>
              <label class="text-xs font-medium">Path</label>
              <input class="mt-1 w-full px-3 py-2 rounded border" placeholder="/mnt/exports or \\NAS01\\exports" [(ngModel)]="localPath" />
            </div>
            <div>
              <label class="text-xs font-medium">File Pattern</label>
              <input class="mt-1 w-full px-3 py-2 rounded border" placeholder="{DocType}_{DocId}_{yyyyMMdd}.json" [(ngModel)]="localPattern" />
            </div>
          </div>

          <div *ngIf="selectedType === 's3_sink'" class="space-y-2 border rounded-2xl p-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input class="px-3 py-2 rounded border" placeholder="glyphx-exports" [(ngModel)]="s3Bucket" />
              <input class="px-3 py-2 rounded border" placeholder="ap-southeast-1" [(ngModel)]="s3Region" />
              <input class="px-3 py-2 rounded border" placeholder="AKIAXXXXX" [(ngModel)]="s3AccessKey" />
              <input class="px-3 py-2 rounded border" placeholder="••••••" [(ngModel)]="s3SecretKey" />
            </div>
            <div>
              <label class="text-xs font-medium">Key Prefix</label>
              <input class="mt-1 w-full px-3 py-2 rounded border" placeholder="exports/{DocType}/" [(ngModel)]="s3Prefix" />
            </div>
          </div>

          <div *ngIf="selectedType === 'azure_blob'" class="space-y-2 border rounded-2xl p-3">
            <div>
              <label class="text-xs font-medium">Connection String</label>
              <input class="mt-1 w-full px-3 py-2 rounded border" placeholder="DefaultEndpointsProtocol=https;AccountName=..." [(ngModel)]="azureConnectionString" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input class="px-3 py-2 rounded border" placeholder="glyphx-exports" [(ngModel)]="azureContainer" />
              <input class="px-3 py-2 rounded border" placeholder="exports/{DocType}/" [(ngModel)]="azurePrefix" />
            </div>
          </div>

          <div *ngIf="selectedType === 'gdrive'" class="space-y-2 border rounded-2xl p-3">
            <p class="text-sm text-slate-600">Connect your Google account and choose the destination folder.</p>
            <div class="grid grid-cols-1 gap-2">
              <button class="w-full px-3 py-2 rounded border" (click)="connectGoogleAccount()">Connect Google Drive</button>
              <input class="px-3 py-2 rounded border" placeholder="Folder ID / Path" [(ngModel)]="gdriveFolder" />
            </div>
          </div>

          <div *ngIf="selectedType === 'sharepoint'" class="space-y-2 border rounded-2xl p-3">
            <div>
              <label class="text-xs font-medium">Site URL</label>
              <input class="mt-1 w-full px-3 py-2 rounded border" placeholder="https://contoso.sharepoint.com/sites/ops" [(ngModel)]="spSiteUrl" />
            </div>
            <div>
              <label class="text-xs font-medium">Library / Folder</label>
              <input class="mt-1 w-full px-3 py-2 rounded border" placeholder="Shared Documents/Exports" [(ngModel)]="spLibrary" />
            </div>
          </div>

          <div *ngIf="selectedType === 'postgres'" class="space-y-2 border rounded-2xl p-3">
            <div>
              <label class="text-xs font-medium">Connection URI</label>
              <input class="mt-1 w-full px-3 py-2 rounded border" placeholder="postgres://user:pass@host:5432/db" [(ngModel)]="pgUri" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input class="px-3 py-2 rounded border" placeholder="public.glyphx_exports" [(ngModel)]="pgTable" />
              <select class="px-3 py-2 rounded border" [(ngModel)]="pgInsertMode">
                <option value="insert">Insert</option>
                <option value="upsert">Upsert (on conflict)</option>
              </select>
            </div>
          </div>

          <div *ngIf="selectedType === 'snowflake'" class="space-y-2 border rounded-2xl p-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input class="px-3 py-2 rounded border" placeholder="Account" [(ngModel)]="snowAccount" />
              <input class="px-3 py-2 rounded border" placeholder="Warehouse" [(ngModel)]="snowWarehouse" />
              <input class="px-3 py-2 rounded border" placeholder="User" [(ngModel)]="snowUser" />
              <input class="px-3 py-2 rounded border" placeholder="Password / Key" [(ngModel)]="snowPassword" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input class="px-3 py-2 rounded border" placeholder="Database.Schema" [(ngModel)]="snowDatabaseSchema" />
              <input class="px-3 py-2 rounded border" placeholder="Table" [(ngModel)]="snowTable" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="text-xs font-medium">Retries</label>
              <input type="number" class="mt-1 w-full px-3 py-2 rounded border" [(ngModel)]="retry" min="0" max="10" />
            </div>
            <div>
              <label class="text-xs font-medium">Timeout (ms)</label>
              <input type="number" class="mt-1 w-full px-3 py-2 rounded border" [(ngModel)]="timeout" min="1000" step="500" />
            </div>
            <div class="flex items-end">
              <button class="w-full px-3 py-2 rounded border" (click)="testConnection()">Test Connection</button>
            </div>
          </div>

          <div *ngIf="testResult" class="text-xs text-slate-600">{{ testResult }}</div>
        </div>

        <div class="mt-4 flex gap-2 justify-end">
          <button class="px-3 py-2 rounded border" (click)="closeConnectorModal()">Cancel</button>
          <button class="px-3 py-2 rounded bg-indigo-600 text-white" (click)="saveConnector()">Save Connector</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .toast { animation: fadeInUp 0.2s ease-out; }
  `]
})
export class OutputComponent {
  // UI state
  format: 'excel'|'csv'|'json' = 'excel';
  saving = false;
  saveMessage = '';
  toastMessage = '';
  jobReportsEnabled = false;
  showConnectorModal = false;

  // Connectors state
  connectorTypes = [
    { slug: 'email_smtp', label: 'Email (SMTP)' },
    { slug: 'email_graph', label: 'Email (Outlook Graph)' },
    { slug: 'http_post', label: 'HTTP POST (API)' },
    { slug: 'webhook', label: 'Webhook Receiver' },
    { slug: 'local_fs', label: 'Local / Network Drive' },
    { slug: 's3_sink', label: 'Amazon S3' },
    { slug: 'azure_blob', label: 'Azure Blob Storage' },
    { slug: 'gdrive', label: 'Google Drive' },
    { slug: 'sharepoint', label: 'SharePoint' },
    { slug: 'sftp_sink', label: 'SFTP' },
    { slug: 'kafka_topic', label: 'Kafka Topic' },
    { slug: 'postgres', label: 'PostgreSQL' },
    { slug: 'snowflake', label: 'Snowflake' },
  ];

  selectedType = 'email_smtp';
  name = '';
  enabled = true;
  connectorFormat = 'json';
  retry = 3;
  timeout = 15000;
  testResult: string | null = null;

  smtpHost = '';
  smtpPort = '587';
  smtpUser = '';
  smtpPass = '';
  smtpFrom = '';
  smtpTo = '';
  smtpSubjectTemplate = '';
  smtpBody = '';

  // API (http_post)
  apiEndpoint = '';
  apiMethod = 'POST';
  apiAuth = 'none';
  apiHeaders = '';
  apiBodyTemplate = '';

  // Local FS
  localPath = '';
  localPattern = '';

  // S3
  s3Bucket = '';
  s3Region = '';
  s3AccessKey = '';
  s3SecretKey = '';
  s3Prefix = '';

  // Azure Blob
  azureConnectionString = '';
  azureContainer = '';
  azurePrefix = '';

  // Google Drive
  gdriveFolder = '';
  // Email Graph
  emailGraphTenantId = '';
  emailGraphClientId = '';

  // SharePoint
  spSiteUrl = '';
  spLibrary = '';

  // Postgres
  pgUri = '';
  pgTable = '';
  pgInsertMode = 'upsert';

  // Snowflake
  snowAccount = '';
  snowWarehouse = '';
  snowUser = '';
  snowPassword = '';
  snowDatabaseSchema = '';
  snowTable = '';

  rows = [
    { id: 'CN-001', name: 'Finance Email', type: 'email_smtp', status: 'enabled', lastRun: '2025-10-18 11:12', successes: 142, failures: 2 },
    { id: 'CN-002', name: 'ERP Webhook', type: 'http_post', status: 'enabled', lastRun: '2025-10-18 10:58', successes: 340, failures: 12 },
    { id: 'CN-003', name: 'Local Archive', type: 'local_fs', status: 'disabled', lastRun: '2025-10-17 19:21', successes: 980, failures: 0 },
  ];

  saveSettings() {
    if (this.saving) return;
    this.saving = true;
    this.saveMessage = '';
    setTimeout(() => {
      this.saving = false;
      this.saveMessage = '✅ Settings saved successfully!';
      this.showToast('✅ Settings saved successfully!');
      setTimeout(() => this.saveMessage = '', 2500);
    }, 1200);
  }

  downloadOutput() {
    const now = new Date().toISOString().replace(/[:.]/g,'-');
    if (this.format === 'json') {
      const blob = new Blob([JSON.stringify({ sample: true, time: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      this.triggerDownload(blob, `output-${now}.json`);
    } else if (this.format === 'csv') {
      const csv = 'Field,Value\nSample,True\nTime,' + new Date().toISOString();
      const blob = new Blob([csv], { type: 'text/csv' });
      this.triggerDownload(blob, `output-${now}.csv`);
    } else if (this.format === 'excel') {
      const csv = 'Field,Value\nSample,True\nTime,' + new Date().toISOString();
      const blob = new Blob([csv], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      this.triggerDownload(blob, `output-${now}.xlsx`);
    }
  }

  downloadSample() {
    const now = new Date().toISOString().replace(/[:.]/g,'-');
    const csv = 'JobId,Status,Count\n123,Success,10\n123,Error,2';
    const blob = new Blob([csv], { type: 'text/csv' });
    this.triggerDownload(blob, `sample-job-report-${now}.csv`);
  }

  private triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  private showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 2500);
  }

  toggleReports() {
    this.jobReportsEnabled = !this.jobReportsEnabled;
  }

  openConnectorModal() {
    this.resetForm();
    this.showConnectorModal = true;
  }

  closeConnectorModal() {
    this.showConnectorModal = false;
  }

  // Connectors methods
  testConnection() {
    this.testResult = 'Testing…';
    setTimeout(() => {
      this.testResult = '✅ Connection successful: latency 124ms';
    }, 600);
  }

  saveConnector() {
    if (!this.name || !this.name.trim()) {
      alert('Please provide a connector name');
      return;
    }
    const id = `CN-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const config: any = {};
    // Populate type-specific config
    if (this.selectedType === 'http_post') {
      config.endpoint = this.apiEndpoint;
      config.method = this.apiMethod;
      config.auth = this.apiAuth;
      config.headers = this.apiHeaders;
      config.bodyTemplate = this.apiBodyTemplate;
    } else if (this.selectedType === 'email_smtp') {
      config.smtpHost = this.smtpHost;
      config.smtpPort = this.smtpPort;
      config.smtpUser = this.smtpUser;
      config.smtpPass = this.smtpPass;
      config.from = this.smtpFrom;
      config.to = this.smtpTo;
      config.subjectTemplate = this.smtpSubjectTemplate;
      config.body = this.smtpBody;
    } else if (this.selectedType === 'email_graph') {
      config.tenantId = this.emailGraphTenantId;
      config.clientId = this.emailGraphClientId;
    } else if (this.selectedType === 'local_fs') {
      config.path = this.localPath;
      config.pattern = this.localPattern;
    } else if (this.selectedType === 's3_sink') {
      config.bucket = this.s3Bucket;
      config.region = this.s3Region;
      config.accessKey = this.s3AccessKey;
      config.secretKey = this.s3SecretKey;
      config.prefix = this.s3Prefix;
    } else if (this.selectedType === 'azure_blob') {
      config.connectionString = this.azureConnectionString;
      config.container = this.azureContainer;
      config.prefix = this.azurePrefix;
    } else if (this.selectedType === 'gdrive') {
      config.folder = this.gdriveFolder;
    } else if (this.selectedType === 'sharepoint') {
      config.siteUrl = this.spSiteUrl;
      config.library = this.spLibrary;
    } else if (this.selectedType === 'postgres') {
      config.uri = this.pgUri;
      config.table = this.pgTable;
      config.insertMode = this.pgInsertMode;
    }

    const newRow = { id, name: this.name, type: this.selectedType, status: this.enabled ? 'enabled' : 'disabled', lastRun: '—', successes: 0, failures: 0, config };
    this.rows = [newRow, ...this.rows];
    this.testResult = null;
    this.closeConnectorModal();
    this.showToast('✅ Connector saved');
  }

  resetForm() {
    this.name = '';
    this.enabled = true;
    this.connectorFormat = 'json';
    this.smtpHost = '';
    this.smtpPort = '587';
    this.smtpUser = '';
    this.smtpPass = '';
    this.smtpFrom = '';
    this.smtpTo = '';
    this.smtpSubjectTemplate = '';
    this.smtpBody = '';
    this.emailGraphTenantId = '';
    this.emailGraphClientId = '';
    this.gdriveFolder = '';
    this.snowAccount = '';
    this.snowWarehouse = '';
    this.snowUser = '';
    this.snowPassword = '';
    this.snowDatabaseSchema = '';
    this.snowTable = '';
  }

  connectMicrosoftAccount() {
    alert('Connect Microsoft Account (stub)');
  }

  connectGoogleAccount() {
    alert('Connect Google Account (stub)');
  }

  connectorLabel(slug: string) {
    const found = this.connectorTypes.find(c => c.slug === slug);
    return found ? found.label : slug;
  }

  connectorIcon(slug: string) {
    switch (slug) {
      case 'email_smtp': return '✉️';
      case 'email_graph': return '📧';
      case 'http_post': return '🌐';
      case 'webhook': return '🔗';
      case 'local_fs': return '💾';
      case 's3_sink': return '🗄️';
      case 'azure_blob': return '☁️';
      case 'gdrive': return '📁';
      case 'sharepoint': return '📂';
      case 'sftp_sink': return '🔒';
      case 'kafka_topic': return '⚡';
      case 'postgres': return '🗄️';
      case 'snowflake': return '❄️';
      default: return '🔌';
    }
  }

  toggleEnabled(row: any) {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled';
  }
}
