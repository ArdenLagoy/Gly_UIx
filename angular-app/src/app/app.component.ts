import { Component } from '@angular/core';
import { GlyphxHomepageComponent } from './glyphx-homepage/glyphx-homepage.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GlyphxHomepageComponent],
  template: `<glyphx-homepage></glyphx-homepage>`
})
export class AppComponent { }
