import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { ChangePasswordPayload, User, UserProfile } from '../../core/models/auth.model';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account',

  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})

export class Account implements OnInit, OnDestroy {
  accountData: User | null = null;
  editForm: FormGroup;
  passwordForm: FormGroup;
  loading: boolean;
  private userSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService) {

    this.editForm = this.fb.group( {
      name: ['', [Validators.required, Validators.maxLength(100)]],
      state: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      alternate_phone: ['', Validators.pattern('^[0-9]{10}$')],

      business_name: ['', [Validators.required, Validators.maxLength(100)]],
      address: ['', [Validators.required, Validators.maxLength(255)]],
    });
    this.passwordForm = this.fb.group( {
      currentPassword: ['', Validators.required], newPassword: ['', [
        Validators.required, Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/) ]
      ],
      renewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
    this.loading = false;
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.accountData = user;
        this.populateEditForm();
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get( 'newPassword' )?.value;
    const renewPassword = control.get( 'renewPassword' )?.value;
    return newPassword === renewPassword ? null : { mismatch: true };
  }

  populateEditForm(): void {
    if ( this.accountData ) {
      this.editForm.patchValue(this.accountData);
    }
  }

  onChangePasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.displayPasswordFormErrors();
      return;
    }

    this.loading = true;
    const passwordData: ChangePasswordPayload = this.passwordForm.value;
    this.authService.changePassword(passwordData).subscribe({
      next: (response) => {
        console.log('Password changed successfully', response);
        this.toastr.success('Password changed successfully, logging you out!');
        this.authService.logout();
      },
      error: (error) => {
        console.error('Password change failed', error);
        const errorMessage = error?.error?.message || 'Password change failed. Please check your current password.';
        this.toastr.error(errorMessage);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private displayPasswordFormErrors(): void {
    const newPasswordControl = this.passwordForm.get('newPassword');

    // Prioritize form-level errors first, then field-specific ones.
    if (this.passwordForm.hasError('mismatch')) {
      this.toastr.error('New passwords do not match.');
    } else if (this.passwordForm.get('currentPassword')?.hasError('required')) {
      this.toastr.error('Current password is required.');
    } else if (newPasswordControl?.hasError('required')) {
      this.toastr.error('New password is required.');
    } else if (newPasswordControl?.hasError('minlength')) {
      this.toastr.error('Password must be at least 8 characters long.');
    } else if (newPasswordControl?.hasError('pattern')) {
      this.toastr.error('Password must contain an uppercase letter, a lowercase letter, a number, and a special character.');
    } else if (this.passwordForm.get('renewPassword')?.hasError('required')) {
      this.toastr.error('Please re-enter the new password.');
    }
  }

  onEditSubmit(): void {
    if (this.editForm.valid) {
      this.loading=true;
      const updatedData: Partial<UserProfile> = this.editForm.value;
      // The updated `updateProfile` now returns the refreshed user and updates the stream.
      // The component's `accountData` will be updated automatically by the `currentUser$` subscription.
      this.authService.updateProfile(updatedData).subscribe({
        next: (response) => {
          console.log('Profile updated successfully', response);
          this.toastr.success('Profile updated successfully!');
          this.loading = false;
        },
        error: (error) => {
          console.error('Profile update failed', error);
          this.toastr.error('Profile update failed. Please try again.');
          this.loading=false;
        }
      });
    } else {
      console.error('Form is invalid');
    }
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
  
}




  
  

  
