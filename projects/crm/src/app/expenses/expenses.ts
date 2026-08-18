import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpensesComponent {
}
