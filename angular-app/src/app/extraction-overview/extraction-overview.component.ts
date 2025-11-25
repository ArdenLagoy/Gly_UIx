import {
  Component,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  HostListener,
  ChangeDetectorRef,
  NgZone,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as pdfjsLib from 'pdfjs-dist';
import { DocumentData, FieldCoords } from './extraction.model';
import { MOCK_DOCUMENTS } from './mock-documents';
import { hexToRgba } from './utils';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

@Component({
  selector: 'extraction-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './extraction-overview.component.html',
  styleUrls: ['./extraction-overview.component.css']
})
export class ExtractionOverviewComponent implements AfterViewInit {
  @ViewChild('pdfCanvas') pdfCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('highlightCanvas') highlightCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pdfWrapper') pdfWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('pdfScroll') pdfScroll!: ElementRef<HTMLDivElement>;
  @ViewChild('rowWrap') rowWrap!: ElementRef<HTMLDivElement>;
  @ViewChild('linkCanvas') linkCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChildren('fieldInput') fieldInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild('magnifierCanvas') magnifierCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  // =============== BASIC STATE ===============
  searchQuery = '';
  selectedStatus = '';
  activeField: string | null = null;

  pdfDoc: any;
  currentIndex = 0;
  baseScale = 1;
  zoomLevel = 1.5;
  readonly baseWidth = 480;

  // Multi-page support (lazy)
  pageViewports: any[] = [];
  pageOffsets: number[] = [];
  totalDocHeight = 0;
  pageCanvasMap: Map<number, HTMLCanvasElement> = new Map();
  intersectionObserver?: IntersectionObserver;
  lazyObserverAttached = false;
  // Track in-flight render tasks returned by pdf.js so we don't call render() twice
  renderTasks: Map<number, any> = new Map();

  // 🔍 Magnifier
  showMagnifier = false;
  magnifierCoords: FieldCoords | null = null;
  magnifierColor = '#000000';
  magnifierZoom = 2.0;
  magnifierPosition = { top: 10, left: 10 };

  // 🔒 Internal state
  private suppressClearUntil = 0;
  private lastCoords: FieldCoords | null = null;
  private lastCoordsList: FieldCoords[] = [];
  private lastInputEl: HTMLInputElement | null = null;
  private lastColor = '#000000';
  private fullRenderCanvas: HTMLCanvasElement | null = null;
  // When true there are no more documents needing validation in runtime
  noDocsToValidate = false;

  statuses = ['Needs Validation', 'Complete'];

  fieldList = [
    { key: 'poNumber', label: 'PO Number', hotkey: 'e', color: '#ef4444' },
    { key: 'orderDate', label: 'Order Date', hotkey: 'r', color: '#22c55e' },
    { key: 'companyName', label: 'Company Name', hotkey: 't', color: '#3b82f6' },
    { key: 'amount', label: 'Amount', hotkey: 'y', color: '#a855f7' }
  ];

  documents: DocumentData[] = MOCK_DOCUMENTS;

  get filteredDocuments() {
    const q = this.searchQuery.trim().toLowerCase();
    return this.documents.filter(doc =>
      this.getFileName(doc.file).toLowerCase().includes(q)
    );
  }

  // Submit the current document: mark as Complete in-memory and advance to next Needs Validation
  async submitCurrentDoc() {
    const doc = this.currentDoc;
    if (!doc) return;

    // Update runtime state only (do not persist to mock file)
    doc.validationStatus = 'Complete';

    // Clear highlights and close magnifier
    this.clearHighlight(true);

    // Find next document that still needs validation across runtime documents
    const nextIndex = this.documents.findIndex(d => d.validationStatus === 'Needs Validation');
    if (nextIndex >= 0) {
      this.currentIndex = nextIndex;
      this.noDocsToValidate = false;
      try {
        await this.loadPdf(this.currentDoc?.file);
      } catch (e) {
        // ignore load errors
      }
    } else {
      // No more documents to validate in runtime
      this.currentIndex = -1;
      this.noDocsToValidate = true;
      // clear highlights and canvases
      this.clearHighlight(true);
      this.pageViewports = [];
      try {
        const wrapper = this.pdfWrapper?.nativeElement as HTMLElement | undefined;
        if (wrapper) {
          const existing = Array.from(wrapper.querySelectorAll('.page-canvas')) as HTMLCanvasElement[];
          existing.forEach(n => { if (n !== this.pdfCanvas?.nativeElement) n.remove(); });
        }
      } catch (e) {
        // ignore
      }
    }
  }

  get currentDoc() {
    if (this.currentIndex < 0 || this.currentIndex >= this.documents.length) return undefined;
    return this.documents[this.currentIndex];
  }

  // ===========================================
  async ngAfterViewInit() {
    await this.loadPdf(this.currentDoc?.file);
    this.sizeLinkCanvasToRow();

    // Suppress blur-clearing briefly on click
    this.highlightCanvas.nativeElement.addEventListener('mousedown', () => {
      this.suppressClearUntil = performance.now() + 300;
    });

    // Single-click opens magnifier
    this.highlightCanvas.nativeElement.addEventListener('click', (e) =>
      this.onHighlightClick(e)
    );

    // Cursor feedback
    this.highlightCanvas.nativeElement.addEventListener('mousemove', (e) =>
      this.onHighlightHover(e)
    );
  }

  async selectPdf(index: number) {
    this.currentIndex = index;
    this.zoomLevel = 1.5;
    await this.loadPdf(this.currentDoc?.file);
    // Force-close magnifier and clear highlights when switching documents
    this.clearHighlight(true);
  }

  // ===========================================
  // PDF RENDERING
  // ===========================================
  // Lazy multi-page renderer: render only first page initially and create placeholders
  // for subsequent pages. Pages render as they scroll into view.
  async loadPdf(url?: string) {
    if (!url) return;
    const loadingTask = pdfjsLib.getDocument(url);
    this.pdfDoc = await loadingTask.promise;

    const numPages = this.pdfDoc.numPages || 1;

    // compute base scale using page 1
    const firstPage = await this.pdfDoc.getPage(1);
    const unscaled = firstPage.getViewport({ scale: 1 });
    this.baseScale = this.baseWidth / unscaled.width;

    // collect viewports and total height
    this.pageViewports = [];
    this.pageOffsets = [];
    this.totalDocHeight = 0;
    for (let i = 1; i <= numPages; i++) {
      const p = await this.pdfDoc.getPage(i);
      const vp = p.getViewport({ scale: this.baseScale });
      this.pageViewports.push({ page: p, viewport: vp });
      this.pageOffsets.push(this.totalDocHeight);
      this.totalDocHeight += Math.ceil(vp.height);
    }

    // Ensure pdfWrapper is cleared and build canvases
    const wrapper = this.pdfWrapper.nativeElement as HTMLElement;
    // remove any existing page canvases but PRESERVE the template #pdfCanvas element
    const existing = Array.from(wrapper.querySelectorAll('.page-canvas')) as HTMLCanvasElement[];
    existing.forEach(n => {
      // keep the template canvas referenced by ViewChild (this.pdfCanvas.nativeElement)
      if (n === this.pdfCanvas.nativeElement) return;
      n.remove();
    });

    // Reset internal page canvas bookkeeping and any painted flags on the template canvas
    this.pageCanvasMap.clear();
    this.fullRenderCanvas = null;
    try {
      const tmpl = this.pdfCanvas.nativeElement as HTMLCanvasElement;
      tmpl.removeAttribute('data-painted');
      const tctx = tmpl.getContext('2d');
      if (tctx) tctx.clearRect(0, 0, tmpl.width, tmpl.height);
    } catch (e) {
      // ignore if template not yet attached
    }

  // Create or resize the first canvas (template exists as #pdfCanvas)
  const firstCanvas = this.pdfCanvas.nativeElement as HTMLCanvasElement;
    const firstVp = this.pageViewports[0].viewport;
    firstCanvas.width = Math.ceil(firstVp.width);
    firstCanvas.height = Math.ceil(firstVp.height);
    firstCanvas.classList.add('page-canvas');
  firstCanvas.setAttribute('data-page', '1');
    this.pageCanvasMap.set(1, firstCanvas);
  console.debug('[PDF] created first canvas', { page: 1, width: firstCanvas.width, height: firstCanvas.height });
    // Ensure the template canvas is present in the wrapper in case it was removed previously
    const highlightEl = wrapper.querySelector('canvas[ng-reflect-name="highlightCanvas"]') || wrapper.querySelector('canvas.absolute');
    if (!wrapper.contains(firstCanvas)) {
      // Insert before highlightCanvas if present, otherwise append as first child
      if (highlightEl && highlightEl.parentElement === wrapper) {
        wrapper.insertBefore(firstCanvas, highlightEl);
      } else {
        wrapper.insertBefore(firstCanvas, wrapper.firstChild);
      }
    }

    // Append placeholder canvases for pages 2..N
    for (let i = 2; i <= this.pageViewports.length; i++) {
      const vp = this.pageViewports[i - 1].viewport;
      const c = document.createElement('canvas');
      c.width = Math.ceil(vp.width);
      c.height = Math.ceil(vp.height);
      c.className = 'page-canvas';
      c.setAttribute('data-page', String(i));
      // simple style so canvases stack vertically with a small gap
      (c as any).style.display = 'block';
      (c as any).style.marginTop = '8px';
      // insert after the first canvas to guarantee ordering
      wrapper.insertBefore(c, firstCanvas.nextSibling);
      // not rendered yet; store for lazy rendering
      this.pageCanvasMap.set(i, c);
      console.debug('[PDF] created placeholder canvas', { page: i, width: c.width, height: c.height });
    }

    // Resize highlight overlay to maximum expected size (will be clipped by scroll)
    const highlight = this.highlightCanvas.nativeElement;
    highlight.width = Math.max(1, Math.ceil(this.pageViewports[0].viewport.width));
    highlight.height = Math.max(1, this.totalDocHeight);

    // Ensure scroll starts at top so page 1 is visible, then render it
    try {
      (this.pdfScroll.nativeElement as HTMLElement).scrollTop = 0;
    } catch (e) {
      // ignore if not available
    }
    await this.renderPageToCanvas(1, firstCanvas);
    console.debug('[PDF] first page painted');

    // If content overflows the scroll container, attach the observer immediately; otherwise
    // wait for the user's first scroll so we don't render near-viewport canvases at load.
    const root = this.pdfScroll.nativeElement as HTMLElement;
    // small timeout to allow layout to settle and clientHeight/scrollHeight to be accurate
    setTimeout(() => {
      try {
        const overflow = wrapper.scrollHeight > root.clientHeight;
        if (overflow) {
          this.attachLazyObserver(root, wrapper);
        } else {
          const onFirstScroll = () => this.attachLazyObserver(root, wrapper);
          root.addEventListener('scroll', onFirstScroll, { once: true });
        }
      } catch (e) {
        // fallback: attach on first scroll
        const onFirstScroll = () => this.attachLazyObserver(root, wrapper);
        root.addEventListener('scroll', onFirstScroll, { once: true });
      }
    }, 50);

    this.applyZoomTransform();
    this.sizeLinkCanvasToRow();
    this.redrawConnector();
  }

  private attachLazyObserver(root: Element, wrapper: HTMLElement) {
    if (this.lazyObserverAttached) return;
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    console.debug('[PDF] creating IntersectionObserver');
    // require a smaller visible portion to trigger painting (25%) — more responsive for near-fold pages
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        const el = en.target as HTMLCanvasElement;
        const pageAttr = el.getAttribute('data-page');
        const pageNum = pageAttr ? parseInt(pageAttr, 10) : 1;
        console.debug('[PDF] observer entry', { pageNum, isIntersecting: en.isIntersecting, intersectionRatio: en.intersectionRatio });
        // paint when either intersecting or intersectionRatio >= 0.25
        if (en.isIntersecting || (en.intersectionRatio || 0) >= 0.25) {
          const painted = el.getAttribute('data-painted');
          if (!painted) {
            console.debug('[PDF] painting from observer', { pageNum, intersectionRatio: en.intersectionRatio });
            this.renderPageToCanvas(pageNum, el).catch(err => console.error('Render page failed', err));
          }
        }
      });
    }, { root, rootMargin: '0px', threshold: [0.25] });

    const canvases = wrapper.querySelectorAll('.page-canvas');
    canvases.forEach((c) => this.intersectionObserver!.observe(c));
    // log canvases and their positions relative to root for debugging
    try {
      const rootRect = (root as Element).getBoundingClientRect();
      canvases.forEach((c) => {
        const el = c as HTMLCanvasElement;
        const pageAttr = el.getAttribute('data-page');
        const pageNum = pageAttr ? parseInt(pageAttr, 10) : 1;
        const r = el.getBoundingClientRect();
        console.debug('[PDF] canvas pos', { pageNum, top: r.top, bottom: r.bottom, rootTop: rootRect.top, rootBottom: rootRect.bottom, clientHeight: (root as HTMLElement).clientHeight });
      });
    } catch (e) {
      // ignore
    }
    // Initial pass: if any unpainted canvases are just below the fold (within a small margin), paint them
    try {
      const rootRect = (root as Element).getBoundingClientRect();
      const preRenderMargin = 240; // pixels below the fold to pre-render
      canvases.forEach((c) => {
        const el = c as HTMLCanvasElement;
        const painted = el.getAttribute('data-painted');
        if (painted) return;
        const r = el.getBoundingClientRect();
        const topRel = r.top - rootRect.top; // distance from top of scroll container
        if (topRel < ((root as HTMLElement).clientHeight + preRenderMargin)) {
          const pageAttr = el.getAttribute('data-page');
          const pageNum = pageAttr ? parseInt(pageAttr, 10) : 1;
          console.debug('[PDF] pre-rendering near-fold page', { pageNum, topRel, clientHeight: (root as HTMLElement).clientHeight });
          this.renderPageToCanvas(pageNum, el).catch(err => console.error('Pre-render failed', err));
        }
      });
    } catch (e) {
      // ignore layout read errors
    }
    this.lazyObserverAttached = true;
  }

  async renderPageToCanvas(pageNumber: number, canvas: HTMLCanvasElement) {
    if (!this.pdfDoc) return;
    // pageNumber may be 1 for the existing canvas
    const info = this.pageViewports[pageNumber - 1];
    if (!info) return;
    const page = info.page;
    const viewport = info.viewport;
    // If canvas already painted, skip
    if (canvas.getAttribute('data-painted')) {
      console.debug('[PDF] render skipped, already painted', { pageNumber });
      return;
    }

    // If a render is already in-flight for this page, await it instead of starting a second render
    const existingTask = this.renderTasks.get(pageNumber);
    if (existingTask) {
      try {
        console.debug('[PDF] awaiting existing render task', { pageNumber });
        await existingTask.promise;
        // ensure painted flag is set if the previous task completed
        canvas.setAttribute('data-painted', '1');
      } catch (e) {
        // previous task failed or was cancelled — proceed to start a new one
        console.debug('[PDF] existing render task failed/cancelled, proceeding', { pageNumber, err: e });
      } finally {
        this.renderTasks.delete(pageNumber);
      }
      return;
    }

    console.debug('[PDF] renderPageToCanvas start', { pageNumber, viewportWidth: viewport.width, viewportHeight: viewport.height });
    const ctx = canvas.getContext('2d')!;
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    // start render and keep track of the task to avoid concurrent renders on the same canvas
    const renderTask = page.render({ canvasContext: ctx, viewport });
    this.renderTasks.set(pageNumber, renderTask);
    try {
      await renderTask.promise;
      canvas.setAttribute('data-painted', '1');
      console.debug('[PDF] renderPageToCanvas done', { pageNumber });

      // Pre-render the immediate next page (non-blocking) to make scrolling smooth
      const nextPage = pageNumber + 1;
      if (nextPage <= this.pageViewports.length) {
        const nextCanvas = this.pageCanvasMap.get(nextPage);
        if (nextCanvas && !nextCanvas.getAttribute('data-painted')) {
          // schedule async pre-render to avoid nesting renders
          setTimeout(() => {
            this.renderPageToCanvas(nextPage, nextCanvas).catch(err => console.error('Pre-render next page failed', { nextPage, err }));
          }, 0);
        }
      }
    } catch (err) {
      console.error('[PDF] render failed', { pageNumber, err });
      // if task was cancelled or failed, ensure flag isn't set
      canvas.removeAttribute('data-painted');
      throw err;
    } finally {
      this.renderTasks.delete(pageNumber);
    }

    // cache per-page canvas for magnifier if desired
    // (we keep page canvases in pageCanvasMap)
  }

  // Map a page-local FieldCoords to stacked document coordinates.
  // Heuristic: try to find a page where (offset + coords.y + coords.h) fits within that page's height.
  getStackedCoords(coords: FieldCoords) {
    if (!coords) return coords;
    if (!this.pageViewports || this.pageViewports.length === 0) return coords;

    // If coords already include a page index, use it
    const anyC: any = coords as any;
    if (anyC.page && typeof anyC.page === 'number') {
      const pIdx = anyC.page - 1;
      const offset = this.pageOffsets[pIdx] || 0;
      return { x: coords.x, y: coords.y + offset, w: coords.w, h: coords.h } as FieldCoords;
    }

    for (let i = 0; i < this.pageViewports.length; i++) {
      const vp = this.pageViewports[i].viewport;
      const offset = this.pageOffsets[i] || 0;
      const pageTop = offset;
      const pageBottom = offset + vp.height;
      const stackedY = coords.y + offset;
      // if the stacked rectangle fits entirely within this page, treat coords as page-local
      if (stackedY >= pageTop - 1 && (stackedY + coords.h) <= pageBottom + 1) {
        return { x: coords.x, y: stackedY, w: coords.w, h: coords.h } as FieldCoords;
      }
    }

    // fallback: assume coords were already stacked
    return coords;
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
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

// HiDPI-safe sizing: CSS size == row size; backing store scaled by DPR
sizeLinkCanvasToRow() {
  const rowEl = this.rowWrap.nativeElement;
  const rowRect = rowEl.getBoundingClientRect();

  const canvas = this.linkCanvas.nativeElement;
  const dpr = window.devicePixelRatio || 1;

  // CSS size in CSS pixels
  const cssW = Math.ceil(rowRect.width);
  const cssH = Math.ceil(rowRect.height);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;

  // Backing store in device pixels
  const pxW = Math.max(1, Math.floor(cssW * dpr));
  const pxH = Math.max(1, Math.floor(cssH * dpr));
  if (canvas.width !== pxW) canvas.width = pxW;
  if (canvas.height !== pxH) canvas.height = pxH;

  // Scale the 2D context so all drawing uses CSS pixel coordinates
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}


  zoomIn() {
    const oldZoomLevel = this.zoomLevel;
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 3);
    
    // Only apply transform if zoom level actually changed
    if (this.zoomLevel !== oldZoomLevel) {
      this.applyZoomTransform();
      this.redrawConnector();
    }
  }

  zoomOut() {
    const oldZoomLevel = this.zoomLevel;
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
    
    // Only apply transform if zoom level actually changed
    if (this.zoomLevel !== oldZoomLevel) {
      this.applyZoomTransform();
      this.redrawConnector();
    }
  }

  // Auto-scroll the PDF viewer to center the specified field coordinates
  scrollToField(coords: FieldCoords) {
    if (!coords || !this.pdfScroll?.nativeElement) return;

    const scroller = this.pdfScroll.nativeElement;
    const scrollerHeight = scroller.clientHeight;
    
    // Calculate the field position in scaled coordinates
    const fieldTop = coords.y * this.zoomLevel;
    const fieldHeight = coords.h * this.zoomLevel;
    const fieldCenter = fieldTop + fieldHeight / 2;
    
    // Calculate the desired scroll position to center the field
    const targetScrollTop = fieldCenter - scrollerHeight / 2;
    
    // Clamp the scroll position to valid bounds
    const maxScrollTop = scroller.scrollHeight - scrollerHeight;
    const newScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
    
    // Smooth scroll to the new position
    scroller.scrollTo({
      top: newScrollTop,
      behavior: 'smooth'
    });
  }

  // ===========================================
  // HIGHLIGHT + CONNECTOR
  // ===========================================
  highlight(field: any, inputEl: HTMLInputElement) {
    if (!this.currentDoc) return;

    const fieldData = this.currentDoc.fields[field.key];
    const value = (fieldData.value || '').trim();
    const coords = fieldData.coords;

    if (!value || !coords || !coords.w || !coords.h) {
      // If value is empty or coords missing, close the magnifier and clear highlights
      this.clearHighlight(true);
      return;
    }

    this.activeField = field.key;
    const stacked = this.getStackedCoords(coords);
    this.drawHighlight(stacked, field.color);
    this.lastCoords = stacked;
    this.lastInputEl = inputEl;
    this.lastColor = field.color;
    this.lastCoordsList = [stacked];
    this.drawConnector(inputEl, stacked, field.color, false);

    // Auto-scroll to center the highlighted field in the PDF viewer
    this.scrollToField(stacked);

    // Auto-open magnifier when focusing a field input (but exclude line items).
    // Position the magnifier adjacent to the highlighted value in the PDF so it
    // doesn't overlap the value (try right, then left, then top, then bottom).
    try {
      if (field && field.key !== 'lineItems' && inputEl) {
        const scrollRect = this.pdfScroll.nativeElement.getBoundingClientRect();
        const hiRect = this.highlightCanvas.nativeElement.getBoundingClientRect();
        const panelW = 320, panelH = 240;

        // Compute the highlighted rect in CSS pixels relative to the scroll container
        const leftInScroll = (hiRect.left - scrollRect.left) + (stacked.x * this.zoomLevel);
        const topInScroll = (hiRect.top - scrollRect.top) + (stacked.y * this.zoomLevel);
        const wInScroll = stacked.w * this.zoomLevel;
        const hInScroll = stacked.h * this.zoomLevel;

        // Try placing to the right
        let left = Math.round(leftInScroll + wInScroll + 12);
        let top = Math.round(topInScroll + hInScroll / 2 - panelH / 2);

        // If doesn't fit on right, try left
        if (left + panelW > scrollRect.width - 10) {
          left = Math.round(leftInScroll - panelW - 12);
        }

        // If still out of bounds horizontally, try above
        if (left < 10) {
          left = Math.round(leftInScroll + wInScroll / 2 - panelW / 2);
          top = Math.round(topInScroll - panelH - 12);
        }

        // If above doesn't fit, place below
        if (top < 10) {
          top = Math.round(topInScroll + hInScroll + 12);
        }

        // Final clamps to keep inside the scroll container
        left = Math.max(10, Math.min(left, Math.max(10, scrollRect.width - panelW - 10)));
        top = Math.max(10, Math.min(top, Math.max(10, scrollRect.height - panelH - 10)));

        this.magnifierPosition = { top, left };
        this.showMagnifier = true;
        this.magnifierCoords = stacked;
        this.magnifierColor = field.color;

        // Ensure magnifier canvas exists before attempting to render
        this.cdr.detectChanges();
        requestAnimationFrame(() => this.renderMagnifier());
      }
    } catch (e) {
      console.debug('[MAG] auto-open magnifier failed', e);
    }
  }

  highlightTable(item?: any, inputEl?: HTMLInputElement) {
    if (!this.currentDoc) return;
    // normalize table coords (allow single object or array)
    const tables = Array.isArray(this.currentDoc.tableCoords)
      ? (this.currentDoc.tableCoords as FieldCoords[])
      : [this.currentDoc.tableCoords as FieldCoords];
    // Accept multiple table coords (possibly on different pages).
    // Filter out any invalid table entries (missing width/height).
    const validTables = (tables as FieldCoords[]).filter(t => t && t.w && t.h);
    if (!validTables || validTables.length === 0) {
      this.clearHighlight();
      return;
    }

    const hasValue =
      (item?.description?.trim() ||
        item?.qty?.toString()?.trim() ||
        item?.amount?.trim()) !== '';

    if (!hasValue) {
      this.clearHighlight();
      return;
    }

  // Close any open magnifier when interacting with line items
  this.showMagnifier = false;
  this.magnifierCoords = null;

  this.activeField = 'lineItems';
  // highlight ALL matching tables (no per-item tableIndex required)
  const stackedList: FieldCoords[] = validTables.map(t => this.getStackedCoords(t as FieldCoords));
    // draw highlights: clear first, then append for remaining
    if (stackedList.length > 0) {
      this.drawHighlight(stackedList[0], '#0ea5e9', true);
      for (let i = 1; i < stackedList.length; i++) {
        this.drawHighlight(stackedList[i], '#0ea5e9', false);
      }
    }
    this.lastCoordsList = stackedList;
    this.lastInputEl = inputEl || null;
    this.lastColor = '#0ea5e9';
    
    // Auto-scroll to center the first table when focusing line items
    if (stackedList.length > 0) {
      this.scrollToField(stackedList[0]);
    }
    
    if (inputEl) {
      // draw connectors to all highlighted tables
      stackedList.forEach((s, i) => this.drawConnector(inputEl, s, '#0ea5e9', i > 0));
    }
  }

  // Draw a highlight rect. When `clear` is true the canvas is cleared first; otherwise the rect is appended.
  drawHighlight(coords: FieldCoords, color: string, clear = true) {
    const ctx = this.highlightCanvas.nativeElement.getContext('2d')!;
    if (clear) ctx.clearRect(0, 0, this.highlightCanvas.nativeElement.width, this.highlightCanvas.nativeElement.height);
    ctx.fillStyle = hexToRgba(color, 0.28);
    ctx.fillRect(coords.x, coords.y, coords.w, coords.h);
  }

  // Draw a connector line from the input element to a highlighted rect.
  // If `append` is false the link canvas is cleared first; otherwise the line is appended.
  drawConnector(inputEl: HTMLInputElement, coords: FieldCoords, color: string, append = false) {
    if (!inputEl || !coords || !coords.w || !coords.h) return;

    // Ensure overlay matches current layout
    this.sizeLinkCanvasToRow();

    const linkCanvas = this.linkCanvas.nativeElement;
    const lctx = linkCanvas.getContext('2d')!;
    if (!append) lctx.clearRect(0, 0, linkCanvas.width, linkCanvas.height);

    // Measure everything in *viewport (CSS) pixels*
    const rowRect = this.rowWrap.nativeElement.getBoundingClientRect();
    const inputRect = inputEl.getBoundingClientRect();
    const hiRect = this.highlightCanvas.nativeElement.getBoundingClientRect(); // anchor to highlight canvas (already zoom/scroll adjusted)

    // START: use the left-center of the extracted textbox so the line spans fully
    const startX = (inputRect.left - rowRect.left);
    const startY = (inputRect.top - rowRect.top) + inputRect.height / 2;

    // END: center of the highlighted rect in the PDF (PDF coords → highlight-canvas CSS coords)
    const endX = (hiRect.left - rowRect.left) + (coords.x + coords.w / 2) * this.zoomLevel;
    const endY = (hiRect.top  - rowRect.top) + (coords.y + coords.h / 2) * this.zoomLevel;

    // Optional elbow for readability
    const midX = (startX + endX) / 2;

    lctx.save();
    lctx.beginPath();
    lctx.setLineDash([6, 6]);
    lctx.lineWidth = 1.25;
    lctx.strokeStyle = hexToRgba(color || '#000000', 0.35);

    // crisp dashes: half-pixel align in CSS pixel space
    const m = (x: number, y: number) => lctx.moveTo(Math.round(x) + 0.5, Math.round(y) + 0.5);
    const l = (x: number, y: number) => lctx.lineTo(Math.round(x) + 0.5, Math.round(y) + 0.5);

    m(startX, startY);
    l(midX, startY);
    l(endX, endY);
    lctx.stroke();
    lctx.restore();
  }




  clearHighlight(force = false) {
    // When forced, also close the magnifier and reset magnifier coords.
    if (force) {
      this.showMagnifier = false;
      this.magnifierCoords = null;
    } else {
      const now = performance.now();
      // If magnifier is open, avoid clearing highlights on incidental blurs unless forced
      if (this.showMagnifier || now < this.suppressClearUntil) return;
    }

    const ctx = this.highlightCanvas.nativeElement.getContext('2d')!;
    ctx.clearRect(0, 0, this.highlightCanvas.nativeElement.width, this.highlightCanvas.nativeElement.height);
    this.clearLinkCanvas();

    this.activeField = null;
    this.lastCoords = null;
    this.lastInputEl = null;
  }

  clearLinkCanvas() {
    const lctx = this.linkCanvas.nativeElement.getContext('2d')!;
    lctx.clearRect(0, 0, this.linkCanvas.nativeElement.width, this.linkCanvas.nativeElement.height);
  }

  getFileName(path: string): string {
    return path.split('/').pop() || '';
  }

  getConfidenceColor(conf?: number) {
    if (conf === undefined || conf === null) return 'text-slate-400';
    if (conf >= 95) return 'text-green-600';
    if (conf >= 80) return 'text-yellow-600';
    return 'text-red-500';
  }

  // ===========================================
  // EVENT HANDLERS
  // ===========================================
  @HostListener('window:resize')
  onResize() {
    this.sizeLinkCanvasToRow();
    this.redrawConnector();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.redrawConnector();
  }

redrawConnector() {
  if ((!this.lastCoordsList || this.lastCoordsList.length === 0) && !this.lastCoords) return;
  if (!this.lastInputEl) return;
  this.sizeLinkCanvasToRow();
  if (this.lastCoordsList && this.lastCoordsList.length > 0) {
    this.lastCoordsList.forEach((c, i) => this.drawConnector(this.lastInputEl!, c, this.lastColor, i > 0));
    return;
  }
  // fallback single coord
  this.drawConnector(this.lastInputEl, this.lastCoords!, this.lastColor);
}


  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    const pressed = event.key.toLowerCase();
    const field = this.fieldList.find(f => f.hotkey === pressed);
    if (field && this.currentDoc) {
      event.preventDefault();
      const index = this.fieldList.findIndex(f => f.key === field.key);
      const inputEl = this.fieldInputs.get(index)?.nativeElement;
      if (inputEl) {
        inputEl.focus();
        this.highlight(field, inputEl);
      }
    }
  }

  // ===========================================
  // MAGNIFIER
  // ===========================================
  onHighlightHover(event: MouseEvent) {
    const canvas = this.highlightCanvas.nativeElement;
    if (!this.lastCoords || !this.lastCoords.w || !this.lastCoords.h) {
      canvas.style.cursor = 'default';
      return;
    }

    const pdfRect = this.pdfWrapper.nativeElement.getBoundingClientRect();
    const x = (event.clientX - pdfRect.left) / this.zoomLevel;
    const y = (event.clientY - pdfRect.top) / this.zoomLevel;
    const { x: hx, y: hy, w: hw, h: hh } = this.lastCoords;
    const inside = x >= hx && x <= hx + hw && y >= hy && y <= hy + hh;
    canvas.style.cursor = inside ? 'zoom-in' : 'default';
  }

  async onHighlightClick(event: MouseEvent) {
    event.preventDefault();
    if (!this.activeField || !this.lastCoords || !this.lastCoords.w || !this.lastCoords.h) return;

    const pdfRect = this.pdfWrapper.nativeElement.getBoundingClientRect();
    const clickX = (event.clientX - pdfRect.left) / this.zoomLevel;
    const clickY = (event.clientY - pdfRect.top) / this.zoomLevel;
    const { x, y, w, h } = this.lastCoords;
    const inside = clickX >= x && clickX <= x + w && clickY >= y && clickY <= y + h;
    if (!inside) return;

    const rect = this.pdfScroll.nativeElement.getBoundingClientRect();
    const panelW = 320, panelH = 240;

    let top = (event.clientY - rect.top) - panelH / 2;
    let left = (event.clientX - rect.left) + 20;

    // Keep within bounds
    top = Math.max(10, Math.min(top, rect.height - panelH - 10));
    left = Math.max(10, Math.min(left, rect.width - panelW - 10));

    this.magnifierPosition = { top, left };


    this.showMagnifier = true;
    this.magnifierCoords = this.lastCoords;
    this.magnifierColor = this.lastColor;

    // Ensure canvas exists before rendering
    this.cdr.detectChanges();
    requestAnimationFrame(() => this.renderMagnifier());
  }

  async renderMagnifier() {
    if (!this.showMagnifier || !this.magnifierCoords) return;

    const mCanvas = this.magnifierCanvas.nativeElement;
    const mCtx = mCanvas.getContext('2d')!;
    const { x, y, w, h } = this.magnifierCoords;
    const zoom = this.magnifierZoom;

    if (!mCanvas.width || !mCanvas.height) {
      mCanvas.width = Math.max(1, Math.floor(mCanvas.clientWidth));
      mCanvas.height = Math.max(1, Math.floor(mCanvas.clientHeight));
    }

  // Draw magnified crop sized to the detected coords (scaled by zoom).
  mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);

  // Determine source canvas: prefer fullRenderCanvas, otherwise use per-page canvas
  let srcCanvas: HTMLCanvasElement | null = this.fullRenderCanvas;
  // Destination rect we'll draw into (computed below)
  let destX = 0, destY = 0, destW = 0, destH = 0;

    if (!srcCanvas) {
      // find the page index that contains the magnifier coords
      let pageIndex = -1;
      for (let i = 0; i < this.pageViewports.length; i++) {
        const offset = this.pageOffsets[i] || 0;
        const pageHeight = this.pageViewports[i].viewport.height;
        if (y >= offset && y < offset + pageHeight) {
          pageIndex = i;
          break;
        }
      }

      if (pageIndex >= 0) {
        const pageNum = pageIndex + 1;
        const pageCanvas = this.pageCanvasMap.get(pageNum) || null;
        if (pageCanvas) {
          // ensure the page is rendered
          if (!pageCanvas.getAttribute('data-painted')) {
            try {
              await this.renderPageToCanvas(pageNum, pageCanvas);
            } catch (e) {
              console.error('[PDF] magnifier: failed to render source page', { pageNum, err: e });
              return;
            }
          }
          srcCanvas = pageCanvas;
          // adjust y to page-local coordinates
          const pageOffset = this.pageOffsets[pageIndex] || 0;
          const localY = y - pageOffset;

          const srcX = Math.max(0, Math.floor(x));
          const srcY = Math.max(0, Math.floor(localY));
          const srcW = Math.min(srcCanvas.width - srcX, Math.ceil(w));
          const srcH = Math.min(srcCanvas.height - srcY, Math.ceil(h));

          // Compute an effective zoom that preserves aspect ratio and fits the
          // scaled crop inside the magnifier canvas. If the requested zoom
          // (e.g. 2x) would make the crop larger than the canvas, reduce it
          // uniformly so the entire crop is visible.
          let effectiveZoom = zoom;
          if (srcW > 0 && srcH > 0) {
            effectiveZoom = Math.min(zoom, mCanvas.width / srcW, mCanvas.height / srcH);
          }
          destW = Math.floor(srcW * effectiveZoom);
          destH = Math.floor(srcH * effectiveZoom);
          destX = Math.round((mCanvas.width - destW) / 2);
          destY = Math.round((mCanvas.height - destH) / 2);

          mCtx.drawImage(srcCanvas, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
        } else {
          // no source available
          console.debug('[PDF] magnifier: no source canvas for page', { pageIndex });
          return;
        }
      } else {
        // if no page found, bail
        console.debug('[PDF] magnifier: coords outside page ranges', { x, y });
        return;
      }
    } else {
      // Crop from cached fullRenderCanvas without extra padding
      const srcX = Math.max(0, Math.floor(x));
      const srcY = Math.max(0, Math.floor(y));
      const srcW = Math.min(this.fullRenderCanvas.width - srcX, Math.ceil(w));
      const srcH = Math.min(this.fullRenderCanvas.height - srcY, Math.ceil(h));

      // Compute effective zoom to fit the crop while preserving aspect ratio
      let effectiveZoom = zoom;
      if (srcW > 0 && srcH > 0) {
        effectiveZoom = Math.min(zoom, mCanvas.width / srcW, mCanvas.height / srcH);
      }
      destW = Math.floor(srcW * effectiveZoom);
      destH = Math.floor(srcH * effectiveZoom);
      destX = Math.round((mCanvas.width - destW) / 2);
      destY = Math.round((mCanvas.height - destH) / 2);

      mCtx.drawImage(this.fullRenderCanvas, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
    }

    // draw a border around the magnified content (inside the canvas)
    mCtx.strokeStyle = this.magnifierColor;
    mCtx.lineWidth = 2;
    // Use the destX/destY/destW/destH computed above; if they are undefined (shouldn't be), skip stroke
    try {
      mCtx.strokeRect(Math.max(0, (destX || 0)) + 0.5, Math.max(0, (destY || 0)) + 0.5, Math.max(0, (destW || 0)) - 1, Math.max(0, (destH || 0)) - 1);
    } catch (e) {
      // ignore
    }
  }

  closeMagnifier() {
    this.showMagnifier = false;
    this.magnifierCoords = null;
    this.clearHighlight();
  }
}
