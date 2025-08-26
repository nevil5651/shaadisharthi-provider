import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verify-email-message',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email-message.html',
})
export class VerifyEmailMessageComponent implements OnInit {
  email: string = '';
  isResending = false;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router,private toastr: ToastrService) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || localStorage.getItem('pendingEmail') || 'your email';
    if (!this.email) {
      this.router.navigate(['/email-verification']);
    }
  }

  resendEmail() {
    if (this.email) {
      this.isResending = true;
      this.authService.requestVerificationEmail(this.email).subscribe({
        next: () => {
          this.isResending = false;
          this.toastr.success('Verification email sent successfully!', 'Success');
          // Optionally show a success toast
        },
        error: () => {
          this.isResending = false;
          this.toastr.error('Failed to send verification email. Please try again later.', 'Error');
        },
      });
    }
  }
}