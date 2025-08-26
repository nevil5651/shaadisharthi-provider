import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-waiting-approval',
  standalone: true,
  imports: [],
  templateUrl: './waiting-approval.html',
  styleUrl: './waiting-approval.scss'
})
export class WaitingApproval {
  public env = environment;
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
