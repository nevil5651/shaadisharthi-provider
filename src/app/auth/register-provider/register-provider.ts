import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-provider.html',
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.authService.verifyEmailToken(token).subscribe({
      next: (response: { email: any; }) => {
        this.registerForm.patchValue({ email: response.email });
      },
      error: () => {
        const errorMessage = 'Invalid or expired token. Please request a new verification email.';
        this.errorMessage = errorMessage;
        console.error('Email verification failed. Redirecting to email verification page.');
        this.toastr.error(errorMessage, 'Verification Failed');
        this.router.navigate(['/email-verification']);
      },
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get terms() {
    return this.registerForm.get('terms');
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      const { name, email, password } = this.registerForm.getRawValue();
      this.authService.register({ name, email, password }).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastr.success('Registration successful! Please log in to continue.', 'Success');
          localStorage.setItem('userEmail', email);
          this.router.navigate(['/login']);
        },
        error: (err: { error: { error: string; }; }) => {
          this.isSubmitting = false;
          const errorMessage = err.error?.error || 'Registration failed. Please try again.';
          this.errorMessage = errorMessage;
          this.toastr.error(errorMessage, 'Registration Failed');
        },
      });
    }
  }
}