import { Component, signal, ChangeDetectionStrategy, resource, OnInit, ChangeDetectorRef, inject } from '@angular/core';
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
export class UsersComponent implements OnInit {
  userForm: FormGroup;
  isSaving = signal(false);
  editingUserId = signal<number | null>(null);

  users = signal<any[]>([]);
  usersLoading = signal<boolean>(true);

  roles = signal<Role[]>([]);
  rolesLoading = signal<boolean>(true);

  private cdr = inject(ChangeDetectorRef);

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

  ngOnInit() {
    this.fetchRoles();
    this.fetchUsers();
  }

  fetchUsers() {
    this.usersLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        let fetched: any[] = [];
        if (Array.isArray(res)) fetched = res;
        else if (res && res.data) fetched = res.data;
        this.users.set(fetched);
        this.usersLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.usersLoading.set(false);
        this.cdr.detectChanges();
      }
    });
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
        this.cdr.detectChanges(); // Force template update
      },
      error: () => {
        this.rolesLoading.set(false);
        this.cdr.detectChanges(); // Force template update
      }
    });
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
    this.editingUserId.set(null);
    this.userForm.reset({ status: 'active' });
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('password_confirmation')?.setValidators([Validators.required]);
    this.userForm.get('password_confirmation')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  editUser(user: any) {
    this.editingUserId.set(user.id);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      password_confirmation: '',
      role_id: user.role?.id || null,
      status: user.status || 'active'
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('password_confirmation')?.clearValidators();
    this.userForm.get('password_confirmation')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('User deleted successfully');
            this.fetchUsers();
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
          this.fetchUsers();
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
