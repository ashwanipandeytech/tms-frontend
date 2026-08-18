import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicles.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesComponent {
}
