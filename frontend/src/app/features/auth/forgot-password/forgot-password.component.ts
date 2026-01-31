import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = signal(false);
  isSubmitted = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: () => {
        this.isSubmitted.set(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        // Still show success to prevent email enumeration
        this.isSubmitted.set(true);
        this.isLoading.set(false);
      }
    });
  }
}
