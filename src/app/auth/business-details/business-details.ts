import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-business-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './business-details.html',
})
export class BusinessDetailsComponent implements OnInit {
  businessRegisterForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.businessRegisterForm = this.fb.group({
      businessName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      alternatePhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      aadhar: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      gstNo: ['', [Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
      terms: [false, Validators.requiredTrue],
    });
  }

  ngOnInit() {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      this.router.navigate(['/login']);
    }
  }

  get businessName() {
    return this.businessRegisterForm.get('businessName');
  }

  get phone() {
    return this.businessRegisterForm.get('phone');
  }

  get alternatePhone() {
    return this.businessRegisterForm.get('alternatePhone');
  }

  get address() {
    return this.businessRegisterForm.get('address');
  }

  get state() {
    return this.businessRegisterForm.get('state');
  }

  get city() {
    return this.businessRegisterForm.get('city');
  }

  get aadhar() {
    return this.businessRegisterForm.get('aadhar');
  }

  get gstNo() {
    return this.businessRegisterForm.get('gstNo');
  }

  get pan() {
    return this.businessRegisterForm.get('pan');
  }

  get terms() {
    return this.businessRegisterForm.get('terms');
  }

  onSubmit() {
    if (this.businessRegisterForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      const formData = this.businessRegisterForm.value;
      formData.email = localStorage.getItem('userEmail');
      this.authService.submitBusinessDetails(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.error || 'Failed to submit business details. Please try again.';
        },
      });
    }
  }
}