import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

@Component({
  selector: 'classification-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- ================= CLASSIFICATION OVERVIEW ================= -->
  <section id="classification-overview" class="view active" aria-labelledby="classov-title">

    <!-- 🔍 Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 id="classov-title" class="text-2xl font-bold">Classification Overview</h1>
      <div class="flex items-center gap-3">
        <!-- header area intentionally left empty; submit button moved into the project/confidence panel -->
      </div>
    </div>

    <!-- 📄 Layout -->
    <section
      class="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 flex gap-5 overflow-hidden w-full box-border">

      <!-- Center (document-focused view, left documents list removed) -->
      <div class="flex-1 min-w-0 flex flex-col gap-4">

        <ng-container *ngIf="currentDoc; else noDocsTemplate">
          <!-- 🔧 Project Type + Confidence -->
          <div class="flex justify-between items-center border border-slate-200 bg-slate-50 rounded-xl p-3">
            <div class="flex items-center gap-5">
              <div>
                <label class="text-sm text-slate-600 font-semibold block mb-1">Project Type</label>
                <select [(ngModel)]="currentDoc.project"
                        class="px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white">
                  <option>Invoice Processing</option>
                  <option>Payments & Disbursements</option>
                  <option>Vendor Management</option>
                </select>
              </div>

              <!-- Confidence Score -->
              <div class="flex flex-col">
                <span class="text-sm text-slate-600 font-semibold mb-1">Confidence</span>
                <span
                  class="px-3 py-1 rounded-lg text-white text-sm font-medium w-fit shadow-sm"
                  [ngStyle]="{ 'background-color': getConfidenceColor(currentDoc.confidence) }">
                  {{ currentDoc.confidence }}%
                </span>
              </div>
            </div>

            <!-- Submit button aligned with Project Type + Confidence -->
            <div *ngIf="currentDoc?.validationStatus !== 'Complete'">
              <button (click)="submitClassification()"
                      [disabled]="!currentDoc || noDocsToValidate"
                      class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                Submit
              </button>
            </div>
          </div>

          <!-- 🖼 PDF Viewer with Zoom -->
          <div class="flex-1 relative rounded-xl border border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
            <!-- Zoom Controls -->
            <div class="flex justify-end gap-2 p-2 bg-slate-100 border-b border-slate-200 rounded-t-xl">
              <button (click)="zoomOut()" class="px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-200 text-sm">−</button>
              <span class="text-sm font-medium text-slate-600 w-14 text-center">{{ (zoomLevel * 100) | number:'1.0-0' }}%</span>
              <button (click)="zoomIn()" class="px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-200 text-sm">+</button>
            </div>

            <div #pdfScroll class="relative flex justify-center items-start p-2 overflow-auto flex-1 bg-slate-50">
              <div #pdfWrapper
                   class="inline-block"
                   style="position: relative; transition: transform 0.2s ease; transform-origin: top center;">
                <canvas #pdfCanvas class="border rounded shadow-sm block"></canvas>
                <canvas #highlightCanvas class="absolute top-0 left-0 pointer-events-none"></canvas>
              </div>
            </div>
          </div>
        </ng-container>

        <ng-template #noDocsTemplate>
          <div class="flex-1 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-6 text-slate-500">
            No documents to validate
          </div>
        </ng-template>

      </div>
    </section>
  </section>
  `
})
export class ClassificationOverviewComponent implements AfterViewInit {
  @ViewChild('pdfCanvas') pdfCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('highlightCanvas') highlightCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pdfWrapper') pdfWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('pdfScroll') pdfScroll!: ElementRef<HTMLDivElement>;

  searchQuery = '';
  selectedStatus = '';

  statuses = ['Needs Validation', 'Complete'];

  zoomLevel = 1.5;
  baseScale = 1;
  baseWidth = 550;
  pdfDoc: any;
  currentIndex = 0;
  noDocsToValidate = false;

  documents = [
    {
      project: 'Invoice Processing',
      validationStatus: 'Needs Validation',
      confidence: 93,
      file: 'assets/pdfs/POT182209.pdf'
    },
    {
      project: 'Payments & Disbursements',
      validationStatus: 'Needs Validation',
      confidence: 81,
      file: 'assets/pdfs/PO1299488.pdf'
    },
    {
      project: 'Vendor Management',
      validationStatus: 'Complete',
      confidence: 99,
      file: 'assets/pdfs/PO110000.pdf'
    }
  ];

  get filteredDocuments() {
    const q = this.searchQuery.trim().toLowerCase();
    return this.documents.filter(doc => {
      const matchesSearch = this.getFileName(doc.file).toLowerCase().includes(q);
      const matchesStatus = this.selectedStatus
        ? doc.validationStatus === this.selectedStatus
        : true;
      return matchesSearch && matchesStatus;
    });
  }

  get currentDoc() {
    // return null if there are no filtered documents or index out of range
    return this.filteredDocuments.length === 0
      ? null
      : this.filteredDocuments[this.currentIndex] || null;
  }

  async ngAfterViewInit() {
    if (this.currentDoc) {
      await this.loadPdf(this.currentDoc.file);
    }
  }

  async selectPdf(index: number) {
    this.currentIndex = index;
    this.zoomLevel = 1.5;
    await this.loadPdf(this.currentDoc.file);
  }

  async loadPdf(url: string) {
    const loadingTask = pdfjsLib.getDocument(url);
    this.pdfDoc = await loadingTask.promise;
    const page = await this.pdfDoc.getPage(1);
    const unscaledViewport = page.getViewport({ scale: 1 });
    this.baseScale = this.baseWidth / unscaledViewport.width;
    await this.renderPage();
  }

  async renderPage() {
    const page = await this.pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: this.baseScale });
    const canvas = this.pdfCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const highlight = this.highlightCanvas.nativeElement;
    highlight.width = viewport.width;
    highlight.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    this.applyZoomTransform();
  }

  applyZoomTransform() {
    if (this.pdfWrapper?.nativeElement && this.pdfScroll?.nativeElement) {
      const wrapper = this.pdfWrapper.nativeElement;
      const scroller = this.pdfScroll.nativeElement;
      
      // Get current scroll position and viewport dimensions
      const scrollLeft = scroller.scrollLeft;
      const scrollerWidth = scroller.clientWidth;
      
      // Calculate the center point horizontally (before zoom)
      const centerX = (scrollLeft + scrollerWidth / 2) / this.zoomLevel;
      
      // Apply the zoom transformation
      wrapper.style.transform = `scale(${this.zoomLevel})`;
      
      // Calculate new scroll position to maintain horizontal center
      // With transform-origin: top center, we only need to adjust horizontally
      const newScrollLeft = Math.max(0, centerX * this.zoomLevel - scrollerWidth / 2);
      
      // Apply the new horizontal scroll position (keep vertical as-is)
      scroller.scrollLeft = newScrollLeft;
    }
  }

  zoomIn() {
    const oldZoomLevel = this.zoomLevel;
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 3);
    
    // Only apply transform if zoom level actually changed
    if (this.zoomLevel !== oldZoomLevel) {
      this.applyZoomTransform();
    }
  }

  zoomOut() {
    const oldZoomLevel = this.zoomLevel;
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
    
    // Only apply transform if zoom level actually changed
    if (this.zoomLevel !== oldZoomLevel) {
      this.applyZoomTransform();
    }
  }

  async submitClassification() {
    if (!this.currentDoc) return;

    // Mark runtime-only
    this.currentDoc.validationStatus = 'Complete';

    // Find next document that still needs validation
    const next = this.documents.find(d => d.validationStatus === 'Needs Validation');
    if (next) {
      // set currentIndex to the index of that document in the full documents array
      this.currentIndex = this.documents.indexOf(next);
      this.noDocsToValidate = false;
      this.zoomLevel = 1.5;
      await this.loadPdf(this.currentDoc.file);
    } else {
      // no documents left
      this.currentIndex = -1;
      this.noDocsToValidate = true;
      this.pdfDoc = null;

      // clear canvases if present
      try {
        const canvas = this.pdfCanvas?.nativeElement;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = 0;
          canvas.height = 0;
        }
        const h = this.highlightCanvas?.nativeElement;
        if (h) {
          const hctx = h.getContext('2d');
          if (hctx) hctx.clearRect(0, 0, h.width, h.height);
          h.width = 0;
          h.height = 0;
        }
      } catch (e) {
        // ignore canvas clear errors
        console.warn('Error clearing canvases', e);
      }
    }
  }

  getConfidenceColor(conf: number) {
    if (conf >= 95) return '#22c55e'; // green
    if (conf >= 80) return '#eab308'; // yellow
    return '#ef4444'; // red
  }

  getFileName(path: string): string {
    return path.split('/').pop() || '';
  }
}
