import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QuotationService } from '../../core/services/quotation.service';
import { Quotation } from '../../core/models/quotation.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quotation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quotation-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotationDetailComponent implements OnInit {
  quotation = signal<Quotation | null>(null);
  isLoading = signal<boolean>(true);
  actionError = signal<string | null>(null);
  actionSuccess = signal<string | null>(null);
  isActionLoading = signal<boolean>(false);

  constructor(
    private quotationService: QuotationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
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
    } catch (err: any) {
      this.actionError.set(err?.error?.message || 'Failed to load quotation');
    } finally {
      this.isLoading.set(false);
    }
  }

  async sendQuotation(): Promise<void> {
    if (!this.quotation()) return;
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

  async duplicateQuotation(): Promise<void> {
    if (!this.quotation()) return;
    this.isActionLoading.set(true);
    try {
      const newQ = await firstValueFrom(this.quotationService.duplicateQuotation(this.quotation()!.id));
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
    if (this.quotation()) {
      window.open(this.quotationService.getPdfUrl(this.quotation()!.id), '_blank');
    }
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
