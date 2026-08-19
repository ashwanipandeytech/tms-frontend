import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataTableComponent, DataTableColumnDirective } from '../shared/components/data-table/data-table.component';

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
  
  mockUsers = [
    { id: 1, name: 'Admin User', email: 'admin@safarmusafir.com', role: { name: 'Super Admin' }, status: 'active' },
    { id: 2, name: 'Sales Exec A', email: 'sales@example.com', role: { name: 'Sales Executive' }, status: 'active' },
  ];

  constructor(private fb: FormBuilder) {
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
    // Normally would call UserService here
    this.view.set('list');
  }
}
