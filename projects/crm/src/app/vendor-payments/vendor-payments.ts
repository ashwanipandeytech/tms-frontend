import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendor-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-payments.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorPaymentsComponent {
}
