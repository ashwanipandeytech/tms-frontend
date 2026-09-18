import { Component, signal, resource, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PackageService } from '../core/services/package.service';
import { QuotationService } from '../core/services/quotation.service';
import { MasterActivityService, MasterActivity } from '../core/services/master-activity.service';
import { AuthService } from '../core/services/auth.service';
import { Package } from '../core/models/package.model';

@Component({
  selector: 'app-itineraries',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './itineraries.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItinerariesComponent {
  activeTab = signal<'catalog' | 'itineraries'>('catalog');
  view = signal<'list' | 'add' | 'edit'>('list');

  // Master Activity Catalog signals & forms
  masterActivities = signal<MasterActivity[]>([]);
  catalogFilterDestination = signal<string>('');
  catalogFilterStatus = signal<string>('approved');
  catalogSearch = signal<string>('');
  isLoadingCatalog = signal<boolean>(false);
  showAddMasterModal = signal<boolean>(false);
  showSelectCatalogModal = signal<boolean>(false);
  targetDayIndex = signal<number | null>(null);

  // Preset Inclusions & Exclusions Tags
  presetInclusions = [
    'Daily Breakfast Included',
    'AC Private Sedan Transfers',
    'Sightseeing Entrance Tickets',
    'Welcome Drink on Arrival',
    'Airport Pickup & Drop',
    '4-Star Resort Accommodation'
  ];

  presetExclusions = [
    'Airfare / Trainfare',
    'Personal Expenses & Laundry',
    '5% GST / Applicable Tax',
    'Travel & Health Insurance',
    'Camera / Video Permits',
    'Peak Season Surcharges'
  ];

  masterForm: FormGroup;
  itineraryForm: FormGroup;
  itemToDelete: Package | null = null;
  itemToEdit: Package | null = null;

  private packageService = inject(PackageService);
  private quotationService = inject(QuotationService);
  private masterActivityService = inject(MasterActivityService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  isManagerOrAdmin = signal<boolean>(true);

  packagesResource = resource({
    loader: () => firstValueFrom(this.packageService.getPackages())
  });

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.isManagerOrAdmin.set(user.role_id === 1 || user.role_id === 2 || user.role?.id === 1 || user.role?.id === 2 || user.role?.name === 'Super Admin' || user.role?.name === 'Manager');
    }

    this.masterForm = this.fb.group({
      title: ['', Validators.required],
      destination: ['', Validators.required],
      category: ['Sightseeing'],
      description: [''],
      duration_minutes: [120, [Validators.min(1)]],
      unit_cost: [0, [Validators.min(0)]],
      inclusions: [''],
      exclusions: ['']
    });

    this.itineraryForm = this.fb.group({
      name: ['', Validators.required],
      destination_id: [null],
      category_id: [null],
      days: [1, [Validators.min(1)]],
      nights: [0, [Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      inclusions: ['Daily Breakfast Included, AC Private Sedan Transfers'],
      exclusions: ['Airfare / Trainfare, Personal Expenses & Laundry'],
      terms: ['1. 50% advance payment required at time of booking.\n2. Standard cancellation charges apply.'],
      status: ['active', Validators.required],
      itinerary_days: this.fb.array([])
    });

    this.loadCatalog();
  }

  get itineraryDaysArray(): FormArray {
    return this.itineraryForm.get('itinerary_days') as FormArray;
  }

  addItineraryDay(dayNum?: number): void {
    const nextDay = dayNum ?? (this.itineraryDaysArray.length + 1);
    const dayGroup = this.fb.group({
      day_number: [nextDay, Validators.required],
      title: [`Day ${nextDay}: Sightseeing & Leisure`, Validators.required],
      description: [''],
      meals: ['Breakfast']
    });
    this.itineraryDaysArray.push(dayGroup);
  }

  removeItineraryDay(index: number): void {
    this.itineraryDaysArray.removeAt(index);
    this.itineraryDaysArray.controls.forEach((ctrl, i) => {
      ctrl.patchValue({ day_number: i + 1 });
    });
  }

  togglePresetInclusion(tag: string): void {
    const current = this.itineraryForm.get('inclusions')?.value || '';
    if (current.includes(tag)) {
      const updated = current.split(',').map((s: string) => s.trim()).filter((s: string) => s !== tag).join(', ');
      this.itineraryForm.patchValue({ inclusions: updated });
    } else {
      const updated = current ? `${current}, ${tag}` : tag;
      this.itineraryForm.patchValue({ inclusions: updated });
    }
  }

  togglePresetExclusion(tag: string): void {
    const current = this.itineraryForm.get('exclusions')?.value || '';
    if (current.includes(tag)) {
      const updated = current.split(',').map((s: string) => s.trim()).filter((s: string) => s !== tag).join(', ');
      this.itineraryForm.patchValue({ exclusions: updated });
    } else {
      const updated = current ? `${current}, ${tag}` : tag;
      this.itineraryForm.patchValue({ exclusions: updated });
    }
  }

  openCatalogForDay(index: number): void {
    this.targetDayIndex.set(index);
    this.showSelectCatalogModal.set(true);
    this.loadCatalog();
  }

  insertActivityIntoDay(act: MasterActivity): void {
    const idx = this.targetDayIndex();
    if (idx !== null && idx >= 0 && idx < this.itineraryDaysArray.length) {
      const dayGroup = this.itineraryDaysArray.at(idx) as FormGroup;
      const currentDesc = dayGroup.get('description')?.value || '';
      const newDesc = currentDesc ? `${currentDesc}\n\n• ${act.title}: ${act.description}` : `• ${act.title}: ${act.description}`;
      dayGroup.patchValue({
        description: newDesc,
        title: dayGroup.get('title')?.value || act.title
      });
    }
    this.showSelectCatalogModal.set(false);
    this.targetDayIndex.set(null);
  }

  setTab(tab: 'catalog' | 'itineraries') {
    this.activeTab.set(tab);
    if (tab === 'catalog') {
      this.loadCatalog();
    }
  }

  async loadCatalog(): Promise<void> {
    this.isLoadingCatalog.set(true);
    try {
      const res = await firstValueFrom(this.masterActivityService.getActivities({
        search: this.catalogSearch(),
        destination: this.catalogFilterDestination(),
        approval_status: this.catalogFilterStatus(),
        per_page: 50
      }));
      this.masterActivities.set(res.data || []);
    } catch (err) {
      console.error('Failed to load master activities catalog', err);
    } finally {
      this.isLoadingCatalog.set(false);
    }
  }

  openAddMasterModal() {
    this.masterForm.reset({ category: 'Sightseeing', duration_minutes: 120, unit_cost: 0 });
    this.showAddMasterModal.set(true);
  }

  closeAddMasterModal() {
    this.showAddMasterModal.set(false);
  }

  async saveMasterActivity() {
    if (this.masterForm.invalid) {
      this.masterForm.markAllAsTouched();
      return;
    }

    const val = this.masterForm.value;
    const payload = {
      ...val,
      inclusions: val.inclusions ? val.inclusions.split(',').map((s: string) => s.trim()) : [],
      exclusions: val.exclusions ? val.exclusions.split(',').map((s: string) => s.trim()) : []
    };

    try {
      await firstValueFrom(this.masterActivityService.createActivity(payload));
      this.closeAddMasterModal();
      this.loadCatalog();
      alert('Master Activity published successfully!');
    } catch (err: any) {
      alert(err?.error?.message || 'Failed to save master activity');
    }
  }

  async approveActivity(id: number) {
    try {
      await firstValueFrom(this.masterActivityService.approveActivity(id));
      this.loadCatalog();
      alert('Activity approved and published to tenant catalog!');
    } catch (err: any) {
      alert(err?.error?.message || 'Failed to approve activity');
    }
  }

  async rejectActivity(id: number) {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      await firstValueFrom(this.masterActivityService.rejectActivity(id, reason));
      this.loadCatalog();
    } catch (err: any) {
      alert(err?.error?.message || 'Failed to reject activity');
    }
  }

  showList() { this.view.set('list'); }
  
  showAdd() { 
    this.view.set('add'); 
    this.itineraryForm.reset({ status: 'active', days: 1, nights: 0, price: 0, inclusions: 'Daily Breakfast Included, AC Private Sedan Transfers', exclusions: 'Airfare / Trainfare, Personal Expenses & Laundry' });
    this.itineraryDaysArray.clear();
    this.addItineraryDay(1);
  }
  
  async showEdit(pkg: Package) { 
    this.itemToEdit = pkg;
    this.view.set('edit'); 
    this.itineraryForm.patchValue(pkg);
    this.itineraryDaysArray.clear();

    try {
      const detail = await firstValueFrom(this.packageService.getPackage(pkg.id));
      if (detail.data?.itinerary?.days && detail.data.itinerary.days.length > 0) {
        detail.data.itinerary.days.forEach((d: any) => {
          this.itineraryDaysArray.push(this.fb.group({
            day_number: [d.day_number, Validators.required],
            title: [d.title, Validators.required],
            description: [d.description || ''],
            meals: [d.meals || 'Breakfast']
          }));
        });
      } else {
        this.addItineraryDay(1);
      }
    } catch (err) {
      this.addItineraryDay(1);
    }
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
