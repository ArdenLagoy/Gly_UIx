import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [BrowserModule, AppComponent, PdfViewerModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
