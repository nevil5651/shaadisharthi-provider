import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './email-verification.html',
})
export class EmailVerificationComponent {
  emailForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.emailForm.get('email');
  }

  onSubmit() {
    if (this.emailForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      const email = this.emailForm.value.email;
      this.authService.requestVerificationEmail(email).subscribe({
        next: () => {
          this.isSubmitting = false;
          // Store email temporarily for pre-filling
          localStorage.setItem('pendingEmail', email);
          this.router.navigate(['/verify-email-message'], { queryParams: { email } });
        },
        error: (err: { error: { error: string; }; }) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.error || 'Failed to send verification email. Please try again later.';
        },
      });
    }
  }
}