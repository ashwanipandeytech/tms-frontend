import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-villas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './villas.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillasComponent {
}
