import { Component, signal, ChangeDetectionStrategy, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DataTableComponent, DataTableColumnDirective } from '../shared/components/data-table/data-table.component';
import { UserService } from '../core/services/user.service';
import { RoleService, Role } from '../core/services/role.service';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, DataTableColumnDirective],
  templateUrl: './users.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  userForm: FormGroup;
  isSaving = signal(false);
  editingUserId = signal<number | null>(null);
  
  usersResource = resource({
    loader: () => firstValueFrom(this.userService.getUsers())
  });

  rolesResource = resource({
    loader: () => firstValueFrom(this.roleService.getRoles())
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private toastr: ToastrService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required],
      role_id: [null, Validators.required],
      status: ['active', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get('password')?.value;
    const confirmation = g.get('password_confirmation')?.value;
    if (password || confirmation) {
      return password === confirmation ? null : { mismatch: true };
    }
    return null;
  }

  showAdd() {
    this.view.set('add');
    this.editingUserId.set(null);
    this.userForm.reset({ status: 'active' });
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('password_confirmation')?.setValidators([Validators.required]);
    this.userForm.get('password_confirmation')?.updateValueAndValidity();
  }

  editUser(user: any) {
    this.view.set('edit');
    this.editingUserId.set(user.id);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '', // Leave blank for editing unless they want to change it
      password_confirmation: '',
      role_id: user.role?.id || null,
      status: user.status || 'active'
    });
    // Password is not required when editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('password_confirmation')?.clearValidators();
    this.userForm.get('password_confirmation')?.updateValueAndValidity();
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('User deleted successfully');
            this.usersResource.reload();
          } else {
            this.toastr.error(res.message || 'Failed to delete user');
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Error deleting user');
        }
      });
    }
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    
    this.isSaving.set(true);
    const data = { ...this.userForm.value };
    
    // Remove empty password when updating
    if (this.editingUserId() && !data.password) {
      delete data.password;
      delete data.password_confirmation;
    }
    
    const request = this.editingUserId() 
      ? this.userService.updateUser(this.editingUserId()!, data)
      : this.userService.createUser(data);

    request.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`User ${this.editingUserId() ? 'updated' : 'created'} successfully`);
          this.userForm.reset();
          this.usersResource.reload();
          // The offcanvas auto-closes due to data-bs-dismiss attribute
        } else {
          this.toastr.error(res.message || `Failed to ${this.editingUserId() ? 'update' : 'create'} user`);
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || `Error ${this.editingUserId() ? 'updating' : 'creating'} user`);
        this.isSaving.set(false);
      }
    });
  }
}
