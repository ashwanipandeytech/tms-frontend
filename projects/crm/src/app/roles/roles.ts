import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent {
}
