var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
let OutputComponent = class OutputComponent {
};
OutputComponent = __decorate([
    Component({
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
], OutputComponent);
export { OutputComponent };
//# sourceMappingURL=output.component.js.map