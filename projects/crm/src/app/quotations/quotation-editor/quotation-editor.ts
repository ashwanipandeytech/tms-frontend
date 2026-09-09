import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { QuotationService } from '../../core/services/quotation.service';
import { LeadService } from '../../core/services/lead.service';
import { Quotation, QuotationPayload } from '../../core/models/quotation.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quotation-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './quotation-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotationEditorComponent implements OnInit {
  quotationForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  quotationId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  leads = signal<any[]>([]);
  errorMessage = signal<string | null>(null);
  activeStep = signal<number>(1);

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService,
    private leadService: LeadService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadLeads();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.quotationId.set(+idParam);
      this.loadQuotation(+idParam);
    } else {
      this.addItem(); // default 1 line item
      this.addDay(1); // default 1 itinerary day
    }
  }

  private initForm(): void {
    this.quotationForm = this.fb.group({
      lead_id: [null],
      customer_name: ['', Validators.required],
      customer_email: ['', [Validators.email]],
      customer_phone: [''],
      destination: [''],
      travel_date: [''],
      return_date: [''],
      adults: [2, [Validators.min(1)]],
      children: [0, [Validators.min(0)]],
      infants: [0, [Validators.min(0)]],
      discount_type: ['fixed'],
      discount: [0, [Validators.min(0)]],
      tax_percentage: [5, [Validators.min(0), Validators.max(100)]],
      notes: [''],
      terms_and_conditions: ['1. 50% advance payment required at time of booking.\n2. Cancellation charges apply as per resort/airline policy.'],
      items: this.fb.array([]),
      itinerary: this.fb.group({
        title: ['Custom Tour Itinerary'],
        days: this.fb.array([])
      })
    });
  }

  get itemsFormArray(): FormArray {
    return this.quotationForm.get('items') as FormArray;
  }

  get daysFormArray(): FormArray {
    return (this.quotationForm.get('itinerary') as FormGroup).get('days') as FormArray;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      item_type: ['hotel', Validators.required],
      description: ['', Validators.required],
      nights: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.itemsFormArray.push(itemGroup);
  }

  removeItem(index: number): void {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    }
  }

  addDay(dayNum?: number): void {
    const nextDay = dayNum ?? (this.daysFormArray.length + 1);
    const dayGroup = this.fb.group({
      day_number: [nextDay, Validators.required],
      title: [`Day ${nextDay}: Sightseeing & Leisure`, Validators.required],
      description: [''],
      meals: ['Breakfast'],
      notes: ['']
    });
    this.daysFormArray.push(dayGroup);
  }

  removeDay(index: number): void {
    this.daysFormArray.removeAt(index);
    // Re-index day numbers
    this.daysFormArray.controls.forEach((ctrl, i) => {
      ctrl.patchValue({ day_number: i + 1 });
    });
  }

  // Financial Calculations
  calculateItemTotal(index: number): number {
    const item = this.itemsFormArray.at(index).value;
    const unit = Number(item.unit_price) || 0;
    const qty = Number(item.quantity) || 1;
    const nights = Number(item.nights) || 1;
    return unit * qty * nights;
  }

  calculateSubtotal(): number {
    let sub = 0;
    for (let i = 0; i < this.itemsFormArray.length; i++) {
      sub += this.calculateItemTotal(i);
    }
    return sub;
  }

  calculateDiscountAmount(): number {
    const sub = this.calculateSubtotal();
    const type = this.quotationForm.get('discount_type')?.value || 'fixed';
    const val = Number(this.quotationForm.get('discount')?.value) || 0;
    return type === 'percentage' ? (sub * val) / 100 : val;
  }

  calculateGstAmount(): number {
    const sub = this.calculateSubtotal();
    const disc = this.calculateDiscountAmount();
    const taxable = Math.max(0, sub - disc);
    const taxPct = Number(this.quotationForm.get('tax_percentage')?.value) || 0;
    return (taxable * taxPct) / 100;
  }

  calculateFinalAmount(): number {
    const sub = this.calculateSubtotal();
    const disc = this.calculateDiscountAmount();
    const gst = this.calculateGstAmount();
    return Math.max(0, sub - disc + gst);
  }

  private async loadLeads(): Promise<void> {
    try {
      const res = await firstValueFrom(this.leadService.getLeads({ per_page: 100 }));
      this.leads.set(res.data || []);
    } catch (err) {
      console.error('Failed to load leads list', err);
    }
  }

  onLeadSelect(leadId: any): void {
    const lead = this.leads().find(l => l.id === +leadId);
    if (lead) {
      this.quotationForm.patchValue({
        customer_name: lead.name,
        customer_email: lead.email,
        customer_phone: lead.phone,
        destination: lead.destination
      });
    }
  }

  private async loadQuotation(id: number): Promise<void> {
    this.isLoading.set(true);
    try {
      const q = await firstValueFrom(this.quotationService.getQuotation(id));
      this.quotationForm.patchValue({
        lead_id: q.lead_id,
        customer_name: q.customer_name,
        customer_email: q.customer_email,
        customer_phone: q.customer_phone,
        destination: q.destination,
        travel_date: q.travel_date,
        return_date: q.return_date,
        adults: q.adults || 2,
        children: q.children || 0,
        infants: q.infants || 0,
        discount_type: q.discount_type || 'fixed',
        discount: q.discount || 0,
        tax_percentage: q.tax_percentage || 5,
        notes: q.notes,
        terms_and_conditions: q.terms_and_conditions
      });

      // Load items
      this.itemsFormArray.clear();
      if (q.items && q.items.length > 0) {
        q.items.forEach(item => {
          this.itemsFormArray.push(this.fb.group({
            item_type: [item.item_type || 'hotel'],
            description: [item.description, Validators.required],
            nights: [item.nights || 1, [Validators.required, Validators.min(1)]],
            unit_price: [item.unit_price || item.amount || 0, [Validators.required, Validators.min(0)]],
            quantity: [item.quantity || item.qty || 1, [Validators.required, Validators.min(1)]]
          }));
        });
      } else {
        this.addItem();
      }

      // Load itinerary
      this.daysFormArray.clear();
      if (q.itinerary?.days && q.itinerary.days.length > 0) {
        this.quotationForm.get('itinerary')?.patchValue({ title: q.itinerary.title || 'Tour Itinerary' });
        q.itinerary.days.forEach(d => {
          this.daysFormArray.push(this.fb.group({
            day_number: [d.day_number, Validators.required],
            title: [d.title, Validators.required],
            description: [d.description || ''],
            meals: [d.meals || 'Breakfast'],
            notes: [d.notes || '']
          }));
        });
      } else {
        this.addDay(1);
      }
    } catch (err: any) {
      this.errorMessage.set(err?.error?.message || 'Failed to load quotation details');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.quotationForm.invalid) {
      this.quotationForm.markAllAsTouched();
      this.errorMessage.set('Please fill in all required fields marked in red.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const formVal = this.quotationForm.value;
    const payload: QuotationPayload = {
      ...formVal,
      sub_total: this.calculateSubtotal(),
      gst_amount: this.calculateGstAmount(),
      final_amount: this.calculateFinalAmount()
    };

    try {
      if (this.isEditMode() && this.quotationId()) {
        await firstValueFrom(this.quotationService.updateQuotation(this.quotationId()!, payload));
      } else {
        await firstValueFrom(this.quotationService.createQuotation(payload));
      }
      this.router.navigate(['/quotations']);
    } catch (err: any) {
      this.errorMessage.set(err?.error?.message || 'Failed to save quotation.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
