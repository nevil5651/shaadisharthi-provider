import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { LoginComponent } from './auth/login/login';
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { EmptyLayout } from './core/layouts/empty-layout/empty-layout';
import { AuthGuard } from './core/guards/auth-guard';
import { Account } from './features/account/account';
import { RegisterComponent } from './auth/register-provider/register-provider';
import { BusinessDetailsComponent } from './auth/business-details/business-details';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './auth/reset-password/reset-password';
import { EmailVerificationComponent } from './auth/email-verification/email-verification';
import { VerifyEmailMessageComponent } from './auth/verify-email-message/verify-email-message';
import { RoleGuard } from './core/guards/role-guard';
import { WaitingApproval } from './auth/waiting-approval/waiting-approval';
import { FaqsComponent } from './pages/faqs/faqs';
// import { UnauthorizedComponent } from './auth/unauthorized/unauthorized';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,  // Protected layout
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['SERVICE_PROVIDER'], status: 'APPROVED' },
    children: [
      { path: 'dashboard', component: Dashboard },
      {
        path: 'services',
        loadChildren: () => import('./modules/provider/services/services-module').then(m => m.ServicesModule)
      },
      {
        path: 'bookings',
        loadChildren: () => import('./features/bookings/bookings.routes').then(r => r.BOOKINGS_ROUTES)
      },
      { path: 'account', component: Account },
      { path: 'faqs', component: FaqsComponent, title: 'FAQs' },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: EmptyLayout,  // Public layout
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent, title: 'Register Provider' },
      {
        path: 'business-details',
        component: BusinessDetailsComponent,
        title: 'Business Details',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['SERVICE_PROVIDER'], status: 'BASIC_REGISTERED' }
      },
      {
        path: 'waiting-approval',
        component: WaitingApproval,
        title: 'Waiting for Approval',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['SERVICE_PROVIDER'], status: 'PENDING_APPROVAL' }
      },
      // {
      //   path: 'unauthorized',
      //   component: UnauthorizedComponent,
      //   title: 'Unauthorized'
      // },
      { path: 'forgot-password', component: ForgotPasswordComponent, title: 'Forgot Password' },
      { path: 'reset-password', component: ResetPasswordComponent, title: 'Reset Password' },
      { path: 'email-verification', component: EmailVerificationComponent, title: 'Email Verification' },
      { path: 'verify-email-message', component: VerifyEmailMessageComponent, title: 'Verify Email Message' },
    ]
  },
  { path: '**', redirectTo: 'login' }  // 404 handling
];
