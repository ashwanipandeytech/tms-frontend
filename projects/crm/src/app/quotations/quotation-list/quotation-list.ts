import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { QuotationService } from '../../core/services/quotation.service';
import { Quotation, QuotationStatus } from '../../core/models/quotation.model';
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
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalCount = signal<number>(0);
  actionError = signal<string | null>(null);
  actionSuccess = signal<string | null>(null);

  // Computed metrics
  draftCount = computed(() => this.quotations().filter(q => q.status === 'draft').length);
  sentCount = computed(() => this.quotations().filter(q => q.status === 'sent').length);
  acceptedCount = computed(() => this.quotations().filter(q => q.status === 'accepted' || q.converted_booking_id).length);
  totalPipelineValue = computed(() => this.quotations().reduce((acc, q) => acc + (q.final_amount || 0), 0));

  constructor(
    private quotationService: QuotationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchQuotations();
  }

  async fetchQuotations(): Promise<void> {
    this.isLoading.set(true);
    this.actionError.set(null);

    try {
      const statusFilter = this.activeTab() === 'all' ? undefined : this.activeTab();
      const res = await firstValueFrom(
        this.quotationService.getQuotations({
          page: this.currentPage(),
          per_page: 15,
          search: this.searchQuery(),
          status: statusFilter
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

  async sendQuotation(q: Quotation): Promise<void> {
    try {
      await firstValueFrom(this.quotationService.sendQuotation(q.id));
      this.actionSuccess.set(`Quotation #${q.quotation_no} marked as Sent!`);
      this.fetchQuotations();
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to send quotation');
    }
  }

  async duplicateQuotation(q: Quotation): Promise<void> {
    try {
      const newQ = await firstValueFrom(this.quotationService.duplicateQuotation(q.id));
      this.actionSuccess.set(`Quotation duplicated into new draft #${newQ.quotation_no}`);
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
    window.open(this.quotationService.getPdfUrl(q.id), '_blank');
  }

  getStatusBadgeClass(status: string, convertedId?: number): string {
    if (convertedId) return 'bg-purple-100 text-purple-700 border-purple-200';
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }
}
