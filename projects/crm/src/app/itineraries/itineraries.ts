import { Component, signal, resource, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PackageService } from '../core/services/package.service';
import { QuotationService } from '../core/services/quotation.service';
import { Package } from '../core/models/package.model';
import { Quotation } from '../core/models/quotation.model';

@Component({
  selector: 'app-itineraries',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './itineraries.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItinerariesComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  itineraryForm: FormGroup;
  itemToDelete: Package | null = null;
  itemToEdit: Package | null = null;

  quotationsResource = resource({
    loader: () => firstValueFrom(this.quotationService.getQuotations())
  });

  packagesResource = resource({
    loader: () => firstValueFrom(this.packageService.getPackages())
  });

  constructor(
    private packageService: PackageService,
    private quotationService: QuotationService,
    private fb: FormBuilder
  ) {
    this.itineraryForm = this.fb.group({
      quotation_id: [null],
      name: ['', Validators.required],
      duration_days: [1, [Validators.required, Validators.min(1)]],
      duration_nights: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['active', Validators.required]
    });
  }

  showList() { this.view.set('list'); }
  
  showAdd() { 
    this.view.set('add'); 
    this.itineraryForm.reset({ status: 'active', duration_days: 1, duration_nights: 0, price: 0 });
  }
  
  showEdit(pkg: Package) { 
    this.itemToEdit = pkg;
    this.view.set('edit'); 
    this.itineraryForm.patchValue(pkg);
  }

  confirmDelete(item: Package) {
    this.itemToDelete = item;
  }

  async deleteItem() {
    if (this.itemToDelete) {
      try {
        await firstValueFrom(this.packageService.deletePackage(this.itemToDelete.id));
        this.packagesResource.reload();
        this.itemToDelete = null;
      } catch (err) {
        console.error('Failed to delete package', err);
      }
    }
  }

  async saveItinerary() {
    if (this.itineraryForm.invalid) {
      this.itineraryForm.markAllAsTouched();
      return;
    }

    if (this.view() === 'add') {
      try {
        const res = await firstValueFrom(this.packageService.createPackage(this.itineraryForm.value));
        if (res.success) {
          this.packagesResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to create package', err);
      }
    } else if (this.view() === 'edit' && this.itemToEdit) {
      try {
        const res = await firstValueFrom(this.packageService.updatePackage(this.itemToEdit.id, this.itineraryForm.value));
        if (res.success) {
          this.packagesResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to update package', err);
      }
    }
  }
}
