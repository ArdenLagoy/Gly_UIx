import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'output-settings-connectors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { 'id': 'output-settings-connectors', 'class': 'view' },
  template: `
    <section aria-labelledby="connectors-title">
      <div class="flex items-center justify-between mb-4">
        <h1 id="connectors-title" class="text-2xl font-bold">Output Connectors</h1>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <!-- Create Connector (left) -->
        <div class="rounded-2xl bg-white p-6 xl:col-span-1">
          <h2 class="text-lg font-semibold mb-2">Create Connector</h2>
          <p class="text-sm text-slate-600 mb-4">Deliver parsed outputs to email, APIs, storage and more.</p>

          <div class="space-y-4">
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
                <select class="mt-1 w-full px-3 py-2 rounded border" [(ngModel)]="format">
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

            <div class="flex gap-2">
              <button class="px-3 py-2 rounded bg-indigo-600 text-white" (click)="saveConnector()">Save Connector</button>
              <button class="px-3 py-2 rounded border" (click)="resetForm()">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Configured connectors (right) -->
        <div class="rounded-2xl bg-white p-6 xl:col-span-2">
          <h2 class="text-lg font-semibold mb-2">Configured Connectors</h2>
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

          <div class="mt-4">
            <h3 class="font-medium">Routing Rules</h3>
            <p class="text-xs text-slate-500">Send different document types to different connectors.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div class="flex items-center gap-2 border rounded-xl px-3 py-2">
                <label class="min-w-[80px]">Invoices</label>
                <select class="px-3 py-2 rounded border">
                  <option *ngFor="let t of connectorTypes" [value]="t.slug">{{ t.label }}</option>
                </select>
              </div>
              <div class="flex items-center gap-2 border rounded-xl px-3 py-2">
                <label class="min-w-[80px]">POs</label>
                <select class="px-3 py-2 rounded border">
                  <option *ngFor="let t of connectorTypes" [value]="t.slug">{{ t.label }}</option>
                </select>
              </div>
              <div class="flex items-center gap-2 border rounded-xl px-3 py-2">
                <label class="min-w-[80px]">Receipts</label>
                <select class="px-3 py-2 rounded border">
                  <option *ngFor="let t of connectorTypes" [value]="t.slug">{{ t.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class OutputSettingsConnectorsComponent {
  // Connector definitions (simplified)
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
  format = 'json';
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
    this.resetForm();
  }

  resetForm() {
    this.name = '';
    this.enabled = true;
    this.format = 'json';
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
    // Stub: open oauth flow in production
    alert('Connect Microsoft Account (stub)');
  }

  connectGoogleAccount() {
    // Stub: open oauth flow in production
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

