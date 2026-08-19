import { Component, signal, ChangeDetectionStrategy, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataTableComponent, DataTableColumnDirective } from '../shared/components/data-table/data-table.component';
import { UserService } from '../core/services/user.service';
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
  
  usersResource = resource({
    loader: () => firstValueFrom(this.userService.getUsers())
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role_id: [null, Validators.required]
    });
  }

  showAdd() {
    this.view.set('add');
    this.userForm.reset();
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    
    this.isSaving.set(true);
    const data = this.userForm.value;
    
    this.userService.createUser(data).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('User created successfully');
          this.userForm.reset();
          this.usersResource.reload();
          // The offcanvas auto-closes due to data-bs-dismiss attribute
        } else {
          this.toastr.error(res.message || 'Failed to create user');
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Error creating user');
        this.isSaving.set(false);
      }
    });
  }
}
