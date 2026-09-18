import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QuotationService } from '../../core/services/quotation.service';
import { AuthService } from '../../core/services/auth.service';
import { Quotation, QuotationApprovalLog } from '../../core/models/quotation.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quotation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quotation-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotationDetailComponent implements OnInit {
  quotation = signal<Quotation | null>(null);
  approvalLogs = signal<QuotationApprovalLog[]>([]);
  isLoading = signal<boolean>(true);
  actionError = signal<string | null>(null);
  actionSuccess = signal<string | null>(null);
  isActionLoading = signal<boolean>(false);

  // Modal State
  activeModalAction = signal<'approve' | 'reject' | null>(null);
  modalComments = signal<string>('');

  // User Role Check
  isManagerOrAdmin = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return true;
    return user.role_id === 1 || user.role_id === 2 || user.role?.id === 1 || user.role?.id === 2 || user.role?.name === 'Super Admin' || user.role?.name === 'Manager';
  });

  returnTab = signal<string>('all');

  constructor(
    private quotationService: QuotationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    if (tabParam) {
      this.returnTab.set(tabParam);
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadQuotation(+id);
    }
  }

  async loadQuotation(id: number): Promise<void> {
    this.isLoading.set(true);
    try {
      const q = await firstValueFrom(this.quotationService.getQuotation(id));
      this.quotation.set(q);
      if (q.approval_logs) {
        this.approvalLogs.set(q.approval_logs);
      }
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to load quotation');
    } finally {
      this.isLoading.set(false);
    }
  }

  async submitApproval(): Promise<void> {
    if (!this.quotation()) return;
    this.isActionLoading.set(true);
    try {
      const updated = await firstValueFrom(this.quotationService.submitApproval(this.quotation()!.id, 'Submitted for Manager approval'));
      this.quotation.set(updated);
      this.actionSuccess.set('Submitted for Manager approval!');
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to submit quotation for approval');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  openApprovalModal(action: 'approve' | 'reject'): void {
    this.activeModalAction.set(action);
    this.modalComments.set(action === 'approve' ? 'Approved by Manager' : '');
  }

  closeModal(): void {
    this.activeModalAction.set(null);
    this.modalComments.set('');
  }

  async submitModalAction(): Promise<void> {
    const q = this.quotation();
    const action = this.activeModalAction();
    const comments = this.modalComments().trim();

    if (!q || !action) return;

    if (action === 'reject' && !comments) {
      alert('Please enter a rejection reason for the sales executive.');
      return;
    }

    this.isActionLoading.set(true);
    try {
      let updated: Quotation;
      if (action === 'approve') {
        updated = await firstValueFrom(this.quotationService.approveQuotation(q.id, comments));
        this.actionSuccess.set('Quotation APPROVED successfully!');
      } else {
        updated = await firstValueFrom(this.quotationService.rejectInternal(q.id, comments));
        this.actionSuccess.set('Quotation returned for revision with feedback.');
      }
      this.quotation.set(updated);
      if (updated.approval_logs) {
        this.approvalLogs.set(updated.approval_logs);
      }
      this.closeModal();
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to update quotation approval status');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  async sendQuotation(): Promise<void> {
    if (!this.quotation()) return;
    if (this.quotation()?.approval_status === 'pending_approval') {
      alert('This quotation is pending Manager approval. It cannot be sent to the client until approved.');
      return;
    }

    this.isActionLoading.set(true);
    try {
      const updated = await firstValueFrom(this.quotationService.sendQuotation(this.quotation()!.id));
      this.quotation.set(updated);
      this.actionSuccess.set('Quotation marked as Sent!');
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to send quotation');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  async acceptQuotation(): Promise<void> {
    if (!this.quotation()) return;
    this.isActionLoading.set(true);
    try {
      const updated = await firstValueFrom(this.quotationService.acceptQuotation(this.quotation()!.id));
      this.quotation.set(updated);
      this.actionSuccess.set('Quotation marked as Accepted!');
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to accept quotation');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  async duplicateQuotation(mode: 'option' | 'template' = 'option'): Promise<void> {
    if (!this.quotation()) return;
    const modeLabel = mode === 'option' ? 'New Option for Same Client' : 'Reusable Template for New Client';
    if (!confirm(`Duplicate Quotation #${this.quotation()!.quotation_no} as ${modeLabel}?`)) return;

    this.isActionLoading.set(true);
    try {
      const newQ = await firstValueFrom(this.quotationService.duplicateQuotation(this.quotation()!.id, mode));
      this.router.navigate(['/quotations/edit', newQ.id]);
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to duplicate quotation');
      this.isActionLoading.set(false);
    }
  }

  async convertToBooking(): Promise<void> {
    if (!this.quotation()) return;
    if (!confirm(`Convert Quotation #${this.quotation()!.quotation_no} to a Confirmed Booking?`)) return;

    this.isActionLoading.set(true);
    try {
      const booking = await firstValueFrom(this.quotationService.convertToBooking(this.quotation()!.id));
      this.actionSuccess.set(`Created Confirmed Booking #${booking.booking_no}!`);
      this.loadQuotation(this.quotation()!.id);
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to convert to booking');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  downloadPdf(): void {
    if (!this.quotation()) return;
    if (this.quotation()?.approval_status === 'pending_approval') {
      alert('PDF Download is locked until Manager approval is granted.');
      return;
    }

    this.actionError.set(null);
    this.quotationService.downloadPdfBlob(this.quotation()!.id).subscribe({
      next: (blob: Blob) => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      },
      error: (err: any) => {
        console.error('Failed to download PDF blob', err);
        this.actionError.set(err?.error?.message || 'Failed to download PDF');
      }
    });
  }

  getStatusBadgeClass(status: string, convertedId?: number): string {
    if (convertedId) return 'bg-dark text-white border-0';
    switch (status?.toLowerCase()) {
      case 'draft': return 'bg-secondary text-white border-0';
      case 'sent': return 'bg-primary text-white border-0';
      case 'accepted': return 'bg-success text-white border-0';
      case 'rejected': return 'bg-danger text-white border-0';
      default: return 'bg-info text-dark border-0';
    }
  }

  getApprovalBadgeClass(approvalStatus?: string): string {
    switch (approvalStatus) {
      case 'approved': return 'bg-success-subtle text-success border border-success';
      case 'pending_approval': return 'bg-warning-subtle text-dark border border-warning';
      case 'rejected_internal': return 'bg-danger-subtle text-danger border border-danger';
      default: return 'bg-light text-muted border';
    }
  }
}
