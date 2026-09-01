import { Component, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataTableComponent, DataTableColumnDirective } from '../shared/components/data-table/data-table.component';
import { RoleService, Role, ModulePermission } from '../core/services/role.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, DataTableColumnDirective],
  templateUrl: './roles.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit {
  roleForm: FormGroup;
  isSaving = signal(false);
  editingRoleId = signal<number | null>(null);
  selectedPermissions = signal<Set<number>>(new Set());
  
  roles = signal<Role[]>([]);
  rolesLoading = signal<boolean>(true);
  
  permissions = signal<ModulePermission[]>([]);
  permissionsLoading = signal<boolean>(true);

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private toastr: ToastrService
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchRoles();
    this.fetchPermissions();
  }

  fetchRoles() {
    this.rolesLoading.set(true);
    this.roleService.getRoles().subscribe({
      next: (res: any) => {
        let fetched: Role[] = [];
        if (Array.isArray(res)) fetched = res;
        else if (res && res.data) fetched = res.data;
        this.roles.set(fetched);
        this.rolesLoading.set(false);
      },
      error: () => this.rolesLoading.set(false)
    });
  }

  fetchPermissions() {
    this.permissionsLoading.set(true);
    this.roleService.getPermissions().subscribe({
      next: (res: any) => {
        let fetched: ModulePermission[] = [];
        if (Array.isArray(res)) fetched = res;
        else if (res && res.data) fetched = res.data;
        this.permissions.set(fetched);
        this.permissionsLoading.set(false);
      },
      error: () => this.permissionsLoading.set(false)
    });
  }

  showAdd() {
    this.editingRoleId.set(null);
    this.roleForm.reset();
    this.selectedPermissions.set(new Set());
  }

  editRole(role: Role) {
    this.editingRoleId.set(role.id!);
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });
    
    const newPerms = new Set<number>();
    if (role.permissions && Array.isArray(role.permissions)) {
      role.permissions.forEach(p => {
        // Handle if API returns object {id: 1} or just number 1
        const permId = typeof p === 'object' ? p.id : p;
        if (permId) newPerms.add(Number(permId));
      });
    }
    this.selectedPermissions.set(newPerms);
  }

  togglePermission(permId: number | string) {
    const pId = Number(permId);
    const current = new Set(this.selectedPermissions());
    if (current.has(pId)) {
      current.delete(pId);
    } else {
      current.add(pId);
    }
    this.selectedPermissions.set(current);
  }

  saveRole() {
    if (this.roleForm.invalid || this.selectedPermissions().size === 0) {
      this.roleForm.markAllAsTouched();
      if (this.selectedPermissions().size === 0) {
        this.toastr.warning('Please select at least one permission.');
      }
      return;
    }
    
    this.isSaving.set(true);
    const payload: Role = {
      name: this.roleForm.value.name,
      description: this.roleForm.value.description,
      permissions: Array.from(this.selectedPermissions())
    };
    
    const request = this.editingRoleId() 
      ? this.roleService.updateRole(this.editingRoleId()!, payload)
      : this.roleService.createRole(payload);

    request.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Role ${this.editingRoleId() ? 'updated' : 'created'} successfully`);
          this.roleForm.reset();
          this.selectedPermissions.set(new Set());
          this.fetchRoles(); // Refresh the list
        } else {
          this.toastr.error(res.message || `Failed to ${this.editingRoleId() ? 'update' : 'create'} role`);
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || `Error ${this.editingRoleId() ? 'updating' : 'creating'} role`);
        this.isSaving.set(false);
      }
    });
  }

  deleteRole(role: Role) {
    // This method is kept for backwards compatibility but we now use confirmDelete/executeDelete for the modal
    this.confirmDelete(role);
  }

  roleToDelete = signal<Role | null>(null);

  confirmDelete(role: Role) {
    this.roleToDelete.set(role);
  }

  executeDelete() {
    const role = this.roleToDelete();
    if (!role) return;

    this.roleService.deleteRole(role.id!).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Role deleted successfully');
          this.fetchRoles();
        } else {
          this.toastr.error(res.message || 'Failed to delete role');
        }
        this.roleToDelete.set(null);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Error deleting role');
        this.roleToDelete.set(null);
      }
    });
  }
}
