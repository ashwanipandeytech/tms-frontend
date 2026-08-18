import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotels.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelsComponent {
}
