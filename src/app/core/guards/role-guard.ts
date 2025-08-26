import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.authService.isInitialized$.pipe(
      filter(isInitialized => isInitialized), // Wait for AuthService to be ready
      take(1), // Complete the observable stream
      map(() => {
        const expectedRoles = route.data['roles'] as string[] | undefined;
        const expectedStatus = route.data['status'] as string | undefined;
        
        const userRole = this.authService.getUserRole();
        const userStatus = this.authService.getUserStatus();
        
        // Check if the user's role is one of the expected roles
        if (expectedRoles && (!userRole || !expectedRoles.includes(userRole))) {
          // Redirect to a safe page if role doesn't match
          return this.router.createUrlTree(['/login']);
        }
        
        // Check if the user's status matches the expected status
        if (expectedStatus && userStatus !== expectedStatus) {
          // Redirect to a safe page if status doesn't match
          return this.router.createUrlTree(['/login']);
        }
        
        return true;
      })
    );
  }
}