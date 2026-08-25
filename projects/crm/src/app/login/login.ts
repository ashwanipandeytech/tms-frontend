import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['travel@demohandler.in', [Validators.required, Validators.email]],
      password: ['Admin@123', Validators.required],
      role_type: ['Super Admin', Validators.required]
    });
  }

  ngOnInit() {
    // If already logged in, redirect to dashboard
    if (this.authService.getToken()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm.get('role_type')?.valueChanges.subscribe(role => {
      this.updateCredentialsForRole(role);
    });
  }

  updateCredentialsForRole(role: string) {
    switch (role) {
      case 'Super Admin':
        this.loginForm.patchValue({ email: 'travel@demohandler.in', password: 'Admin@123' });
        break;
      case 'Manager':
        this.loginForm.patchValue({ email: 'manager@demohandler.in', password: 'Manager@123' });
        break;
      case 'Sales Executive':
        this.loginForm.patchValue({ email: 'sales@demohandler.in', password: 'Sales@123' });
        break;
      case 'Operation Team':
        this.loginForm.patchValue({ email: 'ops@demohandler.in', password: 'Ops@123' });
        break;
      case 'Accounts':
        this.loginForm.patchValue({ email: 'accounts@demohandler.in', password: 'Accounts@123' });
        break;
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message || 'Login failed';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'An error occurred during login';
        this.isLoading = false;
      }
    });
  }
}
