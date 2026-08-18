import { Component, signal, resource, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FollowUpService } from '../core/services/follow-up.service';
import { LeadService } from '../core/services/lead.service';
import { FollowUp } from '../core/models/follow-up.model';
import { Lead } from '../core/models/lead.model';

@Component({
  selector: 'app-follow-ups',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './follow-ups.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowUpsComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  followUpForm: FormGroup;
  itemToDelete: FollowUp | null = null;
  itemToEdit: FollowUp | null = null;

  leadsResource = resource({
    loader: () => firstValueFrom(this.leadService.getLeads())
  });

  followUpsResource = resource({
    loader: () => firstValueFrom(this.followUpService.getFollowUps())
  });

  constructor(
    private followUpService: FollowUpService,
    private leadService: LeadService,
    private fb: FormBuilder
  ) {
    this.followUpForm = this.fb.group({
      lead_id: [null, Validators.required],
      follow_up_date: ['', Validators.required],
      follow_up_time: ['', Validators.required],
      type: ['Call', Validators.required],
      remarks: [''],
      status: ['Pending', Validators.required]
    });
  }

  showList() { this.view.set('list'); }
  
  showAdd() { 
    this.view.set('add'); 
    this.followUpForm.reset({ type: 'Call', status: 'Pending' });
  }
  
  showEdit(followUp: FollowUp) { 
    this.itemToEdit = followUp;
    this.view.set('edit'); 
    
    const formData = { ...followUp };
    if (formData.lead && typeof formData.lead === 'object') {
      formData.lead_id = (formData.lead as any).id;
    }
    
    this.followUpForm.patchValue(formData);
  }

  confirmDelete(item: FollowUp) {
    this.itemToDelete = item;
  }

  async deleteItem() {
    if (this.itemToDelete) {
      try {
        await firstValueFrom(this.followUpService.deleteFollowUp(this.itemToDelete.id));
        this.followUpsResource.reload();
        this.itemToDelete = null;
      } catch (err) {
        console.error('Failed to delete follow-up', err);
      }
    }
  }

  async saveFollowUp() {
    if (this.followUpForm.invalid) {
      this.followUpForm.markAllAsTouched();
      return;
    }

    if (this.view() === 'add') {
      try {
        const res = await firstValueFrom(this.followUpService.createFollowUp(this.followUpForm.value));
        if (res.success) {
          this.followUpsResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to create follow-up', err);
      }
    } else if (this.view() === 'edit' && this.itemToEdit) {
      try {
        const res = await firstValueFrom(this.followUpService.updateFollowUp(this.itemToEdit.id, this.followUpForm.value));
        if (res.success) {
          this.followUpsResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to update follow-up', err);
      }
    }
  }
}
