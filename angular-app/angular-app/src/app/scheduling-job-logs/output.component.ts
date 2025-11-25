import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'output-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="p-4">
      <h2 class="text-lg font-semibold">Output</h2>
      <p class="text-sm text-slate-600">This is the Output view. Show outputs, artifacts or report history here.</p>
    </section>
  `
})
export class OutputComponent {}
