import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Mapping = { internal: string; output: string; color: string };

@Component({
  selector: 'output-settings-formats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="output-settings-formats" class="view" aria-labelledby="output-title">
      <div class="flex items-center justify-between mb-4">
        <h1 id="output-title" class="text-2xl font-bold">Output Settings - Formats</h1>
      </div>

      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Output Settings Panel (top) -->
  <div #mainPanel class="shadow-md rounded-2xl md:col-span-2 bg-white">
          <div class="flex items-center gap-2 px-4 pt-4">
            <div class="text-purple-600">⚙️</div>
            <h2 class="text-lg font-semibold">Output Settings</h2>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Column 1 -->
              <div class="flex flex-col gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium">Output Format</label>
                  <select class="w-full rounded-md border px-2 py-1" [(ngModel)]="format">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="excel">Excel (XLSX)</option>
                    <option value="xml">XML</option>
                  </select>
                  <div class="mt-2">
                    <button class="w-full border rounded-md px-3 py-2 text-sm hover:bg-slate-50">Connectors</button>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium">Schema Preset</label>
                  <select class="w-full rounded-md border px-2 py-1" [(ngModel)]="schema">
                    <option value="uipath_du_v1">UiPath DU v1</option>
                    <option value="azure_di_v3">Azure Document Intelligence v3</option>
                    <option value="glyphx_v1">Glyphx Custom v1</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex items-center justify-between border rounded-xl px-3 py-2">
                    <label class="text-sm">Confidence</label>
                    <input type="checkbox" [(ngModel)]="includeConf" />
                  </div>
                  <div class="flex items-center justify-between border rounded-xl px-3 py-2">
                    <label class="text-sm">Page Map</label>
                    <input type="checkbox" [(ngModel)]="includePages" />
                  </div>
                  <div class="flex items-center justify-between border rounded-xl px-3 py-2">
                    <label class="text-sm">Raw Text</label>
                    <input type="checkbox" [(ngModel)]="includeText" />
                  </div>
                  <div class="flex items-center justify-between border rounded-xl px-3 py-2">
                    <label class="text-sm">Flatten Arrays</label>
                    <input type="checkbox" [(ngModel)]="flatten" />
                  </div>
                </div>
              </div>

              <!-- Column 2 -->
              <div class="flex flex-col gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium">Key Casing</label>
                  <select class="w-full rounded-md border px-2 py-1" [(ngModel)]="keyCase">
                    <option value="camel">camelCase</option>
                    <option value="snake">snake_case</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium">Schema Version</label>
                  <input class="w-full rounded-md border px-2 py-1" [(ngModel)]="version" />
                </div>

                <div *ngIf="format === 'xml'" class="space-y-2">
                  <label class="block text-sm font-medium">XML Root Node</label>
                  <input class="w-full rounded-md border px-2 py-1" [(ngModel)]="rootNode" />
                  <label class="block text-sm font-medium mt-2">XML Namespace</label>
                  <input class="w-full rounded-md border px-2 py-1" [(ngModel)]="ns" />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium">File Naming Pattern</label>
                  <input class="w-full rounded-md border px-2 py-1" [(ngModel)]="filePattern" placeholder="{DocType}_{DocId}_{yyyyMMdd}" />
                  <p class="text-xs text-slate-500">Tokens: {{ '{' }}DocType{{ '}' }}, {{ '{' }}DocId{{ '}' }}, {{ '{' }}yyyyMMdd{{ '}' }}, {{ '{' }}BatchId{{ '}' }}, {{ '{' }}Vendor{{ '}' }}</p>
                </div>
              </div>

              <!-- Column 3: Preview -->
              <div class="flex flex-col gap-2">
                <label class="block text-sm font-medium">Preview</label>
                <textarea class="min-h-[260px] font-mono text-sm rounded-md border p-2" readonly [value]="preview()"></textarea>
                <div class="flex gap-3 mt-2">
                  <button class="bg-purple-600 text-white px-3 py-1 rounded">Save as Preset</button>
                  <button class="border px-3 py-1 rounded">Export {{ format.toUpperCase() }}</button>
                </div>
              </div>
            </div>

            <!-- Field Mapping -->
            <div class="mt-6">
              <label class="block mb-2 font-medium">Field Mapping (Internal → Output)</label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div *ngFor="let m of mappings; let i = index" [attr.data-index]="i" class="flex items-center gap-2 p-2 rounded-xl ring-1" [ngClass]="colorClasses[m.color]?.ring">
                  <span class="text-xs px-2 py-1 rounded-full" [ngClass]="colorClasses[m.color]?.chip">{{ m.internal }}</span>
                  <span class="text-sm">→</span>
                  <input class="flex-1 rounded-md border px-2 py-1" [value]="m.output" (input)="setOutputAt(i, $any($event.target).value)" />
                  <span class="text-[11px] px-2 py-1 rounded-md bg-neutral-100 border text-neutral-700 whitespace-nowrap">{{ pseudoKey(m.output) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Panel -->
  <div #uploadPanel class="shadow-md rounded-2xl bg-white p-4" [style.height.px]="panelHeightPx ? panelHeightPx : null">
          <div class="flex items-center gap-2">
            <div class="text-blue-500">📤</div>
            <h3 class="font-semibold">Document Upload</h3>
          </div>
          <div class="mt-3 flex flex-col gap-3">
            <input type="file" accept=".pdf,.jpg,.png,.tif" />
            <select class="w-full rounded-md border px-2 py-1" (change)="onDocTypeChange($any($event.target).value)">
              <option value="invoice">POT182209.pdf</option>
              <option value="receipt">PO1299488.pdf</option>
              <option value="purchase_order">PO110000.pdf</option>
            </select>
            <button class="bg-blue-600 text-white px-3 py-1 rounded">Start Extraction</button>
          </div>
        </div>

        <!-- Extraction Result Panel -->
  <div #extractionPanel class="shadow-md rounded-2xl bg-white p-4" [style.height.px]="panelHeightPx ? panelHeightPx : null">
          <div class="flex items-center gap-2">
            <div class="text-green-600">📄</div>
            <h3 class="font-semibold">Extraction Output</h3>
          </div>
          <div class="mt-3 flex flex-col gap-3">
            <textarea readonly class="rounded-md border p-2 font-mono text-sm" [value]="extractionPreview"></textarea>
            <div>
              <p class="text-sm font-semibold mb-1">Extraction Confidence</p>
              <div class="w-full bg-gray-200 rounded h-3 overflow-hidden">
                <div class="bg-green-500 h-3" [style.width.%]="extractionConfidence"></div>
              </div>
            </div>
            <button class="border px-3 py-1 rounded flex items-center gap-2">✅ Export JSON</button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class OutputSettingsFormatsComponent {
  // Format & schema
  format = 'json';
  schema = 'uipath_du_v1';
  includeConf = true;
  includePages = true;
  includeText = false;
  flatten = false;
  keyCase: 'camel' | 'snake' = 'camel';
  version = '1.0.0';
  rootNode = 'Document';
  ns = 'urn:du:out';
  filePattern = '{DocType}_{DocId}_{yyyyMMdd}';
  docType = 'invoice';

  mappings: Mapping[] = [
    { internal: 'InvoiceNumber', output: 'invoice_number', color: 'emerald' },
    { internal: 'InvoiceDate', output: 'invoice_date', color: 'amber' },
    { internal: 'TotalAmount', output: 'total_amount', color: 'sky' },
  ];

  colorClasses: Record<string, { chip: string; ring: string }> = {
    emerald: { chip: 'bg-emerald-100 text-emerald-800', ring: 'ring-emerald-300' },
    amber: { chip: 'bg-amber-100 text-amber-800', ring: 'ring-amber-300' },
    sky: { chip: 'bg-sky-100 text-sky-800', ring: 'ring-sky-300' },
    violet: { chip: 'bg-violet-100 text-violet-800', ring: 'ring-violet-300' },
  };

  extractionPreview = `{
  "InvoiceNumber": "INV-12345",
  "InvoiceDate": "2025-10-18",
  "VendorName": "ACME Corporation",
  "TotalAmount": "1500.75",
  "ConfidenceScores": {
    "InvoiceNumber": 0.98,
    "InvoiceDate": 0.93,
    "VendorName": 0.87,
    "TotalAmount": 0.99
  }
}`;

  extractionConfidence = 92; // percent

  // dynamic panel sizing
  @ViewChild('mainPanel') mainPanel!: ElementRef<HTMLElement>;
  @ViewChild('uploadPanel') uploadPanel!: ElementRef<HTMLElement>;
  @ViewChild('extractionPanel') extractionPanel!: ElementRef<HTMLElement>;

  panelHeightPx: number | null = null;
  private resizeObserver?: ResizeObserver;
  private removeWindowListener?: () => void;

  setOutputAt(idx: number, val: string) {
    this.mappings = this.mappings.map((m, i) => (i === idx ? { ...m, output: val } : m));
  }

  pseudoKey(outKey: string | undefined) {
    return `${this.docType}:${outKey || 'field'}`;
  }

  preview(): string {
    if (this.format === 'json') {
      const base: any = {
        DocumentType: 'Invoice',
        DocumentID: 'INV-12345',
        Fields: {
          InvoiceNumber: 'INV-12345',
          InvoiceDate: '2025-10-18',
          VendorName: 'ACME Corporation',
          TotalAmount: '1500.75',
          Currency: 'USD',
        },
        Status: 'Validated',
        ProcessingMetadata: { Schema: this.schema, Version: this.version },
      };
      if (this.includeConf) base.ConfidenceScores = { InvoiceNumber: 0.98, InvoiceDate: 0.93, VendorName: 0.87, TotalAmount: 0.99 };
      if (this.includePages) base.PageMap = [{ page: 1, regions: ['InvoiceNumber', 'InvoiceDate'] }];
      if (this.includeText) base.RawText = '...extracted full text...';
      const json = JSON.stringify(base, null, 2);
      if (this.keyCase === 'snake') {
        return json.replace(/"([A-Za-z][A-Za-z0-9]*)"/g, (m) => m.replace(/[A-Z]/g, (s) => '_' + s.toLowerCase()));
      }
      return json;
    }
    if (this.format === 'csv') {
      return `Field,Value,Confidence\nInvoiceNumber,INV-12345,0.98\nInvoiceDate,2025-10-18,0.93\nVendorName,ACME Corporation,0.87\nTotalAmount,1500.75,0.99`;
    }
    if (this.format === 'excel') {
      return '(Preview) Excel workbook with sheets: Fields, Confidence, Pages';
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n<${this.rootNode} xmlns="${this.ns}" Schema="${this.schema}" Version="${this.version}">\n  <Fields>\n    <InvoiceNumber conf="0.98">INV-12345</InvoiceNumber>\n    <InvoiceDate conf="0.93">2025-10-18</InvoiceDate>\n    <VendorName conf="0.87">ACME Corporation</VendorName>\n    <TotalAmount conf="0.99">1500.75</TotalAmount>\n  </Fields>\n</${this.rootNode}>`;
  }

  onDocTypeChange(val: string) {
    this.docType = val;
  }

  ngAfterViewInit(): void {
    // initial measurement after view init
    setTimeout(() => this.updateHeights(), 0);

    // observe changes to the main panel size
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateHeights());
      try {
        this.resizeObserver.observe(this.mainPanel.nativeElement);
      } catch (e) {
        // ignore if observation fails
      }
    }

    // listen to window resize
    this.removeWindowListener = this.renderer.listen('window', 'resize', () => this.updateHeights());
  }

  constructor(private ngZone: NgZone, private renderer: Renderer2) {}

  private updateHeights() {
    // Only apply fixed heights on desktop (md breakpoint ~768px)
    if (!this.mainPanel) return;
    const width = window.innerWidth || document.documentElement.clientWidth;
    if (width < 768) {
      this.panelHeightPx = null;
      return;
    }

    const el = this.mainPanel.nativeElement as HTMLElement;
    // offsetHeight includes padding and border — it's fine for visual matching
    const h = el.offsetHeight;
    this.panelHeightPx = h;
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      try {
        this.resizeObserver.disconnect();
      } catch (e) {
        // ignore
      }
    }
    if (this.removeWindowListener) {
      this.removeWindowListener();
    }
  }
}
