import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './destinations.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DestinationsComponent {
}
