import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cab-vendors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cab-vendors.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CabVendorsComponent {
}
