import { Component, signal, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataTableComponent, DataTableColumnDirective } from '../shared/components/data-table/data-table.component';
import { LeadService } from '../core/services/lead.service';
import { UserService } from '../core/services/user.service';
import { User } from '../core/models/user.model';
import { Lead } from '../core/models/lead.model';
import { LeadActivity } from '../core/models/follow-up.model';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent, DataTableColumnDirective],
  templateUrl: './leads.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeadsComponent implements OnInit {
  view = signal<'list' | 'add' | 'edit'>('list');
  leadForm: FormGroup;
  leadToDelete = signal<Lead | null>(null);
  itemToEdit = signal<Lead | null>(null);

  // Activity Drawer State
  activeActivityLead = signal<Lead | null>(null);
  activities = signal<LeadActivity[]>([]);
  isLoadingActivities = signal<boolean>(false);
  commentText = signal<string>('');
  isInternalNote = signal<boolean>(false);

  // State Signals
  leads = signal<Lead[]>([]);
  isLoading = signal<boolean>(true);
  
  // Filter Signals
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('');
  selectedSource = signal<string>('');
  selectedStaff = signal<string>('');

  // Staff Users for Assignment
  staffUsers = signal<User[]>([]);

  // UI Messages
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  isImporting = signal<boolean>(false);
  isProcessingQueue = signal<boolean>(false);

  currentUser = computed(() => this.authService.currentUser());
  isManagerOrAdmin = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    const role = user.role?.name ? user.role.name.toLowerCase() : '';
    return role.includes('manager') || role.includes('admin') || role.includes('owner') || user.role_id === 1;
  });

  // Statuses list
  statusOptions = [
    { key: 'new', label: 'New Lead', badge: 'bg-primary text-white' },
    { key: 'contacted', label: 'Contacted', badge: 'bg-info text-white' },
    { key: 'followup', label: 'Follow-Up', badge: 'bg-warning text-dark' },
    { key: 'interested', label: 'Interested', badge: 'bg-indigo text-white' },
    { key: 'quotation_sent', label: 'Quotation Sent', badge: 'bg-purple text-white' },
    { key: 'negotiation', label: 'Negotiation', badge: 'bg-orange text-white' },
    { key: 'confirmed', label: 'Confirmed / Won', badge: 'bg-success text-white' },
    { key: 'lost', label: 'Lost', badge: 'bg-danger text-white' },
  ];

  constructor(
    private leadService: LeadService,
    private userService: UserService,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: ['', Validators.required],
      source: ['Website'],
      campaign_source: [''],
      destination: [''],
      travel_date: [''],
      pax_adults: [1],
      pax_children: [0],
      budget: [0],
      status: ['new'],
      assigned_to: [null],
      notes: ['']
    });
  }

  ngOnInit() {
    this.fetchLeads();
    this.loadStaffUsers();
  }

  fetchLeads() {
    this.isLoading.set(true);
    const params: any = {
      search: this.searchQuery(),
      status: this.selectedStatus(),
      source: this.selectedSource()
    };
    if (this.selectedStaff()) {
      params.assigned_to = this.selectedStaff();
    }

    this.leadService.getLeads(params).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.leads.set(res.data);
        } else {
          this.leads.set([]);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.leads.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange() {
    this.fetchLeads();
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.selectedSource.set('');
    this.selectedStaff.set('');
    this.fetchLeads();
  }

  loadStaffUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.staffUsers.set(res.data);
        }
      },
      error: () => {}
    });
  }

  openActivityDrawer(lead: Lead) {
    this.activeActivityLead.set(lead);
    this.commentText.set('');
    this.isInternalNote.set(false);
    this.fetchActivities(lead.id);
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
    const lead = this.activeActivityLead();
    const text = this.commentText().trim();
    if (!lead || !text) return;

    this.leadService.addLeadComment(lead.id, text, this.isInternalNote()).subscribe({
      next: () => {
        this.commentText.set('');
        this.isInternalNote.set(false);
        this.fetchActivities(lead.id);
        this.showSuccess('Comment added to lead activity trail');
      },
      error: (err) => {
        this.showError(err.error?.message || 'Failed to post comment');
      }
    });
  }

  showList() { this.view.set('list'); }
  
  showAdd() { 
    this.view.set('add'); 
    this.leadForm.reset({ source: 'Website', status: 'new', budget: 0, pax_adults: 1, pax_children: 0 });
  }
  
  showEdit(lead: Lead) { 
    this.itemToEdit.set(lead);
    this.view.set('edit'); 
    
    const formData = { ...lead };
    if (formData.assigned_to && typeof formData.assigned_to === 'object') {
      formData.assigned_to = (formData.assigned_to as any).id;
    }
    this.leadForm.patchValue(formData);
  }

  confirmDelete(lead: Lead) {
    this.leadToDelete.set(lead);
  }

  deleteLead() {
    const lead = this.leadToDelete();
    if (lead) {
      this.leadService.deleteLead(lead.id).subscribe({
        next: () => {
          this.fetchLeads();
          this.leadToDelete.set(null);
          this.showSuccess('Lead deleted successfully');
        },
        error: (err) => {
          this.showError(err.error?.message || 'Failed to delete lead');
        }
      });
    }
  }

  saveLead() {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }

    if (this.view() === 'add') {
      this.leadService.createLead(this.leadForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            this.fetchLeads();
            this.showList();
            this.showSuccess('Lead created successfully');
          }
        },
        error: (err) => {
          this.showError(err.error?.message || 'Failed to create lead');
        }
      });
    } else if (this.view() === 'edit' && this.itemToEdit()) {
      const item = this.itemToEdit()!;
      this.leadService.updateLead(item.id, this.leadForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            this.fetchLeads();
            this.showList();
            this.showSuccess('Lead updated successfully');
          }
        },
        error: (err) => {
          this.showError(err.error?.message || 'Failed to update lead');
        }
      });
    }
  }

  assignLeadQuick(leadId: number, staffId: any) {
    if (staffId === undefined || staffId === null) return;
    const targetId = staffId === '' ? 0 : parseInt(staffId, 10);
    this.leadService.assignLead(leadId, targetId).subscribe({
      next: (res) => {
        if (res.success) {
          this.fetchLeads();
          this.showSuccess('Lead assigned successfully');
        }
      },
      error: (err) => {
        this.showError(err.error?.message || 'Failed to assign lead');
      }
    });
  }

  getAssignedUserId(row: any): string {
    if (!row) return '';
    if (row.assigned_user?.id) return String(row.assigned_user.id);
    if (row.assigned_to?.id) return String(row.assigned_to.id);
    if (row.assigned_to) return String(row.assigned_to);
    return '';
  }

  getAssignedUserName(row: any): string {
    if (!row) return 'Unassigned';
    if (row.assigned_user?.name) return row.assigned_user.name;
    if (row.assigned_to?.name) return row.assigned_to.name;
    if (row.assigned_to) {
      const found = this.staffUsers().find(u => u.id === Number(row.assigned_to));
      if (found) return found.name;
    }
    return 'Unassigned';
  }

  isUserAssigned(row: any, userId: number | string): boolean {
    if (!row || !userId) return false;
    const assignedId = this.getAssignedUserId(row);
    return assignedId === String(userId);
  }

  processUnassignedQueue() {
    this.isProcessingQueue.set(true);
    this.leadService.processAutoAssignQueue().subscribe({
      next: (res) => {
        this.isProcessingQueue.set(false);
        if (res.success) {
          const count = res.data?.assigned_count ?? 0;
          this.fetchLeads();
          if (count > 0) {
            this.showSuccess(`Auto-assignment complete: ${count} lead(s) assigned successfully via Round-Robin.`);
          } else {
            this.showSuccess('Auto-assignment complete: No unassigned leads in queue or all staff at capacity caps.');
          }
        }
      },
      error: (err) => {
        this.isProcessingQueue.set(false);
        this.showError(err.error?.message || 'Failed to process auto-assign queue');
      }
    });
  }

  exportCsv() {
    this.leadService.exportCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showSuccess('Leads CSV exported successfully');
      },
      error: () => this.showError('Failed to export leads CSV')
    });
  }

  downloadSampleCsv() {
    this.leadService.downloadSampleCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_leads_import.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.showError('Failed to download sample CSV')
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isImporting.set(true);
      this.leadService.importCsv(file).subscribe({
        next: (res) => {
          this.isImporting.set(false);
          if (res.success) {
            this.fetchLeads();
            this.showSuccess(res.message || 'Leads imported successfully from CSV!');
          }
        },
        error: (err) => {
          this.isImporting.set(false);
          this.showError(err.error?.message || 'CSV Import failed. Check file format.');
        }
      });
    }
  }

  getStatusBadge(status: string): string {
    const match = this.statusOptions.find(s => s.key === status?.toLowerCase());
    return match ? match.badge : 'bg-secondary';
  }

  getSourceIcon(source?: string): string {
    const s = source?.toLowerCase() || '';
    if (s.includes('meta') || s.includes('facebook') || s.includes('instagram')) return 'bi-facebook text-primary';
    if (s.includes('google')) return 'bi-google text-danger';
    if (s.includes('whatsapp')) return 'bi-whatsapp text-success';
    if (s.includes('website')) return 'bi-globe text-info';
    if (s.includes('csv')) return 'bi-file-earmark-spreadsheet text-warning';
    return 'bi-person-circle text-secondary';
  }

  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  private showError(msg: string) {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 4000);
  }
}
