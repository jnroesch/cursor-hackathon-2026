import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);
  
  // Pre-filled from URL params (for demo convenience)
  emailFromUrl = '';
  tokenFromUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Get email and token from URL params if present (for demo convenience)
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.emailFromUrl = params['email'];
        this.resetForm.patchValue({ email: params['email'] });
      }
      if (params['token']) {
        this.tokenFromUrl = params['token'];
        this.resetForm.patchValue({ token: params['token'] });
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    const { newPassword, confirmPassword } = this.resetForm.value;
    if (newPassword !== confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.resetPassword({
      email: this.resetForm.value.email,
      token: this.resetForm.value.token,
      newPassword: this.resetForm.value.newPassword
    }).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Failed to reset password. The token may be invalid or expired.');
        this.isLoading.set(false);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
