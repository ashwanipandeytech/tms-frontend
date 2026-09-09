import { Component, signal, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FollowUpService } from '../core/services/follow-up.service';
import { LeadService } from '../core/services/lead.service';
import { UserService } from '../core/services/user.service';
import { AuthService } from '../core/services/auth.service';
import { FollowUp, LeadActivity } from '../core/models/follow-up.model';
import { Lead } from '../core/models/lead.model';
import { User } from '../core/models/user.model';
import { PaginatedResponse } from '../core/models/api-response.model';

@Component({
  selector: 'app-follow-ups',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './follow-ups.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowUpsComponent implements OnInit {
  view = signal<'list' | 'add' | 'edit'>('list');
  activeTab = signal<'due_today' | 'overdue' | 'upcoming' | 'completed' | 'all'>('due_today');
  searchQuery = signal<string>('');
  selectedStaffId = signal<string>('');
  selectedPriority = signal<string>('');

  followUpForm: FormGroup;
  completeForm: FormGroup;
  rescheduleForm: FormGroup;
  reassignForm: FormGroup;

  itemToDelete: FollowUp | null = null;
  itemToEdit: FollowUp | null = null;
  activeFollowUpAction: FollowUp | null = null;

  // Discussion & Activity Trail Signals
  activities = signal<LeadActivity[]>([]);
  isLoadingActivities = signal<boolean>(false);
  commentText = signal<string>('');
  isInternalNote = signal<boolean>(false);

  followUpsData = signal<PaginatedResponse<FollowUp> | null>(null);
  leadsList = signal<Lead[]>([]);
  usersList = signal<User[]>([]);
  isLoading = signal<boolean>(false);

  currentUser = computed(() => this.authService.currentUser());
  isManagerOrAdmin = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    const role = user.role?.name ? user.role.name.toLowerCase() : '';
    return role.includes('manager') || role.includes('admin') || role.includes('owner') || (user as any).role_id === 1;
  });

  constructor(
    private followUpService: FollowUpService,
    private leadService: LeadService,
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.followUpForm = this.fb.group({
      lead_id: [null, Validators.required],
      assigned_to: [null],
      follow_up_date: ['', Validators.required],
      follow_up_time: ['10:00'],
      type: ['call', Validators.required],
      priority: ['medium', Validators.required],
      remarks: [''],
      remind_whatsapp: [false],
      remind_email: [false],
      status: ['pending', Validators.required]
    });

    this.completeForm = this.fb.group({
      outcome: ['', Validators.required],
      remarks: ['']
    });

    this.rescheduleForm = this.fb.group({
      follow_up_date: ['', Validators.required],
      follow_up_time: ['10:00'],
      type: ['call'],
      priority: ['medium'],
      reason: ['', Validators.required]
    });

    this.reassignForm = this.fb.group({
      new_user_id: [null, Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchFollowUps();
    this.loadDependencies();
  }

  fetchFollowUps() {
    this.isLoading.set(true);
    const params = {
      tab: this.activeTab(),
      search: this.searchQuery(),
      staff_id: this.selectedStaffId(),
      priority: this.selectedPriority()
    };

    this.followUpService.getFollowUps(params).subscribe({
      next: (res) => {
        this.followUpsData.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load follow-ups', err);
        this.isLoading.set(false);
      }
    });
  }

  async loadDependencies() {
    try {
      const leadsRes = await firstValueFrom(this.leadService.getLeads({ per_page: 100 }));
      if (leadsRes && leadsRes.data) this.leadsList.set(leadsRes.data);
    } catch (err) {
      console.error('Failed to load leads list', err);
    }

    try {
      const usersRes = await firstValueFrom(this.userService.getUsers({ per_page: 100 }));
      if (usersRes && usersRes.data) this.usersList.set(usersRes.data);
    } catch (err) {
      console.error('Failed to load users list', err);
    }
  }

  setTab(tab: 'due_today' | 'overdue' | 'upcoming' | 'completed' | 'all') {
    this.activeTab.set(tab);
    this.fetchFollowUps();
  }

  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.fetchFollowUps();
  }

  onStaffFilter(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedStaffId.set(val);
    this.fetchFollowUps();
  }

  onPriorityFilter(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedPriority.set(val);
    this.fetchFollowUps();
  }

  showList() { this.view.set('list'); }
  
  showAdd() { 
    this.view.set('add'); 
    this.activities.set([]);
    const today = new Date().toISOString().split('T')[0];
    this.followUpForm.reset({
      follow_up_date: today,
      follow_up_time: '10:00',
      type: 'call',
      priority: 'medium',
      status: 'pending',
      remind_whatsapp: false,
      remind_email: false
    });
  }
  
  showEdit(followUp: FollowUp) { 
    this.itemToEdit = followUp;
    this.view.set('edit'); 
    this.commentText.set('');
    this.isInternalNote.set(false);
    
    const formData: any = { ...followUp };
    if (formData.lead && typeof formData.lead === 'object') {
      formData.lead_id = formData.lead.id;
    }
    
    this.followUpForm.patchValue(formData);

    if (followUp.lead_id) {
      this.fetchActivities(followUp.lead_id);
    }
  }

  fetchActivities(leadId: number | string) {
    this.isLoadingActivities.set(true);
    this.leadService.getLeadActivities(leadId).subscribe({
      next: (res) => {
        this.activities.set(res.data || []);
        this.isLoadingActivities.set(false);
      },
      error: (err) => {
        console.error('Failed to load lead activities', err);
        this.activities.set([]);
        this.isLoadingActivities.set(false);
      }
    });
  }

  submitComment() {
    const leadId = this.itemToEdit?.lead_id || this.followUpForm.get('lead_id')?.value;
    const text = this.commentText().trim();
    if (!leadId || !text) return;

    this.leadService.addLeadComment(leadId, text, this.isInternalNote()).subscribe({
      next: () => {
        this.commentText.set('');
        this.isInternalNote.set(false);
        this.fetchActivities(leadId);
      },
      error: (err) => {
        console.error('Failed to post comment', err);
      }
    });
  }

  openCompleteModal(followUp: FollowUp) {
    this.activeFollowUpAction = followUp;
    this.completeForm.reset();
  }

  async submitComplete() {
    if (this.completeForm.invalid || !this.activeFollowUpAction) return;
    try {
      await firstValueFrom(this.followUpService.completeFollowUp(
        this.activeFollowUpAction.id,
        this.completeForm.value
      ));
      this.fetchFollowUps();
      this.activeFollowUpAction = null;
    } catch (err) {
      console.error('Failed to complete follow-up', err);
    }
  }

  openRescheduleModal(followUp: FollowUp) {
    this.activeFollowUpAction = followUp;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    this.rescheduleForm.reset({
      follow_up_date: tomorrowStr,
      follow_up_time: followUp.follow_up_time || '10:00',
      type: followUp.type || 'call',
      priority: followUp.priority || 'medium',
      reason: ''
    });
  }

  async submitReschedule() {
    if (this.rescheduleForm.invalid || !this.activeFollowUpAction) return;
    try {
      await firstValueFrom(this.followUpService.rescheduleFollowUp(
        this.activeFollowUpAction.id,
        this.rescheduleForm.value
      ));
      this.fetchFollowUps();
      this.activeFollowUpAction = null;
    } catch (err) {
      console.error('Failed to reschedule follow-up', err);
    }
  }

  openReassignModal(followUp: FollowUp) {
    this.activeFollowUpAction = followUp;
    this.reassignForm.reset({
      new_user_id: null,
      reason: ''
    });
  }

  async submitReassign() {
    if (this.reassignForm.invalid || !this.activeFollowUpAction || !this.activeFollowUpAction.lead_id) return;
    try {
      const val = this.reassignForm.value;
      await firstValueFrom(this.leadService.reassignHandoff(
        this.activeFollowUpAction.lead_id,
        val.new_user_id,
        val.reason
      ));
      this.fetchFollowUps();
      this.activeFollowUpAction = null;
    } catch (err) {
      console.error('Failed to reassign lead handoff', err);
    }
  }

  confirmDelete(item: FollowUp) {
    this.itemToDelete = item;
  }

  async deleteItem() {
    if (this.itemToDelete) {
      try {
        await firstValueFrom(this.followUpService.deleteFollowUp(this.itemToDelete.id));
        this.fetchFollowUps();
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
          this.fetchFollowUps();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to create follow-up', err);
      }
    } else if (this.view() === 'edit' && this.itemToEdit) {
      try {
        const res = await firstValueFrom(this.followUpService.updateFollowUp(this.itemToEdit.id, this.followUpForm.value));
        if (res.success) {
          this.fetchFollowUps();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to update follow-up', err);
      }
    }
  }

  getLeadDisplayName(item: FollowUp): string {
    if (item.lead) {
      return item.lead.customer_name || item.lead.name || `Lead #${item.lead.id}`;
    }
    return `Lead #${item.lead_id}`;
  }
}
