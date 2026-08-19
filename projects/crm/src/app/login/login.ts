import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
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
      email: ['admin@safarmusafir.com', [Validators.required, Validators.email]],
      password: ['Admin@123', Validators.required],
      role_type: ['Super Admin', Validators.required]
    });
  }

  ngOnInit() {
    // If already logged in, redirect to dashboard
    if (this.authService.getToken()) {
      this.router.navigate(['/dashboard']);
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
