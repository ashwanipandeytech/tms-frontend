import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationStart } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('crm');
  private router = inject(Router);
  private toastr = inject(ToastrService);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.toastr.clear();
    });
  }
}
