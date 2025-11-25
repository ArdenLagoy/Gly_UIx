import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'api-documentation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { 'id': 'api-documentation', 'class': 'view' },
  template: `
    <section aria-labelledby="api-doc-title">
      <div class="flex items-center justify-between mb-4">
        <h1 id="api-doc-title" class="text-2xl font-bold">API Documentation</h1>
      </div>

      <!-- Two-column layout: left = docs, right = sample preview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Left: detailed docs (paginated) -->
        <div class="md:col-span-2 rounded-2xl bg-white p-6">
          <!-- Page navigation -->
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            <button *ngFor="let t of pages; let i = index" (click)="goToPage(i)" class="px-3 py-1 rounded-full text-sm"
              [class.bg-indigo-600]="currentPage===i" [class.text-white]="currentPage===i"
              [class.bg-slate-100]="currentPage!==i" [class.text-slate-700]="currentPage!==i" [textContent]="t"></button>
          </div>

          <!-- Page content -->
          <div class="prose max-w-none text-sm text-slate-700">
            <!-- Overview -->
            <div *ngIf="currentPage === 0">
              <h2 class="text-lg font-semibold mb-2">Overview</h2>
              <p class="text-sm text-slate-600 mb-4">This page contains sample API documentation for the Glyphx Data Uploader & Extraction API. It describes authentication, common headers, endpoints, request/response shapes, error codes, and operational guidelines.</p>
              <p class="text-sm text-slate-600">The API is designed for high-throughput document ingestion and supports bulk uploads, status polling, and callback webhooks. For production integrations, we recommend using client libraries which implement retry/backoff and idempotency.</p>
            </div>

            <!-- Authentication -->
            <div *ngIf="currentPage === 1">
              <h2 class="text-lg font-semibold mb-2">Authentication</h2>
              <p class="text-sm text-slate-600">All requests must include an API key in the <code>Authorization</code> header: <code>Authorization: Bearer &lt;API_KEY&gt;</code></p>
              <p class="text-sm text-slate-600">API keys should be treated as secrets and rotated regularly. For production use, scopes and per-user tokens are recommended.</p>
              <p class="text-sm text-slate-600 mt-2">Best practices: store keys in a secure vault, avoid embedding keys in client-side code, and rotate keys every 90 days. Use read-only keys for monitoring tools where possible.</p>
            </div>

            <!-- Common Headers -->
            <div *ngIf="currentPage === 2">
              <h2 class="text-lg font-semibold mb-2">Common Headers</h2>
              <ul class="list-disc ml-5 text-sm text-slate-700">
                <li class="mb-1"><code>Authorization: Bearer &lt;API_KEY&gt;</code></li>
                <li class="mb-1"><code>Accept: application/json</code></li>
                <li class="mb-1"><code>Content-Type: multipart/form-data</code> (for file uploads)</li>
                <li class="mb-1"><code>X-Request-ID</code> (optional) — client-generated id for tracing.</li>
              </ul>
              <p class="text-xs text-slate-500 mt-2">Note: For non-file endpoints, prefer <code>application/json</code>. When uploading large batches, include <code>X-Request-ID</code> to help support correlate requests.</p>
            </div>

            <!-- Rate Limits -->
            <div *ngIf="currentPage === 3">
              <h2 class="text-lg font-semibold mb-2">Rate Limits</h2>
              <p class="text-sm text-slate-600">Requests are limited to <strong>60 requests per minute</strong> per API key. If exceeded, a <code>429</code> status is returned with a <code>Retry-After</code> header indicating when to retry.</p>
              <p class="text-sm text-slate-600 mt-2">Burst behavior: the rate limiter allows short bursts up to 120 requests. Please implement exponential backoff when receiving 429 responses. Background workers should queue and retry with jitter.</p>
            </div>

            <!-- Endpoints -->
            <div *ngIf="currentPage === 4">
              <h2 class="text-lg font-semibold mb-2">Endpoints</h2>
              <div class="space-y-3 text-sm text-slate-700">
                <div>
                  <strong>POST /api/v1/upload</strong>
                  <div class="text-xs text-slate-500 mt-1">Description: Upload one or more documents for processing.</div>
                  <div class="text-xs text-slate-500">Body: multipart/form-data with files and optional metadata fields (<code>project</code>, <code>documentType</code>, <code>externalId</code>).</div>
                  <div class="text-xs text-slate-500 mt-1">Notes: Supports parallel file fields (file[0], file[1]) and a <code>callbackUrl</code> form field for webhook notifications.</div>
                </div>
                <div>
                  <strong>GET /api/v1/projects</strong>
                  <div class="text-xs text-slate-500 mt-1">Description: Returns a list of projects, their ids, owners, and basic configuration.</div>
                  <div class="text-xs text-slate-500 mt-1">Pagination: supports <code>page</code> and <code>limit</code> query params. Default limit is 25.</div>
                </div>
                <div>
                  <strong>GET /api/v1/jobs/&#123;jobId&#125;</strong>
                  <div class="text-xs text-slate-500 mt-1">Description: Get processing status and results for a job. Replace &#123;jobId&#125; with the job identifier returned by the upload call.</div>
                  <div class="text-xs text-slate-500 mt-1">The response contains per-document extraction results and field-level confidence scores (0.0-1.0).</div>
                </div>
                <div>
                  <strong>POST /api/v1/webhooks/subscribe</strong>
                  <div class="text-xs text-slate-500 mt-1">Description: Register a callback URL for job state changes. Body: JSON &#123;"url":"https://...","events":["job.succeeded","job.failed"]&#125;.</div>
                </div>
              </div>
            </div>

            <!-- Examples -->
            <div *ngIf="currentPage === 5">
              <h2 class="text-lg font-semibold mb-2">Request / Response Examples</h2>
              <h4 class="font-medium mt-2">Sample upload request (curl)</h4>
              <pre ngNonBindable class="bg-slate-50 p-3 rounded text-sm text-slate-700">curl -X POST "https://api.example.com/api/v1/upload" \
  -H "Authorization: Bearer &lt;API_KEY&gt;" \
  -F "file=@invoice.pdf" \
  -F "project=invoice-du" \
  -F "callbackUrl=https://hooks.example.com/glyphx"</pre>

              <h4 class="font-medium mt-3">Sample response</h4>
              <pre ngNonBindable class="bg-slate-50 p-3 rounded text-sm text-slate-700">&#123;
  "jobId": "job_123456",
  "status": "queued"
&#125;</pre>

              <h4 class="font-medium mt-3">GET /api/v1/projects — Response Example</h4>
              <pre ngNonBindable class="bg-slate-50 p-3 rounded text-sm text-slate-700">&#123;
  "data": [
    &#123;"id": "prj_abc", "name": "Invoice DU", "owner": "ops@acme.io", "createdAt": "2024-08-12T10:12:00Z"&#125;,
    &#123;"id": "prj_xyz", "name": "PO DU", "owner": "ops@acme.io", "createdAt": "2024-09-03T14:01:00Z"&#125;
  ],
  "total": 2,
  "page": 1,
  "limit": 25
&#125;</pre>

              <h4 class="font-medium mt-3">GET /api/v1/jobs/&#123;jobId&#125; — Response Example</h4>
              <pre ngNonBindable class="bg-slate-50 p-3 rounded text-sm text-slate-700">&#123;
  "jobId": "job_123456",
  "status": "succeeded",
  "results": &#123;
    "documentType": "invoice",
    "confidence": 0.92,
    "fields": &#123;
      "invoiceNumber": &#123;"value":"INV-00123","confidence":0.99&#125;,
      "invoiceDate": &#123;"value":"2025-09-30","confidence":0.97&#125;,
      "total": &#123;"value":1234.56,"confidence":0.94&#125;,
      "currency": &#123;"value":"USD","confidence":0.99&#125;
    &#125;
  &#125;
&#125;</pre>
            </div>

            <!-- Error Codes -->
            <div *ngIf="currentPage === 6">
              <h2 class="text-lg font-semibold mb-2">Error Codes</h2>
              <ul class="list-disc ml-5 text-sm text-slate-700">
                <li><code>400 invalid_request</code> — Malformed body or missing fields.</li>
                <li><code>401 unauthorized</code> — Missing/invalid API key.</li>
                <li><code>404 not_found</code> — Resource not found.</li>
                <li><code>409 conflict</code> — Duplicate externalId.</li>
                <li><code>413 payload_too_large</code> — Upload exceeds limit.</li>
                <li><code>429 rate_limited</code> — Too many requests.</li>
                <li><code>500 server_error</code> — Unexpected error.</li>
              </ul>
              <p class="text-xs text-slate-500 mt-3">Tip: include <code>X-Request-ID</code> with uploads to make error investigation easier; provide the header value when opening a support ticket.</p>
            </div>
          </div>

          <!-- Pagination controls -->
          <div class="mt-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div class="flex items-center gap-2 flex-wrap">
                <button class="px-3 py-1 rounded border bg-white hover:bg-slate-50" (click)="prevPage()" [disabled]="currentPage===0">Prev</button>
                <!-- numbered page buttons -->
                <div class="inline-flex items-center gap-2">
                  <button *ngFor="let p of pages; let i = index" (click)="goToPage(i)" [class]="pageNumberClass(i)" [textContent]="i + 1"></button>
                </div>
                <button class="px-3 py-1 rounded border bg-white hover:bg-slate-50" (click)="nextPage()" [disabled]="currentPage === pages.length-1">Next</button>
              </div>

              <div class="text-sm text-slate-500" [textContent]="pageIndicator()"></div>
            </div>
          </div>
        </div>

        <!-- Right: sample preview (editable + expandable) -->
        <aside class="rounded-2xl bg-white p-4 border border-slate-100">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-md font-semibold">Sample Preview</h3>
            <div class="flex items-center gap-2">
              <button (click)="togglePreviewExpanded()" class="px-2 py-1 text-xs rounded bg-indigo-600 text-white flex items-center gap-2">
                <!-- expand icon -->
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 14v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path d="M20 10V4h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path d="M14 4L20 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path d="M4 20l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
                <span>Expand</span>
              </button>

              <button (click)="runSample()" class="px-2 py-1 text-xs rounded bg-emerald-600 text-white flex items-center gap-2">
                <!-- run icon (play) -->
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M5 3v18l15-9L5 3z" fill="currentColor"></path>
                </svg>
                <span>Run</span>
              </button>
            </div>
          </div>

          <div class="flex border rounded bg-slate-50 overflow-hidden">
            <div class="bg-slate-100 text-slate-500 text-xs p-3 font-mono" style="min-width:48px;">
              <div *ngFor="let l of previewLines" [textContent]="l"></div>
            </div>

            <div class="p-3 text-xs text-slate-800 font-mono flex-1 overflow-auto" style="max-height:320px;">
              <textarea [(ngModel)]="sampleEditorContent" class="w-full h-72 resize-none bg-transparent border-0 outline-none font-mono text-xs" aria-label="Sample editor"></textarea>
            </div>
          </div>

          <!-- Expand modal -->
          <div *ngIf="isPreviewExpanded" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div class="bg-white w-[90%] h-[90%] rounded-lg shadow-lg p-4 flex flex-col">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold">Sample Editor (Expanded)</h4>
                <div class="flex items-center gap-2">
                  <button (click)="runSample()" class="px-3 py-1 rounded bg-emerald-600 text-white flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M5 3v18l15-9L5 3z" fill="currentColor"></path>
                    </svg>
                    Run
                  </button>
                  <button (click)="isPreviewExpanded=false" class="px-3 py-1 rounded border">Close</button>
                </div>
              </div>

              <div class="flex-1 flex gap-4">
                <textarea [(ngModel)]="sampleEditorContent" class="flex-1 h-full resize-none border p-3 font-mono text-sm" autofocus></textarea>
                <div class="w-40 bg-slate-50 p-3 rounded overflow-auto text-xs font-mono">
                  <div *ngFor="let l of previewLines" [textContent]="l"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Generated Prompt area -->
        <div *ngIf="lastGeneratedPrompt" class="mt-3 md:col-span-3 p-3">
          <div class="bg-white p-3 rounded border">
            <div class="flex items-start justify-between mb-2">
              <div class="text-sm font-semibold">Generated Prompt</div>
              <div class="flex items-center gap-2">
                <button (click)="copyPrompt()" class="px-2 py-1 text-xs rounded border">Copy</button>
                <button (click)="lastGeneratedPrompt=''" class="px-2 py-1 text-xs rounded border">Clear</button>
              </div>
            </div>
            <textarea class="w-full h-28 text-xs font-mono p-2 bg-slate-50" [value]="lastGeneratedPrompt" readonly></textarea>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ApiDocumentationComponent {
  pages = ['Overview','Authentication','Headers','Rate Limits','Endpoints','Examples','Errors'];
  currentPage = 0;
  sampleEditorContent: string = `GET /api/v1/projects?page=1&limit=25
Authorization: Bearer <API_KEY>

Response 200:
{
  "projects": [
    {"id":"PX-001","name":"Invoice DU"},
    {"id":"PX-002","name":"PO DU"}
  ],
  "total": 2
}
`;

  get previewLines(): number[] {
    return Array.from({ length: this.sampleEditorContent.split('\n').length }, (_, i) => i + 1);
  }

  pageNumberClass(i: number) {
    const base = 'px-3 py-1 rounded';
    return this.currentPage === i ? base + ' bg-indigo-600 text-white' : base + ' bg-slate-100 text-slate-700 hover:bg-slate-200';
  }

  pageIndicator() {
    return `Showing ${this.pages[this.currentPage]} — Page ${this.currentPage + 1} of ${this.pages.length}`;
  }

  isPreviewExpanded = false;

  togglePreviewExpanded() {
    this.isPreviewExpanded = !this.isPreviewExpanded;
    // ensure focus/scroll if expanding
    if (this.isPreviewExpanded) setTimeout(() => { const el = document.querySelector('textarea[aria-label="Sample editor"]') as HTMLTextAreaElement | null; if (el) el.focus(); }, 50);
  }

  lastGeneratedPrompt: string = '';

  runSample() {
    // generate a prompt from the current sampleEditorContent
    const preview = this.sampleEditorContent.trim();
    const prompt = `Analyze the following API sample and summarize the request/response shape and important fields:\n\n${preview}`;
    this.lastGeneratedPrompt = prompt;
    // ensure the preview indicator updates
    if (!this.isPreviewExpanded) this.isPreviewExpanded = true;
    setTimeout(() => { const ta = document.querySelector('.z-50 textarea') as HTMLTextAreaElement | null; if (ta) ta.focus(); }, 50);
  }

  copyPrompt() {
    if (!this.lastGeneratedPrompt) return;
    // best-effort clipboard write
    try { navigator.clipboard.writeText(this.lastGeneratedPrompt); } catch (e) { /* ignore in SSR */ }
  }

  goToPage(i: number) {
    if (i < 0 || i >= this.pages.length) return;
    this.currentPage = i;
    // scroll to top of the docs column if needed
    setTimeout(() => {
      const el = document.getElementById('api-doc-title');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  prevPage() { if (this.currentPage > 0) this.currentPage--; }
  nextPage() { if (this.currentPage < this.pages.length - 1) this.currentPage++; }
}
