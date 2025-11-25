import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Breadcrumb -->
      <nav class="bg-white border-b border-slate-200 px-6 py-3">
        <div class="flex items-center space-x-2 text-sm text-slate-600">
          <button class="hover:text-slate-900">Home</button>
          <span>/</span>
          <button class="hover:text-slate-900">Queues</button>
          <span>/</span>
          <button class="hover:text-slate-900">{{ projectName }}</button>
          <span>/</span>
          <span class="text-slate-900">Item {{ queueId }}</span>
        </div>
      </nav>

      <!-- Page Header -->
      <div class="bg-white border-b border-slate-200 px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 mb-3">Queue Item Details</h1>
            <div class="flex items-center space-x-4">
              <!-- Status Badge -->
              <span [ngClass]="getStatusBadgeClass()" class="px-3 py-1 rounded-full text-sm font-medium">
                {{ status }}
              </span>
              
              <!-- Priority Pill -->
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span [ngClass]="getPriorityClass()" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ priority }}
                </span>
              </div>
              
              <!-- Updated timestamp -->
              <span class="text-sm text-slate-500">Updated {{ lastUpdated | date:'medium' }}</span>
            </div>
          </div>
          
          <!-- Right side buttons -->
          <div class="flex items-center space-x-3">
            <button 
              (click)="goBack()" 
              class="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Queue
            </button>
            
            <!-- Actions Dropdown -->
            <div class="relative">
              <button 
                (click)="toggleActionsMenu()"
                class="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
                Actions
              </button>
              
              <div *ngIf="actionsMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                <div class="py-1">
                  <button class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Reprocess</button>
                  <button class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Send to Manual Review</button>
                  <button class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export JSON</button>
                  <hr class="my-1">
                  <button class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete Item</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="px-6 py-6">
        <!-- Two-column grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          <!-- Summary Card -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-slate-900">Summary</h2>
              <span class="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                SLA {{ slaTimestamp | date:'short' }}
              </span>
            </div>
            
            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <dt class="text-sm font-medium text-slate-500">Queue ID</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ queueId }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">External ID</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ externalId }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">Project</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ projectName }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">Document Type</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ documentType }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">Priority</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ priority }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">Confidence</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ confidence }}%</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">Created</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ uploadDate | date:'medium' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">Last Updated</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ lastUpdated | date:'medium' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">Model Name + Version</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ modelName }} v{{ modelVersion }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">Runtime</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ runtime }}ms</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">File Name + Size</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ filename }} ({{ fileSize }})</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-slate-500">Processing Time</dt>
                <dd class="text-sm text-slate-900 mt-1">{{ processingTime }}s</dd>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex space-x-3">
              <button class="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                View Logs
              </button>
              <button class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Reprocess
              </button>
            </div>
          </div>
          
          <!-- Document Preview Card -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-slate-900">Document Preview</h2>
              <span class="text-sm text-slate-500">Page {{ currentPage }} of {{ totalPages }}</span>
            </div>
            
            <!-- Preview Area -->
            <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mb-4">
              <svg class="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-slate-600">{{ filename }}</p>
              <p class="text-sm text-slate-500">Preview placeholder</p>
            </div>
            
            <!-- Navigation -->
            <div class="flex justify-center space-x-2 mb-6">
              <button [disabled]="currentPage <= 1" class="px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button [disabled]="currentPage >= totalPages" class="px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            
            <!-- Footer -->
            <div class="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                <select class="px-3 py-2 border border-slate-300 rounded-lg text-sm w-full sm:w-auto">
                  <option>Invoice</option>
                  <option>Receipt</option>
                  <option>Purchase Order</option>
                </select>
                <div class="flex items-center space-x-1 text-sm text-slate-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Confidence: {{ confidence }}%</span>
                </div>
              </div>
              <div class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <button class="inline-flex items-center justify-center px-2 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors w-full sm:w-auto">
                  <svg class="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <span class="hidden sm:inline">Full View</span>
                  <span class="sm:hidden">View</span>
                </button>
                <button class="inline-flex items-center justify-center px-2 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto">
                  <svg class="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                  Annotate
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Second Two-column grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          <!-- Extraction Results Card -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-slate-900">Extraction Results</h2>
              <p class="text-sm text-slate-500">Key-value pairs with confidence and review flags</p>
            </div>
            
            <!-- Results Table -->
            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead class="border-b border-slate-200">
                  <tr>
                    <th class="text-left py-3 pr-4 font-medium text-slate-700">Field</th>
                    <th class="text-left py-3 pr-4 font-medium text-slate-700">Value</th>
                    <th class="text-left py-3 pr-4 font-medium text-slate-700">Confidence</th>
                    <th class="text-left py-3 font-medium text-slate-700">Needs Review</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let result of extractionResults" [class]="result.confidence < 0.8 ? 'bg-amber-50' : ''">
                    <td class="py-3 pr-4 font-medium text-slate-900">{{ result.field }}</td>
                    <td class="py-3 pr-4 text-slate-700">{{ result.value }}</td>
                    <td class="py-3 pr-4">
                      <div class="flex items-center space-x-2">
                        <div class="flex-1 bg-slate-200 rounded-full h-2">
                          <div 
                            class="bg-blue-600 h-2 rounded-full" 
                            [style.width.%]="result.confidence * 100">
                          </div>
                        </div>
                        <span class="text-xs text-slate-600">{{ (result.confidence * 100) | number:'1.0-0' }}%</span>
                      </div>
                    </td>
                    <td class="py-3">
                      <span [ngClass]="result.needsReview ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'" 
                            class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ result.needsReview ? 'Review' : 'OK' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Bottom section -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600">{{ getFieldsRequiringValidation() }} fields require manual validation</span>
              <div class="flex space-x-2">
                <button class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                  Download CSV
                </button>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Export JSON
                </button>
              </div>
            </div>
          </div>
          
          <!-- Activity Timeline Card -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-slate-900">Activity Timeline</h2>
              <p class="text-sm text-slate-500">System events for this item</p>
            </div>
            
            <!-- Timeline -->
            <div class="space-y-4 mb-6">
              <div *ngFor="let event of timelineEvents" class="flex space-x-3">
                <div class="flex-shrink-0">
                  <div [ngClass]="getEventIconClass(event.type)" class="w-8 h-8 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path *ngIf="event.type === 'created'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      <path *ngIf="event.type === 'picked'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      <path *ngIf="event.type === 'model'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      <path *ngIf="event.type === 'validation'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      <path *ngIf="event.type === 'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-slate-500">{{ event.timestamp | date:'medium' }}</p>
                  <p class="text-sm font-medium text-slate-900">{{ event.description }}</p>
                </div>
              </div>
            </div>
            
            <!-- Bottom buttons -->
            <div class="flex space-x-2">
              <button class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                Full Audit Log
              </button>
              <button class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                Export
              </button>
            </div>
          </div>
        </div>
        
        <!-- Execution Logs Section -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div class="border-b border-slate-200 mb-6">
            <nav class="-mb-px flex space-x-8">
              <button 
                *ngFor="let tab of logTabs" 
                (click)="activeLogTab = tab"
                [class]="activeLogTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
                class="py-2 px-1 border-b-2 font-medium text-sm">
                {{ tab }}
              </button>
            </nav>
          </div>
          
          <!-- Logs Tab -->
          <div *ngIf="activeLogTab === 'Logs'">
            <div class="bg-slate-50 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
              <div *ngFor="let log of logEntries" [class]="getLogEntryClass(log.level)">
                <span class="text-slate-500">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                <span class="font-medium ml-2">[{{ log.level }}]</span>
                <span class="ml-2">{{ log.message }}</span>
              </div>
            </div>
          </div>
          
          <!-- Raw JSON Tab -->
          <div *ngIf="activeLogTab === 'Raw JSON'">
            <div class="bg-slate-50 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
              <pre>{{ rawJsonData | json }}</pre>
            </div>
          </div>
          
          <!-- Actions Tab -->
          <div *ngIf="activeLogTab === 'Actions'">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Reprocess with Options -->
              <div class="border border-slate-200 rounded-lg p-4">
                <h3 class="font-medium text-slate-900 mb-4">Reprocess with Options</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Model</label>
                    <select class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      <option>GPT-4 Turbo</option>
                      <option>Claude 3</option>
                      <option>Custom Model</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Run Note</label>
                    <textarea class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows="3" placeholder="Optional note..."></textarea>
                  </div>
                  <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    Reprocess Now
                  </button>
                </div>
              </div>
              
              <!-- Routing -->
              <div class="border border-slate-200 rounded-lg p-4">
                <h3 class="font-medium text-slate-900 mb-4">Routing</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Connector</label>
                    <select class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      <option>Email</option>
                      <option>REST API</option>
                      <option>SharePoint</option>
                      <option>Drive</option>
                      <option>Webhook</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Target/Endpoint</label>
                    <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Enter target endpoint...">
                  </div>
                  <button class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                    Send Output
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-500">Item {{ queueId }} · {{ filename }}</span>
          <div class="flex items-center space-x-3">
            <button class="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Previous Item
            </button>
            <button class="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
              Next Item
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <button class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
              Download Package
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FileDetailsComponent implements OnInit {
  filename: string = '';
  fileSize: string = '';
  uploadDate: Date = new Date();
  uploadedBy: string = '';
  status: string = '';
  priority: string = 'Medium';
  queueId: string = '';
  externalId: string = '';
  projectName: string = '';
  documentType: string = '';
  confidence: number = 85;
  lastUpdated: Date = new Date();
  slaTimestamp: Date = new Date();
  modelName: string = 'GPT-4 Turbo';
  modelVersion: string = '1.2';
  runtime: number = 1250;
  processingTime: number = 3.2;
  currentPage: number = 1;
  totalPages: number = 3;
  
  // UI State
  actionsMenuOpen: boolean = false;
  activeLogTab: string = 'Logs';
  logTabs: string[] = ['Logs', 'Raw JSON', 'Actions'];
  
  // Sample data
  extractionResults = [
    { field: 'Invoice Number', value: 'INV-2024-001234', confidence: 0.95, needsReview: false },
    { field: 'Total Amount', value: '$1,250.00', confidence: 0.92, needsReview: false },
    { field: 'Date', value: '2024-10-28', confidence: 0.75, needsReview: true },
    { field: 'Vendor Name', value: 'ABC Corp Ltd', confidence: 0.88, needsReview: false },
    { field: 'Tax Amount', value: '$125.00', confidence: 0.65, needsReview: true }
  ];
  
  timelineEvents = [
    { 
      type: 'created', 
      timestamp: new Date(Date.now() - 3600000), 
      description: 'Item created and added to queue' 
    },
    { 
      type: 'picked', 
      timestamp: new Date(Date.now() - 3000000), 
      description: 'Processing started by worker node' 
    },
    { 
      type: 'model', 
      timestamp: new Date(Date.now() - 2400000), 
      description: 'Document processed by GPT-4 Turbo model' 
    },
    { 
      type: 'validation', 
      timestamp: new Date(Date.now() - 1800000), 
      description: 'Validation rules applied' 
    }
  ];
  
  logEntries = [
    { timestamp: new Date(Date.now() - 1800000), level: 'INFO', message: 'Processing started for document_1.pdf' },
    { timestamp: new Date(Date.now() - 1700000), level: 'INFO', message: 'OCR extraction completed successfully' },
    { timestamp: new Date(Date.now() - 1600000), level: 'WARN', message: 'Low confidence detected for date field' },
    { timestamp: new Date(Date.now() - 1500000), level: 'INFO', message: 'Model inference completed in 1.25s' },
    { timestamp: new Date(Date.now() - 1400000), level: 'ERROR', message: 'Validation failed for tax amount field' },
    { timestamp: new Date(Date.now() - 1300000), level: 'INFO', message: 'Processing completed with 2 review flags' }
  ];
  
  rawJsonData = {
    queueId: 'Q-2024-001234',
    status: 'Completed',
    confidence: 0.85,
    extractedFields: {
      invoiceNumber: 'INV-2024-001234',
      totalAmount: 1250.00,
      date: '2024-10-28',
      vendorName: 'ABC Corp Ltd'
    },
    metadata: {
      processingTime: 3.2,
      modelVersion: '1.2',
      timestamp: new Date().toISOString()
    }
  };

  // Legacy properties for compatibility
  queuedTime: Date | null = null;
  processingStartTime: Date | null = null;
  completedTime: Date | null = null;
  errorMessage: string = '';

  constructor() {}

  ngOnInit() {
    // Get filename from localStorage (set by queue-all component)
    this.filename = localStorage.getItem('selectedFilename') || 'unknown_file.pdf';
    this.loadFileDetails();
  }

  loadFileDetails() {
    // In a real application, you would fetch this data from an API
    // For now, we'll simulate some data based on the filename
    const now = new Date();
    
    this.fileSize = '2.4 MB';
    this.uploadDate = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    this.uploadedBy = 'alice.s';
    this.queueId = 'Q-2024-' + Math.floor(Math.random() * 100000).toString().padStart(6, '0');
    this.externalId = 'EXT-' + Math.floor(Math.random() * 10000);
    this.projectName = 'Invoice Processing';
    this.documentType = 'Invoice';
    this.lastUpdated = new Date(now.getTime() - Math.random() * 60 * 60 * 1000);
    this.slaTimestamp = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    // Simulate different statuses
    const statuses = ['Queued', 'In Progress', 'Completed', 'Failed'];
    this.status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const priorities = ['Low', 'Medium', 'High'];
    this.priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    // Legacy compatibility
    this.queuedTime = new Date(this.uploadDate.getTime() + 5 * 60 * 1000);
    
    if (this.status !== 'Queued') {
      this.processingStartTime = new Date(this.queuedTime!.getTime() + Math.random() * 30 * 60 * 1000);
    }
    
    if (this.status === 'Completed' || this.status === 'Failed') {
      this.completedTime = new Date(this.processingStartTime!.getTime() + Math.random() * 60 * 60 * 1000);
    }
    
    if (this.status === 'Failed') {
      this.errorMessage = `Processing failed for ${this.filename}. Invalid file format or corrupted data.`;
    }
  }

  getFileType(): string {
    const extension = this.filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'docx':
        return 'Word Document';
      case 'xlsx':
        return 'Excel Spreadsheet';
      case 'txt':
        return 'Text File';
      default:
        return 'Unknown';
    }
  }

  getStatusBadgeClass(): string {
    switch (this.status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Failed':
        return 'bg-red-100 text-red-700';
      case 'Queued':
        return 'bg-slate-100 text-slate-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
  
  getPriorityClass(): string {
    switch (this.priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      case 'Low':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
  
  getEventIconClass(type: string): string {
    switch (type) {
      case 'created':
        return 'bg-slate-100 text-slate-600';
      case 'picked':
        return 'bg-green-100 text-green-600';
      case 'model':
        return 'bg-blue-100 text-blue-600';
      case 'validation':
        return 'bg-amber-100 text-amber-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }
  
  getLogEntryClass(level: string): string {
    switch (level) {
      case 'ERROR':
        return 'text-red-600';
      case 'WARN':
        return 'text-amber-600';
      case 'INFO':
        return 'text-slate-700';
      default:
        return 'text-slate-700';
    }
  }
  
  getFieldsRequiringValidation(): number {
    return this.extractionResults.filter(result => result.needsReview).length;
  }
  
  toggleActionsMenu(): void {
    this.actionsMenuOpen = !this.actionsMenuOpen;
  }

  goBack() {
    // Hide all views and show the queue-all view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const queueAllView = document.getElementById('queue-all');
    if (queueAllView) {
      queueAllView.classList.add('active');
    }
    
    // Update sidebar navigation highlight
    document.querySelectorAll('.nav-view').forEach(n => n.classList.remove('bg-indigo-600','text-white','font-medium'));
    const queueNavItem = document.querySelector(`.nav-view[data-target="queue-all"]`);
    if (queueNavItem) {
      queueNavItem.classList.add('bg-indigo-600','text-white','font-medium');
    }
  }

  downloadFile() {
    // Simulate file download
    console.log(`Downloading file: ${this.filename}`);
    alert(`Download started for: ${this.filename}`);
  }

  retryProcessing() {
    // Simulate retry processing
    console.log(`Retrying processing for: ${this.filename}`);
    this.status = 'Queued';
    this.queuedTime = new Date();
    this.processingStartTime = null;
    this.completedTime = null;
    this.errorMessage = '';
    alert(`${this.filename} has been added back to the processing queue.`);
  }

  viewLogs() {
    // Simulate viewing logs
    console.log(`Viewing logs for: ${this.filename}`);
    this.activeLogTab = 'Logs';
  }
}