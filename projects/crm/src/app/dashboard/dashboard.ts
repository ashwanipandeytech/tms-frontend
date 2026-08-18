import { Component, ChangeDetectionStrategy, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from '../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  dashboardResource = resource({
    loader: () => firstValueFrom(this.dashboardService.getDashboardData())
  });

  constructor(private dashboardService: DashboardService) {}
}
