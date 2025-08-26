import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment.development';
import { LoginApiResponse, User, UserProfile, UserStatus } from '../models/auth.model';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './api';

const { tokenStorageKey, userStorageKey } = environment.auth;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // New property to signal when initialization is complete
  private isInitialized = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.isInitialized.asObservable();


  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // We must defer the initialization to the next event loop cycle (macrotask).
    // This allows the AuthService constructor to complete and the instance to be
    // fully created *before* any HTTP requests are made. This breaks the
    // circular dependency chain of AuthService -> HttpClient -> AuthInterceptor -> AuthService
    // that occurs during instantiation.
    setTimeout(() => this.initializeAuthState(), 0);
  }
  // Initialize auth state from storage
  private initializeAuthState(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem(userStorageKey);

    if (!token || !storedUser) {
      // No session found, initialization is complete.
      this.isInitialized.next(true);
      return;
    }

    try {
      this._setCurrentUser(JSON.parse(storedUser) as User);
      // Refresh user profile to get latest data and validate token.
      // The `finalize` operator ensures `isInitialized` is set to true ONLY after
      // the API call completes, successfully or with an error.
      this.fetchUserProfile().pipe(
        finalize(() => this.isInitialized.next(true))
      ).subscribe({
        // On success, user is updated, and finalize will run.
        error: (err) => {
          // The AuthInterceptor now handles 401/403 errors globally by calling logout().
          // We just need to log that the profile refresh failed.
          console.warn('AuthService: Could not refresh user profile on reload.', err);
        }
      });
    } catch (e) {
      console.error('AuthService: Error parsing stored user data. Logging out.', e);
      this.logout(false); // Corrupt data, log out without redirect
      this.isInitialized.next(true);
    }
  }

  // Login method
  login(email: string, password: string): Observable<User> {
    return this.apiService.post<LoginApiResponse>('ServiceProvider/login', { email, password })
      .pipe(
        map(response => {
          // Explicitly map provider_id to providerId and remove the original
          // to ensure a clean and consistent User object.
          const { provider_id, ...rest } = response;
          return { ...rest, providerId: provider_id };
        }),
        switchMap((user: User) => {
          if (!user?.token) {
            return throwError(() => new Error('Invalid login response'));
          }
          this.setToken(user.token);
          this._setCurrentUser(user); // Temporarily set user with login data

          if (user.status === 'APPROVED') {
            // For approved users, fetch the full profile BEFORE navigating.
            // This prevents a race condition and ensures account data is ready.
            return this.fetchUserProfile().pipe(
              tap(() => this.navigateUserByStatus(user.status))
            );
          } else {
            // For other statuses, navigate immediately.
            this.navigateUserByStatus(user.status);
            return of(this.currentUserSubject.value!);
          }
        })
      );
  }

  // Fetch user profile
  fetchUserProfile(): Observable<User> {
    // The backend might return `provider_id`. We need to handle this case explicitly.
    return this.apiService.get<UserProfile & { provider_id?: string }>('ServiceProvider/account', { params: { token: this.getToken() || '' } }).pipe(
      map((userProfile) => {
        const currentUser = this.currentUserSubject.value;
        if (!currentUser) {
          // This path is unlikely if a token exists, but it's a good safeguard.
          // We can't proceed, so we'll let the caller handle the error.
          throw new Error('Cannot fetch profile without a current user session.');
        }

        // Just like in the login method, we ensure the snake_case `provider_id`
        // from the API is correctly mapped to the camelCase `providerId` in our User model.
        const { provider_id, ...profileData } = userProfile;

        // A profile can only be fetched for an existing user, so we can safely update.
        const updatedUser: User = { ...currentUser, ...profileData };
        if (provider_id) {
          updatedUser.providerId = provider_id;
        }
        this._setCurrentUser(updatedUser);
        return updatedUser;
      })
    );
  }
   // Update user profile
  updateProfile(profileData: Partial<UserProfile>): Observable<User> {
    return this.apiService.post<void>('ServiceProvider/account', profileData).pipe(
      // After a successful update, fetch the fresh profile to update the stream automatically.
      switchMap(() => this.fetchUserProfile())
    );
  }

  // Change user password
  changePassword(passwordData: any): Observable<unknown> {
    // Assuming your backend endpoint for changing password is POST /ServiceProvider/change-password
    return this.apiService.post('ServiceProvider/provider-change-password', passwordData);
  }


  // Check authentication status
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  getUserStatus(): UserStatus | null {
    const user = this.currentUserSubject.value;
    return user ? user.status : null;
  }

  // Get JWT token
  getToken(): string | null {
    return localStorage.getItem(tokenStorageKey);
  }

  // Set JWT token
  private setToken(token: string): void {
    localStorage.setItem(tokenStorageKey, token);
  }

  // Get Provider ID
  getProviderId(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.providerId : null;
  }

  // Centralized method to set the current user and persist to storage
  private _setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(userStorageKey, JSON.stringify(user || null));
  }

  // Centralized method to clear all auth data
  private _clearAuthData(): void {
    localStorage.removeItem(tokenStorageKey); // Clear token
    localStorage.removeItem(userStorageKey); // Clear user data
    this.currentUserSubject.next(null); // Clear in-memory state
  }

  // Logout
  logout(redirectToLogin: boolean = true): void { // Already existed, just showing for context
    this._clearAuthData();
    if (redirectToLogin) {
      this.toastr.success('You have been logged out successfully.');
      this.router.navigate(['/login']);
    }
  }

  // Calling this from Header UI components to log out
  logoutFromServer(): void {
    this.apiService.post<void>('ServiceProvider/logout', {}).pipe(
      catchError(err => {
        console.error('Server logout failed. Proceeding with local logout.', err);
        return of(null); // Allows the stream to complete successfully
      }),
      // `finalize` ensures this block runs on success, error, or completion.
      finalize(() => {
        this.logout(); // Always perform local logout and redirect
      })
    ).subscribe();
  }

  // // Password reset request
  // requestPasswordReset(email: string): Observable<any> {
  //   return this.getHttpClient().post(`${environment.apiUrl}/auth/forgot-password`, { email });
  // }

  // // Verify password reset token
  // verifyResetToken(token: string): Observable<any> {
  //   return this.getHttpClient().get(`${environment.apiUrl}/auth/verify-reset-token?token=${token}`);
  // }

  requestVerificationEmail(email: string): Observable<unknown> {
    return this.apiService.post<unknown>('ServiceProvider/verify-email', { email });
  }

  verifyEmailToken(token: string): Observable<{ email: string }> {
    return this.apiService.get<{ email: string }>('ServiceProvider/email-verification', { params: { token } });
  }

  register(data: { name: string; email: string; password: string }): Observable<unknown> {
    return this.apiService.post<unknown>('ServiceProvider/register', data);
  }

  submitBusinessDetails(data: any): Observable<unknown> {
    return this.apiService.post<unknown>('ServiceProvider/business-register', data);
  }

  private navigateUserByStatus(status: UserStatus): void {
    switch (status) {
      case 'BASIC_REGISTERED':
        this.router.navigate(['/business-details']);
        break;
      case 'PENDING_APPROVAL':
        this.router.navigate(['/waiting-approval']);
        break;
      case 'APPROVED':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/login']); // Fallback to login
    }
  }
}