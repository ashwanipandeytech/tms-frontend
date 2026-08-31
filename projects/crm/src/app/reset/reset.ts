import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reset.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetComponent {
  private apiUrl = `${environment.apiUrl}`;
  
  isResetting = signal<boolean>(false);
  resetSuccess = signal<string>('');
  resetError = signal<string>('');
  
  showConfirmDialog = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  confirmReset() {
    this.showConfirmDialog.set(true);
  }

  cancelReset() {
    this.showConfirmDialog.set(false);
  }

  executeReset() {
    this.isResetting.set(true);
    this.resetError.set('');
    this.resetSuccess.set('');
    this.showConfirmDialog.set(false);

    this.http.delete<ApiResponse<any>>(`${this.apiUrl}/admin/reset`).subscribe({
      next: (res) => {
        if (res.success) {
          this.resetSuccess.set('Workspace has been successfully reset. All tenant data cleared except the main Super Admin account.');
        } else {
          this.resetError.set(res.message || 'Failed to reset workspace.');
        }
        this.isResetting.set(false);
      },
      error: (err) => {
        this.resetError.set(err.error?.message || 'An error occurred while resetting the workspace.');
        this.isResetting.set(false);
      }
    });
  }
}
