import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoices.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoicesComponent {
}
