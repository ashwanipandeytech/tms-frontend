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
      password: ['Admin@123', Validators.required]
    });
  }

  ngOnInit() {
    // If already logged in, redirect to dashboard
    if (this.authService.getToken()) {
      this.router.navigate(['/dashboard']);
    } else {
      // Ensure completely fresh state if arriving unauthenticated (e.g. expired token redirect)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
      }
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
          if (res.data?.user?.role?.name === 'Super Admin') {
            this.router.navigate(['/select-tenant']);
          } else {
            this.router.navigate(['/dashboard']);
          }
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
