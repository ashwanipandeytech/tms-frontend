import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { QuotationService } from '../../core/services/quotation.service';
import { AuthService } from '../../core/services/auth.service';
import { Quotation } from '../../core/models/quotation.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quotation-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotationListComponent implements OnInit {
  quotations = signal<Quotation[]>([]);
  isLoading = signal<boolean>(false);
  activeTab = signal<string>('all');
  highlightId = signal<number | null>(null);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalCount = signal<number>(0);
  actionError = signal<string | null>(null);
  actionSuccess = signal<string | null>(null);

  counts = signal<{
    pending_approval: number;
    approved: number;
    drafts: number;
    sent: number;
    accepted: number;
    pipeline_value: number;
  }>({
    pending_approval: 0,
    approved: 0,
    drafts: 0,
    sent: 0,
    accepted: 0,
    pipeline_value: 0
  });

  // User Role Check: Default to true if user is loading so buttons remain accessible to Admin/Manager
  isManagerOrAdmin = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return true;
    return user.role_id === 1 || user.role_id === 2 || user.role?.id === 1 || user.role?.id === 2 || user.role?.name === 'Super Admin' || user.role?.name === 'Manager';
  });

  // Modal State
  activeModalQuotation = signal<Quotation | null>(null);
  activeModalAction = signal<'approve' | 'reject' | null>(null);
  modalComments = signal<string>('');

  constructor(
    private quotationService: QuotationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const queryTab = this.route.snapshot.queryParamMap.get('tab');
    const highlightParam = this.route.snapshot.queryParamMap.get('highlight');

    if (queryTab) {
      this.activeTab.set(queryTab);
    }
    if (highlightParam) {
      this.highlightId.set(+highlightParam);
    }

    this.fetchCounts();
    this.fetchQuotations();
  }

  openApprovalModal(q: Quotation, action: 'approve' | 'reject'): void {
    this.activeModalQuotation.set(q);
    this.activeModalAction.set(action);
    this.modalComments.set(action === 'approve' ? 'Approved by Manager' : '');
  }

  closeModal(): void {
    this.activeModalQuotation.set(null);
    this.activeModalAction.set(null);
    this.modalComments.set('');
  }

  async submitModalAction(): Promise<void> {
    const q = this.activeModalQuotation();
    const action = this.activeModalAction();
    const comments = this.modalComments().trim();

    if (!q || !action) return;

    if (action === 'reject' && !comments) {
      alert('Please enter a rejection reason for the sales executive.');
      return;
    }

    try {
      if (action === 'approve') {
        await firstValueFrom(this.quotationService.approveQuotation(q.id, comments));
        this.actionSuccess.set(`Quotation #${q.quotation_no} APPROVED successfully!`);
      } else {
        await firstValueFrom(this.quotationService.rejectInternal(q.id, comments));
        this.actionSuccess.set(`Quotation #${q.quotation_no} returned for revision with feedback.`);
      }
      this.closeModal();
      this.fetchCounts();
      this.fetchQuotations();
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Action failed');
    }
  }

  async fetchCounts(): Promise<void> {
    try {
      const c = await firstValueFrom(this.quotationService.getCounts());
      this.counts.set(c);
    } catch (err) {
      console.error('Failed to fetch quotation counts', err);
    }
  }

  async fetchQuotations(): Promise<void> {
    this.isLoading.set(true);
    this.actionError.set(null);

    try {
      let statusFilter: string | undefined = undefined;
      let approvalStatusFilter: string | undefined = undefined;

      if (this.activeTab() === 'pending_approval') {
        approvalStatusFilter = 'pending_approval';
      } else if (this.activeTab() === 'approved') {
        approvalStatusFilter = 'approved';
      } else if (this.activeTab() !== 'all') {
        statusFilter = this.activeTab();
      }

      const res = await firstValueFrom(
        this.quotationService.getQuotations({
          page: this.currentPage(),
          per_page: 15,
          search: this.searchQuery(),
          status: statusFilter,
          approval_status: approvalStatusFilter
        })
      );

      this.quotations.set(res.data || []);
      if (res.meta) {
        this.totalPages.set(res.meta.last_page || 1);
        this.totalCount.set(res.meta.total || 0);
      }
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to load quotations');
    } finally {
      this.isLoading.set(false);
    }
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.fetchQuotations();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.fetchQuotations();
  }

  async submitApproval(q: Quotation): Promise<void> {
    try {
      await firstValueFrom(this.quotationService.submitApproval(q.id, 'Submitted for Manager Review'));
      this.actionSuccess.set(`Quotation #${q.quotation_no} submitted for Manager approval!`);
      this.fetchCounts();
      this.fetchQuotations();
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to submit quotation for approval');
    }
  }

  async approveQuotation(q: Quotation): Promise<void> {
    const comments = prompt(`Approve Quotation #${q.quotation_no}? (Optional comments):`, 'Approved by Manager');
    if (comments === null) return; // Cancelled

    try {
      await firstValueFrom(this.quotationService.approveQuotation(q.id, comments));
      this.actionSuccess.set(`Quotation #${q.quotation_no} Approved successfully!`);
      this.fetchCounts();
      this.fetchQuotations();
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to approve quotation');
    }
  }

  async rejectInternal(q: Quotation): Promise<void> {
    const reason = prompt(`Reject & request revision for Quotation #${q.quotation_no}? (Required reason):`);
    if (!reason) {
      if (reason !== null) alert('Rejection reason is required.');
      return;
    }

    try {
      await firstValueFrom(this.quotationService.rejectInternal(q.id, reason));
      this.actionSuccess.set(`Quotation #${q.quotation_no} returned for revision with feedback.`);
      this.fetchCounts();
      this.fetchQuotations();
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to reject quotation');
    }
  }

  async sendQuotation(q: Quotation): Promise<void> {
    if (q.approval_status === 'pending_approval') {
      alert('This quotation is pending Manager approval. It cannot be sent to the client until approved.');
      return;
    }

    try {
      await firstValueFrom(this.quotationService.sendQuotation(q.id));
      this.actionSuccess.set(`Quotation #${q.quotation_no} marked as Sent!`);
      this.fetchCounts();
      this.fetchQuotations();
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to send quotation');
    }
  }

  async duplicateQuotation(q: Quotation, mode: 'option' | 'template' = 'option'): Promise<void> {
    const modeLabel = mode === 'option' ? 'New Option for Same Client' : 'Reusable Template for New Client';
    if (!confirm(`Duplicate Quotation #${q.quotation_no} as ${modeLabel}?`)) return;

    try {
      const newQ = await firstValueFrom(this.quotationService.duplicateQuotation(q.id, mode));
      this.actionSuccess.set(`Quotation duplicated as ${modeLabel} (#${newQ.quotation_no})!`);
      this.router.navigate(['/quotations/edit', newQ.id]);
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to duplicate quotation');
    }
  }

  async convertToBooking(q: Quotation): Promise<void> {
    if (!confirm(`Convert Quotation #${q.quotation_no} to a Confirmed Booking?`)) return;

    try {
      const booking = await firstValueFrom(this.quotationService.convertToBooking(q.id));
      this.actionSuccess.set(`Successfully created Confirmed Booking #${booking.booking_no}!`);
      this.fetchQuotations();
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to convert quotation to booking');
    }
  }

  downloadPdf(q: Quotation): void {
    if (q.approval_status === 'pending_approval') {
      alert('PDF Download is locked until Manager approval is granted.');
      return;
    }

    this.actionError.set(null);
    this.quotationService.downloadPdfBlob(q.id).subscribe({
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
