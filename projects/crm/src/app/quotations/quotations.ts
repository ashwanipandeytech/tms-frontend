import { Component } from '@angular/core';
import { QuotationListComponent } from './quotation-list/quotation-list';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [QuotationListComponent],
  template: `<app-quotation-list></app-quotation-list>`
})
export class QuotationsComponent {}
