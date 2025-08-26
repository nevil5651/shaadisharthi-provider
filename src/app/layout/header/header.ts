import { Component, Inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [],
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  public accountData: any | null = null;
  private accountDataSubscription: Subscription | undefined;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //  AuthService exposes a `currentUser$` observable. We subscribe to it here.
    // This ensures that whenever the user data is updated (e.g., on the account page),
    // the name in the header will update automatically.
    this.accountDataSubscription = this.authService.currentUser$.subscribe((
      data: any) => {
        this.accountData = data;
        this.cdr.markForCheck();
      }
    );
  }

  toggleSidebar(): void {
    this.document.body.classList.toggle('toggle-sidebar');
  }

  logout(): void {
    this.authService.logoutFromServer();
  }

  ngOnDestroy(): void {
    // It's a good practice to unsubscribe to prevent memory leaks.
    if (this.accountDataSubscription) {
      this.accountDataSubscription.unsubscribe();
    }
  }

}
